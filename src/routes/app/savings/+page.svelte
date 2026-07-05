<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import MoneyInput from '$lib/components/ui/MoneyInput.svelte';
  import { formatIDR } from '$lib/utils/money';
  import { Pencil, PiggyBank, PlusCircle, Save, Trash2, X } from '@lucide/svelte';
  export let data: any;
  type Goal = { id: string; name: string; target_amount: number; current_amount: number; type: 'saving' };
  let name = '';
  let target_amount = 0;
  let current_amount = 0;
  let editingId = '';
  let message = '';

  async function create() {
    const res = await fetch(editingId ? `/api/goals?id=${editingId}` : '/api/goals', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' },
      body: JSON.stringify({ name, target_amount, current_amount, type: 'saving' })
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
    name = goal.name;
    target_amount = goal.target_amount;
    current_amount = goal.current_amount;
    message = '';
  }

  function resetForm() {
    editingId = '';
    name = '';
    target_amount = 0;
    current_amount = 0;
    message = '';
  }

  async function deleteGoal(id: string) {
    if (!confirm('Hapus goal tabungan ini?')) return;
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

<section class="grid gap-5 lg:grid-cols-[380px_1fr]">
  <form class="card h-fit space-y-4 p-4 md:p-5" on:submit|preventDefault={create}>
    <div>
      <p class="section-label">Tabungan</p>
      <h1 class="page-title mt-1 flex items-center gap-2"><PiggyBank size={26} /> {editingId ? 'Edit goal' : 'Goals'}</h1>
      <p class="mt-2 text-sm text-muted">{editingId ? 'Ubah target atau saldo tabungan.' : 'Buat target dan pantau progresnya.'}</p>
    </div>
    {#if message}<p class="rounded-lg bg-rose-soft/30 p-3 text-sm font-bold">{message}</p>{/if}
    <label><span class="field-label">Nama goal</span><input class="input" bind:value={name} required placeholder="MacBook, dana nikah..." /></label>
    <MoneyInput id="saving-target" label="Target" bind:value={target_amount} required />
    <MoneyInput id="saving-current" label="Saldo sekarang" bind:value={current_amount} chips={[]} />
    <div class="grid gap-2 {editingId ? 'sm:grid-cols-2' : ''}">
      <button class="btn-primary w-full">{#if editingId}<Save size={18} /> Simpan perubahan{:else}<PlusCircle size={18} /> Buat goal{/if}</button>
      {#if editingId}
        <button class="btn-secondary w-full" type="button" on:click={resetForm}><X size={18} /> Batal</button>
      {/if}
    </div>
  </form>
  <div class="space-y-3">
    {#each data.goals as goal}
      <article class="card p-4 transition hover:border-moss/25">
        <div class="flex justify-between gap-3">
          <div class="min-w-0"><p class="truncate font-black">{goal.name}</p><p class="text-sm text-muted">{formatIDR(goal.current_amount)} dari {formatIDR(goal.target_amount)}</p></div>
          <div class="flex shrink-0 items-center gap-2">
            <p class="font-black text-moss">{goal.target_amount ? Math.round(goal.current_amount / goal.target_amount * 100) : 0}%</p>
            <button class="grid size-9 place-items-center rounded-lg border border-moss/10 bg-cream/60 text-moss" type="button" aria-label="Edit goal" on:click={() => editGoal(goal)}><Pencil size={16} /></button>
            <button class="grid size-9 place-items-center rounded-lg border border-moss/10 bg-paper text-clay" type="button" aria-label="Hapus goal" on:click={() => deleteGoal(goal.id)}><Trash2 size={16} /></button>
          </div>
        </div>
        <div class="mt-3 h-3 overflow-hidden rounded-full bg-stone-soft"><div class="h-full bg-moss" style={`width:${goal.target_amount ? Math.min(100, goal.current_amount / goal.target_amount * 100) : 0}%`}></div></div>
      </article>
    {/each}
  </div>
</section>
