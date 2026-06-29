<script lang="ts">
  let { from = $bindable(''), to = $bindable('') } = $props();
</script>

<div class="grid gap-3 sm:grid-cols-2">
  <label><span class="field-label">Dari</span><input class="input" type="date" bind:value={from} /></label>
  <label><span class="field-label">Sampai</span><input class="input" type="date" bind:value={to} /></label>
</div>
