<script lang="ts">
  import { page } from '$app/stores';
  import { BadgeDollarSign, BarChart3, LayoutDashboard, ListChecks, PiggyBank, ScanLine, Settings, ShieldCheck } from '@lucide/svelte';
  import type { Component } from 'svelte';
  type NavItem = [string, string, Component];
  const items: NavItem[] = [
    ['Dashboard', '/app/dashboard', LayoutDashboard],
    ['Transaksi', '/app/transactions', ListChecks],
    ['Scan OCR', '/app/scan', ScanLine],
    ['Budget', '/app/budgets', BadgeDollarSign],
    ['Tabungan', '/app/savings', PiggyBank],
    ['Dana Tak Terduga', '/app/emergency', ShieldCheck],
    ['Rekap', '/app/reports', BarChart3],
    ['Settings', '/app/settings', Settings]
  ];
</script>

<aside class="nav-shell sticky top-0 hidden h-dvh w-72 shrink-0 border-r p-4 md:block">
  <a href="/app/dashboard" class="flex items-center gap-3 rounded-2xl border border-sky-soft/15 bg-paper/10 p-3 text-lg font-black text-paper">
    <img class="size-11 rounded-xl shadow-soft" src="/logo/memoney_symbol_dark_transparent_1024.png" alt="" />
    <span class="leading-none">me<span class="text-sky-soft">Money</span><span class="mt-1 block text-[11px] font-bold uppercase tracking-wide text-stone-soft/80">Track · Plan · Grow</span></span>
  </a>
  <nav class="mt-5 space-y-1.5">
    {#each items as item}
      {@const Icon = item[2]}
      <a class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition {$page.url.pathname === item[1] ? 'nav-link-active' : 'nav-link'}" href={item[1]}>
        <Icon size={18} />
        <span>{item[0]}</span>
      </a>
    {/each}
  </nav>
  <div class="absolute inset-x-4 bottom-4 rounded-2xl border border-sky-soft/15 bg-paper/10 p-3 text-xs text-stone-soft">
    <p class="font-black text-paper">Private by default</p>
    <p class="mt-1 leading-5 text-sky-soft">Cookie aman, D1/R2, dan AI draft tetap butuh konfirmasi.</p>
  </div>
</aside>
