<script lang="ts">
  let { open = false, children } = $props();
</script>

{#if open}
  <div class="fixed inset-0 z-40 flex items-end bg-ink/30 md:items-center md:justify-center">
    <div class="w-full rounded-t-3xl bg-paper p-5 shadow-soft md:max-w-lg md:rounded-3xl">
      {@render children?.()}
    </div>
  </div>
{/if}
