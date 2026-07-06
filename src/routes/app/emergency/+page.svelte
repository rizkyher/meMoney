<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import MoneyInput from '$lib/components/ui/MoneyInput.svelte';
  import { formatIDR } from '$lib/utils/money';
  import { Pencil, Save, ShieldCheck, Trash2, X } from '@lucide/svelte';
  export let data: any;
  type Goal = { id: string; name: string; current_amount: number; target_amount: number; type: 'emergency' };
  let target_amount = 0;
  let current_amount = 0;
  let editingId = '';
  let message = '';
  $: total = data.goals.reduce((sum: number, goal: Goal) => sum + goal.current_amount, 0);
  $: target = data.goals.reduce((sum: number, goal: Goal) => sum + goal.target_amount, 0);
  $: pct = target ? Math.round((total / target) * 100) : 0;
  $: status = pct >= 100 ? 'Aman' : pct >= 80 ? 'Hampir aman' : pct >= 50 ? 'Cukup baik' : pct >= 25 ? 'Mulai terbentuk' : 'Belum aman';
  async function create() {
    const res = await fetch(editingId ? `/api/goals?id=${editingId}` : '/api/goals', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' },
      body: JSON.stringify({ name: 'Dana Tak Terduga', target_amount, current_amount, type: 'emergency' })
    });
    const json: any = await res.json();
    if (!json.ok) {
      message = json.error.message;
      return;
    }
    resetForm();
    await invalidateAll();
  }

  function editGoal(goal: Goal) {
    editingId = goal.id;
    target_amount = goal.target_amount;
    current_amount = goal.current_amount;
    message = '';
  }

  function resetForm() {
    editingId = '';
    target_amount = 0;
    current_amount = 0;
    message = '';
  }

  async function deleteGoal(id: string) {
    if (!confirm('Hapus dana tak terduga ini?')) return;
    const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE', headers: { 'x-csrf-token': data.csrfToken ?? '' } });
    const json: any = await res.json();
    if (!json.ok) {
      message = json.error.message;
      return;
    }
    if (editingId === id) resetForm();
    await invalidateAll();
  }
</script>

<section class="mx-auto max-w-3xl space-y-5">
  <div class="hero-card p-5">
    <p class="section-label">Dana Tak Terduga</p>
    <h1 class="page-title mt-1 flex items-center gap-3"><ShieldCheck size={28} /> Dana tak terduga</h1>
    <p class="mt-2 text-sm text-stone-soft">Pisahkan dana aman dari tabungan biasa.</p>
    <p class="mt-4 text-5xl font-black text-paper">{pct}%</p>
    <p class="mt-1 text-sm font-bold text-stone-soft">{status}: {formatIDR(total)} dari {formatIDR(target)}</p>
    <div class="mt-4 h-4 overflow-hidden rounded-full bg-paper/15"><div class="h-full bg-sky-soft" style={`width:${Math.min(100, pct)}%`}></div></div>
  </div>
  <form class="surface-panel grid gap-3 p-4 md:p-5 sm:grid-cols-[1fr_1fr_auto]" on:submit|preventDefault={create}>
    <MoneyInput id="emergency-target" label="Target" bind:value={target_amount} placeholder="3.000.000" required />
    <MoneyInput id="emergency-current" label={editingId ? 'Saldo sekarang' : 'Saldo awal'} bind:value={current_amount} chips={[]} />
    <button class="btn-primary">{#if editingId}<Save size={18} /> Update{:else}<ShieldCheck size={18} /> Simpan{/if}</button>
    {#if editingId}
      <button class="btn-secondary sm:col-span-3" type="button" on:click={resetForm}><X size={18} /> Batal edit</button>
    {/if}
    {#if message}<p class="text-sm font-bold text-clay sm:col-span-3">{message}</p>{/if}
  </form>
  <div class="space-y-3">
    {#each data.goals as goal}
      <article class="list-row flex items-center justify-between gap-3 p-4">
        <div class="min-w-0">
          <p class="font-black">{formatIDR(goal.current_amount)}</p>
          <p class="text-sm text-muted">Target {formatIDR(goal.target_amount)}</p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button class="icon-button" type="button" aria-label="Edit dana tak terduga" on:click={() => editGoal(goal)}><Pencil size={17} /></button>
          <button class="icon-button text-clay" type="button" aria-label="Hapus dana tak terduga" on:click={() => deleteGoal(goal.id)}><Trash2 size={17} /></button>
        </div>
      </article>
    {/each}
  </div>
</section>
