<script lang="ts">
  import { formatIDR } from '$lib/utils/money';
  let { label, amount, insight = '', tone = 'sage', icon = null } = $props();
  const toneClasses: Record<string, { icon: string; bar: string }> = {
    sage: { icon: 'bg-sage/25', bar: 'bg-sage' },
    'sky-soft': { icon: 'bg-sky-soft/35', bar: 'bg-sky-soft' },
    clay: { icon: 'bg-clay/20', bar: 'bg-clay' },
    'amber-soft': { icon: 'bg-amber-soft/30', bar: 'bg-amber-soft' }
  };
  let classes = $derived(toneClasses[tone] ?? toneClasses.sage);
</script>

<article class="metric-card group overflow-hidden">
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0">
      <p class="text-xs font-black uppercase tracking-wide text-muted">{label}</p>
      <p class="mt-2 metric-value text-ink">{formatIDR(amount)}</p>
    </div>
    {#if icon}
      {@const Icon = icon}
      <span class={`metric-icon shrink-0 ${classes.icon}`}>
        <Icon size={20} />
      </span>
    {/if}
  </div>
  {#if insight}<p class="mt-3 min-h-10 text-sm leading-5 text-muted">{insight}</p>{/if}
  <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-soft/70">
    <div class={`h-full w-2/3 rounded-full ${classes.bar} transition-all group-hover:w-5/6`}></div>
  </div>
</article>
