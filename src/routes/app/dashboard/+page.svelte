<script lang="ts">
  import MoneyCard from '$lib/components/app/MoneyCard.svelte';
  import ProgressCard from '$lib/components/app/ProgressCard.svelte';
  import EmptyState from '$lib/components/app/EmptyState.svelte';
  import { formatIDR } from '$lib/utils/money';
  import { ArrowDownCircle, Landmark, Plus, ReceiptText, ScanLine, TrendingUp, WalletCards } from '@lucide/svelte';
  export let data: any;
  $: d = data.dashboard;
  $: dailyPct = d.dailyBudget.budget > 0 ? Math.min(100, Math.round((d.dailyBudget.spent / d.dailyBudget.budget) * 100)) : 0;
</script>

<section class="space-y-4 md:space-y-5">
  <section class="hero-card p-4 sm:p-5 md:p-6">
    <div class="relative grid min-w-0 gap-5 lg:grid-cols-[1.25fr_.9fr] lg:items-stretch">
      <div class="flex min-w-0 flex-col justify-between gap-6 lg:min-h-[272px]">
        <div>
          <div class="hero-chip"><WalletCards size={15} /> Dashboard</div>
          <h1 class="mt-4 max-w-[13ch] text-3xl font-black leading-tight sm:max-w-none md:text-4xl">Sisa jatah hari ini</h1>
          <p class="mt-2 max-w-xl text-sm leading-6 text-stone-soft">{d.greeting}. Fokus pada uang yang masih aman dipakai hari ini.</p>
        </div>

        <div class="min-w-0">
          <p class="text-sm font-bold uppercase tracking-wide text-sky-soft">Remaining allowance</p>
          <p class="money-hero-number mt-2 font-black">{formatIDR(d.dailyBudget.remaining)}</p>
          <div class="mt-5 h-2 overflow-hidden rounded-full bg-paper/20">
            <div class="h-full rounded-full bg-sky-soft" style={`width:${dailyPct}%`}></div>
          </div>
          <div class="mt-3 flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-xs font-bold leading-5 text-stone-soft">
            <span>Terpakai {formatIDR(d.dailyBudget.spent)}</span>
            <span>Budget {formatIDR(d.dailyBudget.budget)}</span>
          </div>
        </div>
      </div>

      <aside class="grid min-w-0 gap-3">
        <div class="summary-tile summary-tile-dark text-paper">
          <p class="text-xs font-bold uppercase tracking-wide text-sky-soft">Status</p>
          <p class="mt-2 text-xl font-black">{d.dailyBudget.remaining >= 0 ? 'Aman sampai malam' : 'Perlu rem kecil'}</p>
          <p class="mt-1 text-sm text-stone-soft">{d.dailyBudget.remaining >= 0 ? 'Ritme hari ini masih terkendali.' : 'Sedikit lewat budget. Rapikan lagi besok.'}</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <div class="summary-tile summary-tile-dark text-paper">
            <p class="text-xs font-bold uppercase tracking-wide text-sky-soft">Sisa bulan lalu</p>
            <p class="mt-2 text-lg font-black">{formatIDR(d.openingBalance ?? 0)}</p>
          </div>
          <div class="summary-tile summary-tile-dark text-paper">
            <p class="text-xs font-bold uppercase tracking-wide text-sky-soft">Saldo tersedia</p>
            <p class="mt-2 text-lg font-black">{formatIDR(d.availableBalance ?? d.netCashflow)}</p>
          </div>
          <div class="summary-tile summary-tile-dark text-paper">
            <p class="text-xs font-bold uppercase tracking-wide text-sky-soft">Bulan masuk</p>
            <p class="mt-2 text-lg font-black">{formatIDR(d.monthIncome)}</p>
          </div>
          <div class="summary-tile summary-tile-dark text-paper">
            <p class="text-xs font-bold uppercase tracking-wide text-sky-soft">Bulan keluar</p>
            <p class="mt-2 text-lg font-black">{formatIDR(d.monthExpense)}</p>
          </div>
        </div>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <a class="hero-action hero-action-primary" href="/app/transactions"><Plus size={18} /> Catat cepat</a>
          <a class="hero-action hero-action-secondary" href="/app/scan"><ScanLine size={18} /> Scan bukti</a>
        </div>
      </aside>
    </div>
  </section>

  <div class="flex items-end justify-between gap-3">
    <div>
      <p class="section-label">Overview</p>
      <h2 class="text-xl font-black">Arus kas dan aktivitas</h2>
    </div>
    <a class="hidden text-sm font-bold text-moss sm:inline-flex" href="/app/reports">Lihat rekap</a>
  </div>

  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <MoneyCard label="Uang keluar hari ini" amount={d.todayExpense} insight="Pantau yang kecil sebelum jadi besar." icon={ArrowDownCircle} />
    <MoneyCard label="Sisa bulan lalu" amount={d.openingBalance ?? 0} insight="Saldo bawaan otomatis dari transaksi sebelumnya." tone="sky-soft" icon={WalletCards} />
    <MoneyCard label="Uang keluar bulan ini" amount={d.monthExpense} insight="Pengeluaran konsumtif bulan ini." tone="clay" icon={ReceiptText} />
    <MoneyCard label="Saldo tersedia" amount={d.availableBalance ?? d.netCashflow} insight={(d.availableBalance ?? d.netCashflow) >= 0 ? 'Sudah termasuk sisa bulan sebelumnya.' : 'Saldo berjalan masih minus.'} tone="amber-soft" icon={TrendingUp} />
  </div>

  <div class="grid gap-3 lg:grid-cols-3">
    <ProgressCard label="Budget bulanan" current={d.monthlyBudget.spent} target={d.monthlyBudget.budget} copy="Progress budget bulanan" />
    <ProgressCard label="Tabungan" current={d.savings.current} target={d.savings.target} copy="Tabungan mulai tumbuh" />
    <ProgressCard label="Dana tak terduga" current={d.emergency.current} target={d.emergency.target} copy="Dana tak terduga makin aman" />
  </div>

  <section>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-xl font-black"><Landmark size={20} /> Transaksi terbaru</h2>
      <a class="text-sm font-bold text-moss" href="/app/transactions">Lihat semua</a>
    </div>
    {#if d.recent.length === 0}
      <EmptyState title="Belum ada transaksi" body="Catat pemasukan atau pengeluaran pertama hari ini." />
    {:else}
      <div class="space-y-3">
        {#each d.recent as trx}
          <article class="metric-card flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-bold">{trx.title || trx.merchant || (trx.type === 'income' ? 'Uang masuk' : 'Uang keluar')}</p>
              <p class="text-sm text-muted">{trx.transaction_date}</p>
            </div>
            <p class="shrink-0 font-black {trx.type === 'income' ? 'text-moss' : 'text-clay'}">{trx.type === 'income' ? '+' : '-'}{formatIDR(trx.amount)}</p>
          </article>
        {/each}
      </div>
    {/if}
  </section>
</section>
