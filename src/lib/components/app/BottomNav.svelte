<script lang="ts">
  import { page } from '$app/stores';
  import {
    BadgeDollarSign,
    BarChart3,
    Bot,
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

  function openChat() {
    menuOpen = false;
    window.dispatchEvent(new CustomEvent('memoney:open-chat'));
  }
</script>

{#if menuOpen}
  <button class="fixed inset-0 z-30 bg-ink/35 backdrop-blur-sm md:hidden" type="button" aria-label="Tutup menu" on:click={() => (menuOpen = false)}></button>
  <section class="fixed inset-x-3 bottom-24 z-40 rounded-3xl border border-moss/10 bg-paper p-4 shadow-2xl md:hidden" aria-label="Menu lengkap">
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
          class="flex items-center gap-3 rounded-2xl border border-moss/10 px-3 py-3 text-sm font-bold transition {$page.url.pathname === item[1] ? 'bg-sky-soft/20 text-moss shadow-soft' : 'bg-cream/40 text-ink'}"
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

<nav class="fixed inset-x-0 bottom-0 z-20 border-t border-moss/10 bg-paper/96 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_34px_rgb(0_29_57_/_0.12)] backdrop-blur-xl md:hidden">
  <div class="mx-auto grid max-w-md grid-cols-5 gap-1">
    {#each primaryItems.slice(0, 2) as item}
      {@const Icon = item[2]}
      <a class="flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-center text-[11px] font-bold transition {$page.url.pathname === item[1] ? 'text-moss' : 'text-muted'}" href={item[1]} aria-label={item[0]}>
        <span class="grid size-8 place-items-center rounded-2xl transition {$page.url.pathname === item[1] ? 'bg-sky-soft/24 text-moss shadow-sm' : 'bg-transparent'}">
          <Icon size={18} strokeWidth={2.4} />
        </span>
        <span>{item[0]}</span>
      </a>
    {/each}
    <button
      class="flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-center text-[11px] font-bold text-muted transition"
      type="button"
      aria-label="Buka chat AI"
      on:click={openChat}
    >
      <span class="grid size-8 place-items-center rounded-2xl bg-sky-soft/24 text-moss shadow-sm transition">
        <Bot size={18} strokeWidth={2.4} />
      </span>
      <span>AI</span>
    </button>
    {#each primaryItems.slice(2) as item}
      {@const Icon = item[2]}
      <a class="flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-center text-[11px] font-bold transition {$page.url.pathname === item[1] ? 'text-moss' : 'text-muted'}" href={item[1]} aria-label={item[0]}>
        <span class="grid size-8 place-items-center rounded-2xl transition {$page.url.pathname === item[1] ? 'bg-sky-soft/24 text-moss shadow-sm' : 'bg-transparent'}">
          <Icon size={18} strokeWidth={2.4} />
        </span>
        <span>{item[0]}</span>
      </a>
    {/each}
    <button
      class="flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-center text-[11px] font-bold transition {menuOpen ? 'text-moss' : 'text-muted'}"
      type="button"
      aria-label="Buka semua menu"
      aria-expanded={menuOpen}
      on:click={() => (menuOpen = !menuOpen)}
    >
      <span class="grid size-8 place-items-center rounded-2xl transition {menuOpen ? 'bg-sky-soft/24 text-moss shadow-sm' : 'bg-transparent'}">
        <Grid3X3 size={18} strokeWidth={2.4} />
      </span>
      <span>Menu</span>
    </button>
  </div>
</nav>
