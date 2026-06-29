<script lang="ts">
  import { LockKeyhole, Mail, Sprout } from '@lucide/svelte';
  let { data, form } = $props();
</script>

<main class="relative grid min-h-dvh place-items-center overflow-hidden bg-cream px-4 py-8 text-ink">
  <div class="hill hill-a"></div>
  <div class="hill hill-b"></div>
  <section class="glass-panel z-10 w-full max-w-md rounded-3xl p-6">
    <span class="mb-4 grid size-12 place-items-center rounded-2xl bg-moss text-paper"><Sprout size={24} /></span>
    <p class="text-sm font-semibold text-moss">Dompet Pribadi</p>
    <h1 class="mt-2 text-3xl font-bold">{data.needsSetup ? 'Buat akses pertama' : 'Masuk lagi'}</h1>
    <p class="mt-2 text-sm text-muted">Scan dulu, nanti kamu cek sebelum disimpan.</p>
    {#if form?.message}
      <p class="mt-4 rounded-2xl bg-rose-soft/30 px-4 py-3 text-sm text-ink">{form.message}</p>
    {/if}
    <form class="mt-6 space-y-4" method="POST" action={data.needsSetup ? '?/setup' : '?/login'}>
      {#if data.needsSetup}
        <label class="field-label" for="name">Nama</label>
        <input class="input" id="name" name="name" autocomplete="name" required />
      {/if}
      <label class="field-label" for="email">Email</label>
      <div class="relative"><Mail class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} /><input class="input pl-10" id="email" name="email" type="email" autocomplete="email" required /></div>
      <label class="field-label" for="password">Password</label>
      <div class="relative"><LockKeyhole class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} /><input class="input pl-10" id="password" name="password" type="password" autocomplete={data.needsSetup ? 'new-password' : 'current-password'} minlength="8" required /></div>
      <button class="btn-primary w-full" type="submit"><LockKeyhole size={18} /> {data.needsSetup ? 'Buat akun' : 'Masuk'}</button>
    </form>
  </section>
</main>
