<script lang="ts">
  let { children, variant = 'primary', type = 'button', ...rest }: { children?: import('svelte').Snippet; variant?: 'primary' | 'secondary'; type?: 'button' | 'submit' | 'reset'; [key: string]: unknown } = $props();
</script>

<button class={variant === 'primary' ? 'btn-primary' : 'btn-secondary'} {type} {...rest}>
  {@render children?.()}
</button>
