<script lang="ts">
  import { page } from '$app/stores';
  import {
    BadgeDollarSign,
    BarChart3,
    Grid3X3,
    Home,
    ListChecks,
    PiggyBank,
    ScanLine,
    Settings,
    ShieldCheck,
    X
  } from '@lucide/svelte';
  import type { Component } from 'svelte';
  type NavItem = [string, string, Component];
  let menuOpen = false;

  const primaryItems: NavItem[] = [
    ['Home', '/app/dashboard', Home],
    ['Transaksi', '/app/transactions', ListChecks],
    ['Scan', '/app/scan', ScanLine],
    ['Rekap', '/app/reports', BarChart3]
  ];

  const allItems: NavItem[] = [
    ['Dashboard', '/app/dashboard', Home],
    ['Transaksi', '/app/transactions', ListChecks],
    ['Scan OCR', '/app/scan', ScanLine],
    ['Budget', '/app/budgets', BadgeDollarSign],
    ['Tabungan', '/app/savings', PiggyBank],
    ['Dana Tak Terduga', '/app/emergency', ShieldCheck],
    ['Rekap', '/app/reports', BarChart3],
    ['Settings', '/app/settings', Settings]
  ];
</script>

{#if menuOpen}
  <button class="fixed inset-0 z-30 bg-ink/35 backdrop-blur-sm md:hidden" type="button" aria-label="Tutup menu" on:click={() => (menuOpen = false)}></button>
  <section class="fixed inset-x-3 bottom-20 z-40 rounded-3xl border border-moss/10 bg-paper/95 p-4 shadow-2xl md:hidden" aria-label="Menu lengkap">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        <p class="section-label">Menu</p>
        <h2 class="text-lg font-black">Semua fitur</h2>
      </div>
      <button class="grid size-10 place-items-center rounded-xl border border-moss/10 bg-cream/60" type="button" aria-label="Tutup menu" on:click={() => (menuOpen = false)}>
        <X size={18} />
      </button>
    </div>
    <div class="grid grid-cols-2 gap-2">
      {#each allItems as item}
        {@const Icon = item[2]}
        <a
          class="flex items-center gap-3 rounded-2xl border border-moss/10 px-3 py-3 text-sm font-bold transition {$page.url.pathname === item[1] ? 'bg-moss text-paper shadow-soft' : 'bg-cream/40 text-ink'}"
          href={item[1]}
          on:click={() => (menuOpen = false)}
        >
          <Icon size={18} />
          <span>{item[0]}</span>
        </a>
      {/each}
    </div>
  </section>
{/if}

<nav class="fixed inset-x-3 bottom-3 z-20 rounded-3xl border border-moss/10 bg-paper/90 px-2 py-2 shadow-2xl backdrop-blur-xl md:hidden">
  <div class="mx-auto grid max-w-md grid-cols-5 gap-1">
    {#each primaryItems as item}
      {@const Icon = item[2]}
      <a class="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center text-[11px] font-bold transition {$page.url.pathname === item[1] ? 'bg-moss text-paper shadow-sm' : 'text-muted'}" href={item[1]} aria-label={item[0]}>
        <Icon size={18} strokeWidth={2.4} />
        <span>{item[0]}</span>
      </a>
    {/each}
    <button
      class="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center text-[11px] font-bold transition {menuOpen ? 'bg-moss text-paper shadow-sm' : 'text-muted'}"
      type="button"
      aria-label="Buka semua menu"
      aria-expanded={menuOpen}
      on:click={() => (menuOpen = !menuOpen)}
    >
      <Grid3X3 size={18} strokeWidth={2.4} />
      <span>Menu</span>
    </button>
  </div>
</nav>
