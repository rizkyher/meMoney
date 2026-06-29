<script lang="ts">
  import { formatIDR } from '$lib/utils/money';
  let { value = $bindable(0), label = 'Nominal' } = $props();
  const chips = [10000, 20000, 50000, 100000, 500000];
</script>

<div>
  <label class="field-label" for="money-input">{label}</label>
  <input id="money-input" class="input text-2xl font-black" type="number" inputmode="numeric" bind:value min="0" />
  <div class="mt-2 flex flex-wrap gap-2">
    {#each chips as chip}
      <button type="button" class="rounded-full bg-stone-soft px-3 py-1 text-sm font-bold" onclick={() => (value = chip)}>{formatIDR(chip)}</button>
    {/each}
  </div>
</div>
