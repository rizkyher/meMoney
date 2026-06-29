<script lang="ts">
  import { page } from '$app/stores';
  import { BadgeDollarSign, BarChart3, Leaf, LayoutDashboard, ListChecks, PiggyBank, ScanLine, Settings, ShieldCheck } from '@lucide/svelte';
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

<aside class="nav-shell sticky top-0 hidden h-dvh w-68 shrink-0 border-r p-4 md:block">
  <a href="/app/dashboard" class="flex items-center gap-3 rounded-xl border border-sky-soft/15 bg-paper/10 p-3 text-lg font-black text-paper">
    <span class="grid size-10 place-items-center rounded-lg bg-sky-soft text-ink"><Leaf size={20} /></span>
    <span>Dompet <span class="text-sky-soft">Pribadi</span></span>
  </a>
  <nav class="mt-6 space-y-1">
    {#each items as item}
      {@const Icon = item[2]}
      <a class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition {$page.url.pathname === item[1] ? 'nav-link-active' : 'nav-link'}" href={item[1]}>
        <Icon size={18} />
        <span>{item[0]}</span>
      </a>
    {/each}
  </nav>
  <div class="absolute inset-x-4 bottom-4 rounded-xl border border-sky-soft/15 bg-paper/10 p-3 text-xs text-stone-soft">
    <p class="font-bold text-paper">Private by default</p>
    <p class="mt-1 text-sky-soft">Session cookie, D1, R2, OCR review.</p>
  </div>
</aside>
