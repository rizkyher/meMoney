<script lang="ts">
  import '../app.css';
  let { children, data } = $props();
</script>

<svelte:head>
  <title>Dompet Pribadi</title>
  <meta name="theme-color" content="#0A4174" />
  <link rel="icon" href="/icons/favicon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

{@render children()}
