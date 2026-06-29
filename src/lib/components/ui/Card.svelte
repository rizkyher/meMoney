<script lang="ts">
  let { children, class: className = '' } = $props();
</script>

<section class={`card ${className}`}>
  {@render children?.()}
</section>
