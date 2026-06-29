<script lang="ts">
  let { value = 0 } = $props();
  let width = $derived(`${Math.max(0, Math.min(100, value))}%`);
</script>

<div class="h-3 overflow-hidden rounded-full bg-stone-soft" aria-label="Progress" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100" role="progressbar">
  <div class="h-full rounded-full bg-moss" style={`width:${width}`}></div>
</div>
