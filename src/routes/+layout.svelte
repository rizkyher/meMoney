<script lang="ts">
  import '../app.css';
  let { children, data } = $props();
</script>

<svelte:head>
  <title>meMoney</title>
  <meta name="application-name" content="meMoney" />
  <meta name="description" content="Pencatatan uang pribadi yang clean, aman, dan nyaman dipakai harian." />
  <meta name="theme-color" content="#0A4174" />
  <meta name="theme-color" content="#0A4174" media="(prefers-color-scheme: light)" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="meMoney" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="format-detection" content="telephone=no" />
  <link rel="icon" href="/icons/favicon.png" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

{@render children()}
