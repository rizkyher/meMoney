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

<section class="mx-auto max-w-4xl space-y-5">
  <div>
    <p class="section-label">Budget</p>
    <h1 class="page-title mt-1 flex items-center gap-3"><BadgeDollarSign size={28} /> Atur jatah harian, mingguan, dan bulanan</h1>
    <p class="mt-2 text-sm text-muted">Isi satu jatah manual, lalu periode lain bisa otomatis mengikuti hitungan harian, mingguan, atau bulanan.</p>
  </div>
  <div class="surface-panel flex items-start gap-3 p-4 md:p-5">
    <span class="metric-icon"><Calculator size={18} /></span>
    <div class="min-w-0">
      <p class="font-black">Auto budget saling terhubung</p>
      <p class="mt-1 text-sm leading-6 text-muted">Contoh: jatah harian {formatIDR(50000)} otomatis menjadi mingguan {formatIDR(350000)} dan bulanan {formatIDR(1500000)}. Kalau kamu ubah jatah mingguan atau bulanan secara manual, periode auto akan dihitung ulang dari angka itu.</p>
    </div>
  </div>

  <div class="surface-panel space-y-4 p-4 md:p-5">
    {#each rows as row}
      <div class="list-row grid gap-4 p-4 sm:grid-cols-[1fr_230px_140px]">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-black">{labels[row.period]}</p>
            {#if row.mode === 'auto'}
              <span class="status-pill"><Lock size={13} /> Auto</span>
            {/if}
          </div>
          <p class="mt-1 text-sm text-muted">{periodCopy[row.period]}</p>
          <p class="mt-2 text-xs font-bold text-muted">{autoCopy(row)}</p>
        </div>
        <MoneyInput id={`budget-${row.period}`} label="Nominal" value={row.amount} disabled={row.mode === 'auto'} chips={[]} onValueChange={(amount: number) => setAmount(row.period, amount)} />
        <label>
          <span class="field-label">Mode</span>
          <select class="input" value={row.mode} onchange={(event) => setMode(row.period, event.currentTarget.value as 'manual' | 'auto')}>
            <option value="manual">Manual</option>
            <option value="auto">Auto</option>
          </select>
        </label>
      </div>
    {/each}
    {#if saved}<p class="text-sm font-bold text-moss">{saved}</p>{/if}
    <button class="btn-primary w-full" onclick={save}><Save size={18} /> Simpan budget</button>
  </div>
</section>
