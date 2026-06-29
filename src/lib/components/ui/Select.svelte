<script lang="ts">
  let { value = $bindable(), label = '', id = crypto.randomUUID(), children, ...rest } = $props();
</script>

<label>
  {#if label}<span class="field-label">{label}</span>{/if}
  <select class="input" bind:value {id} {...rest}>
    {@render children?.()}
  </select>
</label>
