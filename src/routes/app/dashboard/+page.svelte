<script lang="ts">
  import MoneyCard from '$lib/components/app/MoneyCard.svelte';
  import ProgressCard from '$lib/components/app/ProgressCard.svelte';
  import EmptyState from '$lib/components/app/EmptyState.svelte';
  import { formatIDR } from '$lib/utils/money';
  import {
    ArrowDownCircle,
    BadgeDollarSign,
    BarChart3,
    Landmark,
    ListChecks,
    PiggyBank,
    Plus,
    ReceiptText,
    ScanLine,
    ShieldCheck,
    TrendingUp,
    WalletCards
  } from '@lucide/svelte';
  export let data: any;
  $: d = data.dashboard;
  $: dailyPct = d.dailyBudget.budget > 0 ? Math.min(100, Math.round((d.dailyBudget.spent / d.dailyBudget.budget) * 100)) : 0;
  $: shortName = String(d.greeting ?? 'Selamat datang, User').replace('Selamat datang, ', '').split(' ')[0] || 'User';
</script>

<section class="space-y-4 md:space-y-5">
  <section class="hero-card mobile-bank-hero p-4 sm:p-5 md:p-6">
    <div class="relative grid min-w-0 gap-5 xl:grid-cols-[1.1fr_.9fr] xl:items-stretch">
      <div class="flex min-w-0 flex-col justify-between gap-6 xl:min-h-[260px]">
        <div>
          <div class="flex items-center justify-between gap-3 md:block">
            <div class="min-w-0">
              <div class="hero-chip desktop-hero-chip"><WalletCards size={15} /> Finance cockpit</div>
              <p class="text-xs font-black uppercase tracking-wide text-sky-soft md:hidden">meMoney Wallet</p>
              <h1 class="mt-1 truncate text-2xl font-black leading-tight md:mt-3 md:max-w-none md:text-4xl">Halo, {shortName}</h1>
            </div>
            <span class="rounded-full bg-paper/12 px-3 py-1.5 text-xs font-black text-stone-soft md:hidden">WIB</span>
          </div>
          <p class="mt-2 max-w-xl text-sm font-semibold leading-6 text-stone-soft md:mt-2 md:block hidden">{d.greeting}. Semua angka penting hari ini diringkas untuk keputusan cepat.</p>
          <p class="mt-2 text-sm font-semibold leading-6 text-stone-soft md:hidden">Ringkasan uang hari ini.</p>
        </div>

        <div class="mobile-balance-card min-w-0 rounded-3xl border border-paper/15 bg-paper/10 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-black uppercase tracking-wide text-sky-soft md:text-sky-soft">Saldo tersedia</p>
              <p class="money-hero-number mt-2 font-black">{formatIDR(d.availableBalance ?? d.netCashflow)}</p>
            </div>
            <div class="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-soft/20 text-sky-soft md:bg-paper/10">
              <WalletCards size={22} />
            </div>
          </div>
          <div class="mt-3 rounded-2xl bg-paper/12 p-3 md:mt-5 md:border md:border-paper/10">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-xs font-black uppercase tracking-wide text-sky-soft">Jatah hari ini</p>
                <p class="mt-1 text-xl font-black md:text-2xl">{formatIDR(d.dailyBudget.remaining)}</p>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-wide text-sky-soft">Status</p>
                <p class="mt-1 text-xl font-black md:text-2xl">{d.dailyBudget.remaining >= 0 ? 'Aman' : 'Lewat'}</p>
              </div>
            </div>
            <div class="mt-4 h-2 overflow-hidden rounded-full bg-paper/20">
              <div class="h-full rounded-full bg-sky-soft" style={`width:${dailyPct}%`}></div>
            </div>
            <div class="mt-3 flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-xs font-bold leading-5 text-stone-soft">
              <span>Terpakai {formatIDR(d.dailyBudget.spent)}</span>
              <span>Budget {formatIDR(d.dailyBudget.budget)}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 md:hidden">
          <a class="mobile-quick-action" href="/app/transactions"><span><Plus size={18} /></span>Catat</a>
          <a class="mobile-quick-action" href="/app/scan"><span><ScanLine size={18} /></span>Scan</a>
        </div>
      </div>

      <aside class="hidden min-w-0 content-between gap-3 md:grid">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="summary-tile summary-tile-dark text-paper">
            <p class="text-xs font-black uppercase tracking-wide text-sky-soft">Sisa bulan lalu</p>
            <p class="mt-2 text-xl font-black">{formatIDR(d.openingBalance ?? 0)}</p>
          </div>
          <div class="summary-tile summary-tile-dark text-paper">
            <p class="text-xs font-black uppercase tracking-wide text-sky-soft">Bulan masuk</p>
            <p class="mt-2 text-xl font-black">{formatIDR(d.monthIncome)}</p>
          </div>
          <div class="summary-tile summary-tile-dark text-paper">
            <p class="text-xs font-black uppercase tracking-wide text-sky-soft">Bulan keluar</p>
            <p class="mt-2 text-xl font-black">{formatIDR(d.monthExpense)}</p>
          </div>
          <div class="summary-tile summary-tile-dark text-paper">
            <p class="text-xs font-black uppercase tracking-wide text-sky-soft">Hari ini</p>
            <p class="mt-2 text-xl font-black">{formatIDR(d.todayExpense)}</p>
          </div>
        </div>
        <div class="grid gap-2 sm:grid-cols-2">
          <a class="hero-action hero-action-primary" href="/app/transactions"><Plus size={18} /> Catat cepat</a>
          <a class="hero-action hero-action-secondary" href="/app/scan"><ScanLine size={18} /> Scan bukti</a>
        </div>
      </aside>
    </div>
  </section>

  <section class="mobile-menu-panel p-3.5 md:hidden">
    <div class="mb-3 flex items-end justify-between gap-3">
      <div>
        <p class="section-label">Menu Utama</p>
        <h2 class="text-lg font-black">Akses cepat</h2>
      </div>
      <a class="inline-flex min-h-[44px] items-center rounded-xl px-2 text-sm font-black text-moss" href="/app/settings">Atur</a>
    </div>
    <div class="grid grid-cols-4 gap-2.5">
      <a class="mobile-menu-action" href="/app/transactions"><span><ListChecks size={20} /></span><strong>Transaksi</strong></a>
      <a class="mobile-menu-action" href="/app/scan"><span><ScanLine size={20} /></span><strong>Scan</strong></a>
      <a class="mobile-menu-action" href="/app/budgets"><span><BadgeDollarSign size={20} /></span><strong>Budget</strong></a>
      <a class="mobile-menu-action" href="/app/savings"><span><PiggyBank size={20} /></span><strong>Tabungan</strong></a>
      <a class="mobile-menu-action" href="/app/emergency"><span><ShieldCheck size={20} /></span><strong>Darurat</strong></a>
      <a class="mobile-menu-action" href="/app/reports"><span><BarChart3 size={20} /></span><strong>Rekap</strong></a>
      <a class="mobile-menu-action" href="/app/settings"><span><WalletCards size={20} /></span><strong>Akun</strong></a>
    </div>
  </section>

  <section class="surface-panel p-4 md:hidden">
    <div class="mb-3 flex items-end justify-between gap-3">
      <div>
        <p class="section-label">Overview</p>
        <h2 class="text-lg font-black">Ringkasan bulan ini</h2>
      </div>
      <a class="inline-flex min-h-[44px] items-center rounded-xl px-2 text-sm font-bold text-moss" href="/app/reports">Rekap</a>
    </div>
    <div class="divide-y divide-moss/10">
      <div class="flex items-center justify-between gap-3 py-3">
        <div class="min-w-0">
          <p class="font-bold">Keluar hari ini</p>
          <p class="text-xs font-bold text-muted">Pengeluaran terbaru hari ini</p>
        </div>
        <p class="shrink-0 font-black text-clay">{formatIDR(d.todayExpense)}</p>
      </div>
      <div class="flex items-center justify-between gap-3 py-3">
        <div class="min-w-0">
          <p class="font-bold">Bulan masuk</p>
          <p class="text-xs font-bold text-muted">Total pemasukan bulan ini</p>
        </div>
        <p class="shrink-0 font-black text-moss">{formatIDR(d.monthIncome)}</p>
      </div>
      <div class="flex items-center justify-between gap-3 py-3">
        <div class="min-w-0">
          <p class="font-bold">Bulan keluar</p>
          <p class="text-xs font-bold text-muted">Total pengeluaran bulan ini</p>
        </div>
        <p class="shrink-0 font-black text-clay">{formatIDR(d.monthExpense)}</p>
      </div>
      <div class="flex items-center justify-between gap-3 py-3">
        <div class="min-w-0">
          <p class="font-bold">Sisa bulan lalu</p>
          <p class="text-xs font-bold text-muted">Saldo bawaan otomatis</p>
        </div>
        <p class="shrink-0 font-black text-ink">{formatIDR(d.openingBalance ?? 0)}</p>
      </div>
    </div>
  </section>

  <section class="surface-panel p-4 md:hidden">
    <div class="mb-3">
      <p class="section-label">Target</p>
      <h2 class="text-lg font-black">Progress utama</h2>
    </div>
    <div class="space-y-3">
      <div>
        <div class="mb-2 flex items-center justify-between gap-3 text-sm font-black">
          <span>Budget bulanan</span>
          <span>{d.monthlyBudget.budget > 0 ? Math.min(100, Math.round((d.monthlyBudget.spent / d.monthlyBudget.budget) * 100)) : 0}%</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-stone-soft/70"><div class="h-full rounded-full bg-moss" style={`width:${d.monthlyBudget.budget > 0 ? Math.min(100, Math.round((d.monthlyBudget.spent / d.monthlyBudget.budget) * 100)) : 0}%`}></div></div>
        <p class="mt-1 text-xs font-bold text-muted">{formatIDR(d.monthlyBudget.spent)} dari {formatIDR(d.monthlyBudget.budget)}</p>
      </div>
      <div>
        <div class="mb-2 flex items-center justify-between gap-3 text-sm font-black">
          <span>Tabungan</span>
          <span>{d.savings.target > 0 ? Math.min(100, Math.round((d.savings.current / d.savings.target) * 100)) : 0}%</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-stone-soft/70"><div class="h-full rounded-full bg-sage" style={`width:${d.savings.target > 0 ? Math.min(100, Math.round((d.savings.current / d.savings.target) * 100)) : 0}%`}></div></div>
        <p class="mt-1 text-xs font-bold text-muted">{formatIDR(d.savings.current)} dari {formatIDR(d.savings.target)}</p>
      </div>
      <div>
        <div class="mb-2 flex items-center justify-between gap-3 text-sm font-black">
          <span>Dana darurat</span>
          <span>{d.emergency.target > 0 ? Math.min(100, Math.round((d.emergency.current / d.emergency.target) * 100)) : 0}%</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-stone-soft/70"><div class="h-full rounded-full bg-sky-soft" style={`width:${d.emergency.target > 0 ? Math.min(100, Math.round((d.emergency.current / d.emergency.target) * 100)) : 0}%`}></div></div>
        <p class="mt-1 text-xs font-bold text-muted">{formatIDR(d.emergency.current)} dari {formatIDR(d.emergency.target)}</p>
      </div>
    </div>
  </section>

  <div class="hidden items-end justify-between gap-3 md:flex">
    <div>
      <p class="section-label">Overview</p>
      <h2 class="text-xl font-black">Arus kas dan aktivitas</h2>
    </div>
    <a class="hidden text-sm font-bold text-moss sm:inline-flex" href="/app/reports">Lihat rekap</a>
  </div>

  <div class="hidden gap-3 sm:grid-cols-2 md:grid xl:grid-cols-4">
    <MoneyCard label="Uang keluar hari ini" amount={d.todayExpense} insight="Pantau yang kecil sebelum jadi besar." icon={ArrowDownCircle} />
    <MoneyCard label="Sisa bulan lalu" amount={d.openingBalance ?? 0} insight="Saldo bawaan otomatis dari transaksi sebelumnya." tone="sky-soft" icon={WalletCards} />
    <MoneyCard label="Uang keluar bulan ini" amount={d.monthExpense} insight="Pengeluaran konsumtif bulan ini." tone="clay" icon={ReceiptText} />
    <MoneyCard label="Saldo tersedia" amount={d.availableBalance ?? d.netCashflow} insight={(d.availableBalance ?? d.netCashflow) >= 0 ? 'Sudah termasuk sisa bulan sebelumnya.' : 'Saldo berjalan masih minus.'} tone="amber-soft" icon={TrendingUp} />
  </div>

  <div class="hidden gap-3 md:grid lg:grid-cols-3">
    <ProgressCard label="Budget bulanan" current={d.monthlyBudget.spent} target={d.monthlyBudget.budget} copy="Progress budget bulanan" />
    <ProgressCard label="Tabungan" current={d.savings.current} target={d.savings.target} copy="Tabungan mulai tumbuh" />
    <ProgressCard label="Dana tak terduga" current={d.emergency.current} target={d.emergency.target} copy="Dana tak terduga makin aman" />
  </div>

  <section>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-xl font-black"><Landmark size={20} /> Transaksi terbaru</h2>
      <a class="inline-flex min-h-[44px] items-center rounded-xl px-2 text-sm font-bold text-moss" href="/app/transactions">Lihat semua</a>
    </div>
    {#if d.recent.length === 0}
      <EmptyState title="Belum ada transaksi" body="Catat pemasukan atau pengeluaran pertama hari ini." />
    {:else}
      <div class="space-y-2.5">
        {#each d.recent as trx}
          <article class="list-row flex items-center justify-between gap-3 p-3.5">
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
