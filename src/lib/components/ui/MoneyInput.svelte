<script lang="ts">
  import { formatIDR, formatIDRInput, parseIDR } from '$lib/utils/money';
  let {
    value = $bindable(0),
    label = 'Nominal',
    id = 'money-input',
    placeholder = '25.000',
    required = false,
    large = false,
    disabled = false,
    chips = [10000, 20000, 50000, 100000, 500000],
    onValueChange = null
  } = $props();
  let display = $state(formatIDRInput(value));

  $effect(() => {
    const formatted = formatIDRInput(value);
    if (formatted !== display) display = formatted;
  });

  function update(next: string) {
    value = parseIDR(next);
    display = formatIDRInput(value);
    onValueChange?.(value);
  }

  function pick(amount: number) {
    value = amount;
    display = formatIDRInput(amount);
    onValueChange?.(amount);
  }
</script>

<div>
  <label class="field-label" for={id}>{label}</label>
  <input
    {id}
    class="input {large ? 'text-2xl font-black' : 'font-bold'}"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    value={display}
    {placeholder}
    {required}
    {disabled}
    oninput={(event) => update(event.currentTarget.value)}
  />
  {#if chips.length && !disabled}
    <div class="mt-2 flex flex-wrap gap-2">
      {#each chips as chip}
        <button type="button" class="min-h-[44px] shrink-0 rounded-xl border border-moss/10 bg-stone-soft/60 px-3 py-2 text-sm font-bold text-ink shadow-sm transition hover:border-moss/20 hover:bg-sky-soft/20" onclick={() => pick(chip)}>{formatIDR(chip)}</button>
      {/each}
    </div>
  {/if}
</div>
