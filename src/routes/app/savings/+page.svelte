<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { formatIDR } from '$lib/utils/money';
  import { PiggyBank, PlusCircle } from '@lucide/svelte';
  export let data: any;
  let name = '';
  let target_amount = '';
  let current_amount = '';
  async function create() {
    await fetch('/api/goals', { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' }, body: JSON.stringify({ name, target_amount: Number(target_amount), current_amount: Number(current_amount || 0), type: 'saving' }) });
    name = ''; target_amount = ''; current_amount = '';
    await invalidateAll();
  }
</script>

<section class="grid gap-5 lg:grid-cols-[380px_1fr]">
  <form class="card h-fit space-y-4 p-4 md:p-5" on:submit|preventDefault={create}>
    <div>
      <p class="section-label">Tabungan</p>
      <h1 class="page-title mt-1 flex items-center gap-2"><PiggyBank size={26} /> Goals</h1>
      <p class="mt-2 text-sm text-muted">Buat target dan pantau progresnya.</p>
    </div>
    <label><span class="field-label">Nama goal</span><input class="input" bind:value={name} required placeholder="MacBook, dana nikah..." /></label>
    <label><span class="field-label">Target</span><input class="input" type="number" bind:value={target_amount} required /></label>
    <label><span class="field-label">Saldo sekarang</span><input class="input" type="number" bind:value={current_amount} /></label>
    <button class="btn-primary w-full"><PlusCircle size={18} /> Buat goal</button>
  </form>
  <div class="space-y-3">
    {#each data.goals as goal}
      <article class="card p-4 transition hover:border-moss/25">
        <div class="flex justify-between gap-3"><div><p class="font-black">{goal.name}</p><p class="text-sm text-muted">{formatIDR(goal.current_amount)} dari {formatIDR(goal.target_amount)}</p></div><p class="font-black text-moss">{goal.target_amount ? Math.round(goal.current_amount / goal.target_amount * 100) : 0}%</p></div>
        <div class="mt-3 h-3 overflow-hidden rounded-full bg-stone-soft"><div class="h-full bg-moss" style={`width:${goal.target_amount ? Math.min(100, goal.current_amount / goal.target_amount * 100) : 0}%`}></div></div>
      </article>
    {/each}
  </div>
</section>
