<script lang="ts">
  import { goto } from '$app/navigation';
  import EmptyState from '$lib/components/app/EmptyState.svelte';
  import { formatIDR } from '$lib/utils/money';
  import { ArrowDownCircle, ArrowUpCircle, BarChart3, CalendarDays, Download, Filter, TrendingUp, WalletCards } from '@lucide/svelte';
  export let data: any;
  let from = data.from;
  let to = data.to;
  function apply() { goto(`/app/reports?from=${from}&to=${to}`); }
  $: exportHref = `/api/reports/export.csv?from=${from}&to=${to}`;
  $: netCashflow = data.income - data.expense;
  $: closingBalance = data.closingBalance ?? ((data.openingBalance ?? 0) + netCashflow);
</script>

<section class="space-y-5">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p class="section-label">Rekap</p>
      <h1 class="page-title mt-1 flex items-center gap-3"><BarChart3 size={28} /> Laporan transaksi</h1>
      <p class="mt-2 text-sm text-muted">Ringkasan arus kas dan export CSV yang siap dibuka di Excel atau Sheets.</p>
    </div>
    <a class="btn-primary w-full sm:w-auto" href={exportHref}><Download size={18} /> Export CSV</a>
  </div>

  <section class="surface-panel p-4 md:p-5">
    <div class="mb-3 flex items-center gap-2 text-sm font-black text-moss">
      <CalendarDays size={18} />
      Rentang laporan
    </div>
    <div class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <label>
        <span class="field-label">Dari</span>
        <input class="input" type="date" bind:value={from} />
      </label>
      <label>
        <span class="field-label">Sampai</span>
        <input class="input" type="date" bind:value={to} />
      </label>
      <button class="btn-secondary self-end" type="button" on:click={apply}><Filter size={18} /> Terapkan</button>
    </div>
  </section>

  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <div class="metric-card">
      <div class="mb-4 flex items-center justify-between gap-3">
        <p class="text-xs font-black uppercase tracking-wide text-muted">Saldo awal</p>
        <span class="metric-icon"><WalletCards size={18} /></span>
      </div>
      <p class="text-3xl font-black text-ink">{formatIDR(data.openingBalance ?? 0)}</p>
      <p class="mt-2 text-sm text-muted">Sisa uang sebelum tanggal mulai laporan.</p>
    </div>
    <div class="metric-card">
      <div class="mb-4 flex items-center justify-between gap-3">
        <p class="text-xs font-black uppercase tracking-wide text-muted">Pemasukan</p>
        <span class="metric-icon"><ArrowUpCircle size={18} /></span>
      </div>
      <p class="text-3xl font-black text-moss">{formatIDR(data.income)}</p>
      <p class="mt-2 text-sm text-muted">Total uang masuk dalam rentang ini.</p>
    </div>
    <div class="metric-card">
      <div class="mb-4 flex items-center justify-between gap-3">
        <p class="text-xs font-black uppercase tracking-wide text-muted">Pengeluaran</p>
        <span class="metric-icon"><ArrowDownCircle size={18} /></span>
      </div>
      <p class="text-3xl font-black text-clay">{formatIDR(data.expense)}</p>
      <p class="mt-2 text-sm text-muted">Total uang keluar dalam rentang ini.</p>
    </div>
    <div class="metric-card">
      <div class="mb-4 flex items-center justify-between gap-3">
        <p class="text-xs font-black uppercase tracking-wide text-muted">Saldo akhir</p>
        <span class="metric-icon"><TrendingUp size={18} /></span>
      </div>
      <p class="text-3xl font-black {closingBalance >= 0 ? 'text-moss' : 'text-ink'}">{formatIDR(closingBalance)}</p>
      <p class="mt-2 text-sm text-muted">Saldo awal + pemasukan - pengeluaran.</p>
    </div>
  </div>

  <section class="space-y-3">
    <div class="flex items-end justify-between gap-3">
      <div>
        <p class="section-label">Detail</p>
        <h2 class="text-xl font-black">Transaksi periode ini</h2>
      </div>
      <p class="text-sm font-bold text-muted">{data.transactions.length} item</p>
    </div>

    {#if data.transactions.length === 0}
      <EmptyState title="Belum ada transaksi" body="Coba pilih rentang tanggal lain atau catat transaksi baru." />
    {:else}
      <div class="space-y-3 md:hidden">
        {#each data.transactions as trx}
          <article class="list-row flex items-start justify-between gap-3 p-4">
            <div class="min-w-0">
              <p class="truncate font-black">{trx.title || trx.merchant || (trx.type === 'income' ? 'Uang masuk' : 'Uang keluar')}</p>
              <p class="mt-1 text-sm text-muted">{trx.transaction_date} · {trx.source === 'scan' ? 'Scan OCR' : 'Manual'}</p>
              {#if trx.note}
                <p class="mt-2 line-clamp-2 text-sm text-muted">{trx.note}</p>
              {/if}
            </div>
            <p class="shrink-0 text-right font-black {trx.type === 'income' ? 'text-moss' : 'text-clay'}">{trx.type === 'income' ? '+' : '-'}{formatIDR(trx.amount)}</p>
          </article>
        {/each}
      </div>

      <div class="surface-panel hidden overflow-x-auto p-0 md:block">
        <table class="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead class="border-b border-moss/10 bg-cream/40 text-xs font-black uppercase tracking-wide text-muted">
            <tr>
              <th class="px-4 py-3">Tanggal</th>
              <th class="px-4 py-3">Transaksi</th>
              <th class="px-4 py-3">Sumber</th>
              <th class="px-4 py-3 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {#each data.transactions as trx}
              <tr class="border-b border-moss/10 last:border-0">
                <td class="px-4 py-3 font-bold text-muted">{trx.transaction_date}</td>
                <td class="px-4 py-3">
                  <p class="font-black">{trx.title || trx.merchant || (trx.type === 'income' ? 'Uang masuk' : 'Uang keluar')}</p>
                  {#if trx.note}
                    <p class="mt-1 max-w-xl truncate text-sm text-muted">{trx.note}</p>
                  {/if}
                </td>
                <td class="px-4 py-3 font-bold text-muted">{trx.source === 'scan' ? 'Scan OCR' : 'Manual'}</td>
                <td class="px-4 py-3 text-right font-black {trx.type === 'income' ? 'text-moss' : 'text-clay'}">{trx.type === 'income' ? '+' : '-'}{formatIDR(trx.amount)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</section>
