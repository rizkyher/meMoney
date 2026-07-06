<script lang="ts">
  import AppShell from '$lib/components/app/AppShell.svelte';
  let { children, data } = $props();
</script>

<AppShell user={data.user} csrfToken={data.csrfToken}>
  {@render children()}
</AppShell>
