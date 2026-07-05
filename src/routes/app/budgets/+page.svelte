<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import MoneyInput from '$lib/components/ui/MoneyInput.svelte';
  import { BadgeDollarSign, Save } from '@lucide/svelte';
  const labels = { daily: 'Jatah harian', weekly: 'Jatah mingguan', monthly: 'Jatah bulanan' };
  export let data: any;
  type Period = 'daily' | 'weekly' | 'monthly';
  type BudgetRow = { period: Period; amount: number; mode: 'manual' | 'auto' };
  let rows: BudgetRow[] = (['daily', 'weekly', 'monthly'] as Period[]).map((period) => (data.budgets as BudgetRow[]).find((b) => b.period === period) ?? { period, amount: 0, mode: period === 'daily' ? 'auto' : 'manual' });
  let saved = '';
  async function save() {
    const res = await fetch('/api/budgets', { method: 'PUT', headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' }, body: JSON.stringify({ budgets: rows }) });
    const json: any = await res.json();
    saved = json.ok ? 'Budget tersimpan.' : json.error.message;
    if (json.ok) await invalidateAll();
  }
</script>

<section class="mx-auto max-w-3xl space-y-5">
  <div>
    <p class="section-label">Budget</p>
    <h1 class="page-title mt-1 flex items-center gap-3"><BadgeDollarSign size={28} /> Atur jatah harian, mingguan, dan bulanan</h1>
    <p class="mt-2 text-sm text-muted">Tetapkan batas konsumsi dengan mode manual atau otomatis.</p>
  </div>
  <div class="card space-y-4 p-4 md:p-5">
    {#each rows as row}
      <div class="grid gap-3 rounded-lg border border-moss/10 bg-cream/55 p-4 sm:grid-cols-[1fr_220px_140px]">
        <div><p class="font-black">{labels[row.period]}</p><p class="text-sm text-muted">Manual atau auto sesuai kebutuhan.</p></div>
        <MoneyInput id={`budget-${row.period}`} label="Nominal" bind:value={row.amount} chips={[]} />
        <select class="input" bind:value={row.mode}><option value="manual">Manual</option><option value="auto">Auto</option></select>
      </div>
    {/each}
    {#if saved}<p class="text-sm font-bold text-moss">{saved}</p>{/if}
    <button class="btn-primary w-full" on:click={save}><Save size={18} /> Simpan budget</button>
  </div>
</section>
