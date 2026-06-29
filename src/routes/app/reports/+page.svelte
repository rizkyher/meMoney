<script lang="ts">
  import { goto } from '$app/navigation';
  import { formatIDR } from '$lib/utils/money';
  import { BarChart3, Download, Filter } from '@lucide/svelte';
  export let data: any;
  let from = data.from;
  let to = data.to;
  function apply() { goto(`/app/reports?from=${from}&to=${to}`); }
</script>

<section class="space-y-5">
  <div>
    <p class="section-label">Rekap</p>
    <h1 class="page-title mt-1 flex items-center gap-3"><BarChart3 size={28} /> Laporan transaksi</h1>
    <p class="mt-2 text-sm text-muted">Filter rentang tanggal dan export CSV kapan saja.</p>
  </div>
  <div class="card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
    <input class="input" type="date" bind:value={from} />
    <input class="input" type="date" bind:value={to} />
    <button class="btn-secondary" on:click={apply}><Filter size={18} /> Filter</button>
    <a class="btn-primary text-center" href={`/api/reports/export.csv?from=${from}&to=${to}`}><Download size={18} /> Export CSV</a>
  </div>
  <div class="grid gap-4 sm:grid-cols-3">
    <div class="card p-4"><p class="text-sm text-muted">Pemasukan</p><p class="text-2xl font-black text-moss">{formatIDR(data.income)}</p></div>
    <div class="card p-4"><p class="text-sm text-muted">Pengeluaran</p><p class="text-2xl font-black text-clay">{formatIDR(data.expense)}</p></div>
    <div class="card p-4"><p class="text-sm text-muted">Net cashflow</p><p class="text-2xl font-black">{formatIDR(data.income - data.expense)}</p></div>
  </div>
  <div class="space-y-3">
    {#each data.transactions as trx}
      <article class="card flex justify-between gap-3 p-4"><span>{trx.title || trx.merchant || trx.transaction_date}</span><strong>{formatIDR(trx.amount)}</strong></article>
    {/each}
  </div>
</section>
