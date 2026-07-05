<script lang="ts">
  import { LockKeyhole, Mail, UserRound } from '@lucide/svelte';
  let { data, form } = $props();
  const isRegister = $derived(data.mode === 'register');
  const isSetup = $derived(data.needsSetup);
  const showName = $derived(isSetup || isRegister);
  const title = $derived(isSetup ? 'Buat akses pertama' : isRegister ? 'Daftar akun baru' : 'Masuk lagi');
  const action = $derived(isSetup ? '?/setup' : isRegister ? '?/register' : '?/login');
  const passwordAutocomplete = $derived(isSetup || isRegister ? 'new-password' : 'current-password');
  const buttonText = $derived(isSetup ? 'Buat akun' : isRegister ? 'Daftar dan masuk' : 'Masuk');
</script>

<main class="relative grid min-h-dvh place-items-center overflow-hidden bg-cream px-4 py-8 text-ink">
  <div class="hill hill-a"></div>
  <div class="hill hill-b"></div>
  <section class="glass-panel z-10 w-full max-w-md rounded-3xl p-6">
    <img class="mb-5 h-auto w-52 max-w-full" src="/logo/memoney_logo_horizontal_light_transparent_2000.png" alt="meMoney" />
    <h1 class="mt-2 text-3xl font-bold">{title}</h1>
    <p class="mt-2 text-sm text-muted">{isRegister ? 'Buat akun pribadi baru dengan ruang data sendiri.' : 'Scan dulu, nanti kamu cek sebelum disimpan.'}</p>
    {#if !isSetup}
      <div class="mt-5 grid grid-cols-2 rounded-xl bg-cream/60 p-1 text-sm font-black">
        <a class="rounded-lg px-3 py-2 text-center transition {data.mode === 'login' ? 'bg-paper text-ink shadow-sm' : 'text-muted'}" href="/login">Masuk</a>
        <a class="rounded-lg px-3 py-2 text-center transition {isRegister ? 'bg-paper text-ink shadow-sm' : 'text-muted'}" href="/login?mode=register">Daftar</a>
      </div>
    {/if}
    {#if form?.message}
      <p class="mt-4 rounded-2xl bg-rose-soft/30 px-4 py-3 text-sm text-ink">{form.message}</p>
    {/if}
    <form class="mt-6 space-y-4" method="POST" action={action}>
      {#if showName}
        <label class="field-label" for="name">Nama</label>
        <div class="relative"><UserRound class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} /><input class="input pl-10" id="name" name="name" autocomplete="name" required /></div>
      {/if}
      <label class="field-label" for="email">Email</label>
      <div class="relative"><Mail class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} /><input class="input pl-10" id="email" name="email" type="email" autocomplete="email" required /></div>
      <label class="field-label" for="password">Password</label>
      <div class="relative"><LockKeyhole class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} /><input class="input pl-10" id="password" name="password" type="password" autocomplete={passwordAutocomplete} minlength="8" required /></div>
      <button class="btn-primary w-full" type="submit"><LockKeyhole size={18} /> {buttonText}</button>
    </form>
  </section>
</main>
