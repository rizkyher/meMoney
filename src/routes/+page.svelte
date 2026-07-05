<script lang="ts">
  import { goto } from '$app/navigation';
  import { ArrowRight } from '@lucide/svelte';
</script>

<main class="min-h-dvh bg-cream px-5 py-10 text-ink">
  <section class="glass-panel mx-auto flex max-w-md flex-col gap-5 rounded-3xl p-6">
    <img class="h-auto w-56 max-w-full" src="/logo/memoney_logo_horizontal_light_transparent_2000.png" alt="meMoney" />
    <h1 class="page-title">Catat cepat, tetap tenang.</h1>
    <p class="text-muted">Pencatatan uang pribadi yang clean, nyaman, dan siap jalan di Cloudflare.</p>
    <button class="btn-primary" type="button" onclick={() => goto('/login')}>Masuk <ArrowRight size={18} /></button>
  </section>
</main>
