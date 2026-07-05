<script lang="ts">
  import { goto } from '$app/navigation';
  import { ArrowRight, Leaf } from '@lucide/svelte';
</script>

<main class="min-h-dvh bg-cream px-5 py-10 text-ink">
  <section class="glass-panel mx-auto flex max-w-md flex-col gap-5 rounded-3xl p-6">
    <span class="grid size-12 place-items-center rounded-2xl bg-moss text-paper"><Leaf size={24} /></span>
    <p class="text-sm font-semibold text-moss">meMoney</p>
    <h1 class="page-title">Catat cepat, tetap tenang.</h1>
    <p class="text-muted">Pencatatan uang pribadi yang clean, nyaman, dan siap jalan di Cloudflare.</p>
    <button class="btn-primary" type="button" onclick={() => goto('/login')}>Masuk <ArrowRight size={18} /></button>
  </section>
</main>
