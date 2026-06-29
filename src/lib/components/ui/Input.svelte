<script lang="ts">
  let { value = $bindable(), label = '', id = crypto.randomUUID(), ...rest } = $props();
</script>

<label>
  {#if label}<span class="field-label">{label}</span>{/if}
  <input class="input" bind:value {id} {...rest} />
</label>
