<script lang="ts">
  import { formatIDR } from '$lib/utils/money';
  let { label, current, target, copy = 'Tabungan mulai tumbuh' } = $props();
  let pct = $derived(target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0);
</script>

<article class="metric-card transition hover:border-moss/25">
  <div class="flex items-start justify-between gap-3">
    <div>
      <p class="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      <p class="mt-2 text-xl font-black">{formatIDR(current)}</p>
    </div>
    <span class="rounded-md bg-sage/20 px-2.5 py-1 text-xs font-black text-moss">{pct}%</span>
  </div>
  <div class="mt-4 h-3 overflow-hidden rounded-full bg-stone-soft/70">
    <div class="h-full rounded-full bg-moss" style={`width:${pct}%`}></div>
  </div>
  <p class="mt-3 text-sm text-muted">{copy} dari target {formatIDR(target)}</p>
</article>
