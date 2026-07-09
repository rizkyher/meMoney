<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import MoneyInput from '$lib/components/ui/MoneyInput.svelte';
  import { budgetFormulaLabel, resolveAutoBudgetRows, type BudgetPeriod, type BudgetRow } from '$lib/utils/budget';
  import { formatIDR } from '$lib/utils/money';
  import { BadgeDollarSign, Calculator, Lock, Save } from '@lucide/svelte';
  const labels = { daily: 'Jatah harian', weekly: 'Jatah mingguan', monthly: 'Jatah bulanan' };
  const periodCopy = {
    daily: 'Batas aman untuk satu hari.',
    weekly: 'Dipakai untuk ritme 7 hari.',
    monthly: 'Dipakai untuk rencana 30 hari.'
  };
  export let data: any;
  let rows: BudgetRow[] = resolveAutoBudgetRows(
    (['daily', 'weekly', 'monthly'] as BudgetPeriod[]).map((period) => (data.budgets as BudgetRow[]).find((b) => b.period === period) ?? { period, amount: 0, mode: period === 'daily' ? 'manual' : 'auto' }),
    'daily'
  );
  let sourcePeriod: BudgetPeriod = rows.find((row) => row.mode === 'manual' && row.amount > 0)?.period ?? 'daily';
  let saved = '';

  function sourceRow() {
    return rows.find((row) => row.period === sourcePeriod && row.mode === 'manual' && row.amount > 0) ?? rows.find((row) => row.mode === 'manual' && row.amount > 0) ?? null;
  }

  function setAmount(period: BudgetPeriod, amount: number) {
    sourcePeriod = period;
    rows = resolveAutoBudgetRows(
      rows.map((row) => (row.period === period ? { ...row, amount, mode: 'manual' } : row)),
      period
    );
    saved = '';
  }

  function setMode(period: BudgetPeriod, mode: 'manual' | 'auto') {
    if (mode === 'manual') sourcePeriod = period;
    rows = resolveAutoBudgetRows(
      rows.map((row) => (row.period === period ? { ...row, mode } : row)),
      mode === 'manual' ? period : sourcePeriod
    );
    saved = '';
  }

  function autoCopy(row: BudgetRow) {
    const source = sourceRow();
    if (row.mode === 'manual') return 'Ketik nominal sendiri.';
    if (!source) return 'Isi salah satu jatah manual dulu.';
    return `${budgetFormulaLabel(source.period, row.period)}: ${formatIDR(row.amount)}`;
  }

  async function save() {
    const res = await fetch('/api/budgets', { method: 'PUT', headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' }, body: JSON.stringify({ budgets: rows }) });
    const json: any = await res.json();
    saved = json.ok ? 'Budget tersimpan.' : json.error.message;
    if (json.ok) await invalidateAll();
  }
</script>

<section class="mx-auto max-w-6xl space-y-3 md:space-y-4">
  <div class="surface-panel p-4 md:p-5">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-center">
      <div class="min-w-0">
        <p class="section-label">Budget</p>
        <h1 class="page-title mt-1 flex items-center gap-2"><BadgeDollarSign class="shrink-0" size={25} /> Atur jatah uang</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-muted">Pilih satu periode sebagai sumber manual. Periode lain bisa otomatis mengikuti supaya jatah harian, mingguan, dan bulanan selalu sinkron.</p>
      </div>
      <div class="rounded-2xl border border-moss/10 bg-cream/45 p-4">
        <div class="flex items-start gap-3">
          <span class="metric-icon shrink-0"><Calculator size={18} /></span>
          <div class="min-w-0">
            <p class="font-black">Auto budget</p>
            <p class="mt-1 text-sm leading-6 text-muted">Harian {formatIDR(50000)} otomatis menjadi mingguan {formatIDR(350000)} dan bulanan {formatIDR(1500000)}.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="surface-panel space-y-4 p-4 md:p-5">
    <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="section-label">Periode</p>
        <h2 class="text-xl font-black">Jatah aktif</h2>
      </div>
      <p class="text-sm font-bold leading-6 text-muted md:max-w-md md:text-right">Ubah nominal di kartu manual, lalu kartu auto akan menghitung ulang otomatis.</p>
    </div>

    <div class="grid gap-3 lg:grid-cols-3">
      {#each rows as row}
        <div class="list-row flex min-w-0 flex-col gap-4 p-4">
          <div class="flex min-w-0 items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-black">{labels[row.period]}</p>
              <p class="mt-1 text-sm leading-6 text-muted">{periodCopy[row.period]}</p>
            </div>
            <span class="status-pill shrink-0">
              {#if row.mode === 'auto'}<Lock size={13} /> Auto{:else}Manual{/if}
            </span>
          </div>

          <p class="min-h-[44px] rounded-xl bg-cream/55 px-3 py-2 text-xs font-bold leading-5 text-muted">{autoCopy(row)}</p>

          <div class="mt-auto space-y-3">
            <MoneyInput id={`budget-${row.period}`} label="Nominal" value={row.amount} disabled={row.mode === 'auto'} chips={[]} onValueChange={(amount: number) => setAmount(row.period, amount)} />
            <label>
              <span class="field-label">Mode</span>
              <select class="input" value={row.mode} onchange={(event) => setMode(row.period, event.currentTarget.value as 'manual' | 'auto')}>
                <option value="manual">Manual</option>
                <option value="auto">Auto</option>
              </select>
            </label>
          </div>
        </div>
      {/each}
    </div>

    {#if saved}<p class="rounded-2xl bg-sage/20 p-3 text-sm font-bold text-moss">{saved}</p>{/if}
    <div class="flex justify-end">
      <button class="btn-primary w-full md:w-auto md:min-w-56" onclick={save}><Save size={18} /> Simpan budget</button>
    </div>
  </div>
</section>
