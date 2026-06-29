<script lang="ts">
  let { children } = $props();
</script>

<span class="inline-flex rounded-full bg-sage/30 px-3 py-1 text-xs font-black text-moss">
  {@render children?.()}
</span>
