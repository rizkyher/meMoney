<script lang="ts">
  import { Search } from '@lucide/svelte';
  let { user } = $props();
</script>

<header class="sticky top-0 z-10 bg-ink px-4 py-3 text-paper shadow-[0_12px_28px_rgb(0_29_57_/_0.18)] backdrop-blur-xl md:border-b md:border-moss/10 md:bg-paper/78 md:px-6 md:py-3 md:text-ink md:shadow-none lg:px-8">
  <div class="content-wrap flex items-center justify-between gap-3">
    <div class="min-w-0">
      <p class="text-sm font-black text-paper md:text-xs md:uppercase md:text-moss">meMoney</p>
      <p class="hidden truncate text-sm font-semibold text-muted md:block">Catat, pantau, dan rencanakan uang harian</p>
    </div>
    <div class="hidden min-w-72 items-center gap-2 rounded-xl border border-moss/10 bg-paper/90 px-3 py-2 text-sm font-semibold text-muted shadow-sm lg:flex">
      <Search size={16} />
      <span>Cari transaksi, scan, atau rekap</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="max-w-28 truncate rounded-full border border-paper/15 bg-paper/12 px-3 py-2 text-sm font-black text-paper shadow-sm md:max-w-none md:rounded-xl md:border-moss/10 md:bg-paper/90 md:text-ink">{user?.name ?? 'Rizky'}</div>
    </div>
  </div>
</header>
