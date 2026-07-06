<script lang="ts">
  import { goto } from '$app/navigation';
  import { ArrowRight } from '@lucide/svelte';
</script>

<main class="grid min-h-dvh place-items-center bg-cream px-5 py-10 text-ink">
  <section class="hero-card mx-auto flex w-full max-w-lg flex-col gap-5 p-6">
    <img class="h-auto w-56 max-w-full" src="/logo/memoney_logo_horizontal_light_transparent_2000.png" alt="meMoney" />
    <div>
      <p class="hero-chip">Mobile-first finance tracker</p>
      <h1 class="page-title mt-4 text-paper">Catat cepat, tetap tenang.</h1>
      <p class="mt-3 text-sm leading-6 text-stone-soft">Pencatatan uang pribadi yang clean, aman, dan siap jalan di Cloudflare.</p>
    </div>
    <button class="hero-action hero-action-primary" type="button" onclick={() => goto('/login')}>Masuk <ArrowRight size={18} /></button>
  </section>
</main>
