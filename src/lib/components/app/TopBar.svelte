<script lang="ts">
  import { Bell, Search } from '@lucide/svelte';
  let { user } = $props();
</script>

<header class="sticky top-0 z-10 border-b border-moss/10 bg-paper/72 px-4 py-3 backdrop-blur-xl md:px-6 lg:px-8">
  <div class="content-wrap flex items-center justify-between gap-3">
    <div class="min-w-0">
      <p class="text-xs font-black uppercase tracking-wide text-moss">meMoney workspace</p>
      <p class="truncate text-sm font-semibold text-muted">Catat, pantau, dan rencanakan uang harian</p>
    </div>
    <div class="hidden min-w-72 items-center gap-2 rounded-xl border border-moss/10 bg-paper/90 px-3 py-2 text-sm font-semibold text-muted shadow-sm lg:flex">
      <Search size={16} />
      <span>Cari transaksi, scan, atau rekap</span>
    </div>
    <div class="flex items-center gap-2">
      <button class="grid size-10 place-items-center rounded-xl border border-moss/10 bg-paper/90 shadow-sm" type="button" aria-label="Notifikasi">
        <Bell size={18} />
      </button>
      <div class="rounded-xl border border-moss/10 bg-paper/90 px-3 py-2 text-sm font-black shadow-sm">{user?.name ?? 'Rizky'}</div>
    </div>
  </div>
</header>
