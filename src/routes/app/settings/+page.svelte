<script lang="ts">
  import { goto } from '$app/navigation';
  import { LogOut, Settings, ShieldCheck } from '@lucide/svelte';
  export let data: any;
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', headers: { 'x-csrf-token': data.csrfToken ?? '' } });
    await goto('/login');
  }
</script>

<section class="mx-auto max-w-3xl space-y-5">
  <div>
    <p class="section-label">Settings</p>
    <h1 class="page-title mt-1 flex items-center gap-3"><Settings size={28} /> Preferensi dan privasi</h1>
    <p class="mt-2 text-sm text-muted">Kontrol profil, mode scan, dan preferensi penyimpanan.</p>
  </div>
  <div class="card space-y-4 p-4 md:p-5">
    <div><p class="field-label">Profile</p><p class="font-black">{data.user.name}</p><p class="text-sm text-muted">{data.user.email}</p></div>
    <label><span class="field-label">Theme</span><select class="input"><option>System</option><option>Light</option><option>Dark</option></select></label>
    <label class="flex items-center gap-3 rounded-2xl bg-stone-soft/60 p-3 text-sm font-bold"><input type="checkbox" /> <ShieldCheck size={18} /> AI scan enabled (default off)</label>
    <label class="flex items-center gap-3 rounded-2xl bg-stone-soft/60 p-3 text-sm font-bold"><input type="checkbox" /> Save receipt default</label>
    <button class="btn-secondary w-full" on:click={logout}><LogOut size={18} /> Logout</button>
  </div>
</section>
