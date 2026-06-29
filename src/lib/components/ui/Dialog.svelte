<script lang="ts">
  let { open = false, children } = $props();
</script>

{#if open}
  <div class="fixed inset-0 z-40 grid place-items-center bg-ink/30 p-4">
    <div class="card w-full max-w-lg p-5">
      {@render children?.()}
    </div>
  </div>
{/if}
