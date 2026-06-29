<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { formatIDR } from '$lib/utils/money';
  import { ShieldCheck } from '@lucide/svelte';
  export let data: any;
  type Goal = { current_amount: number; target_amount: number };
  let target_amount = '';
  let current_amount = '';
  $: total = data.goals.reduce((sum: number, goal: Goal) => sum + goal.current_amount, 0);
  $: target = data.goals.reduce((sum: number, goal: Goal) => sum + goal.target_amount, 0);
  $: pct = target ? Math.round((total / target) * 100) : 0;
  $: status = pct >= 100 ? 'Aman' : pct >= 80 ? 'Hampir aman' : pct >= 50 ? 'Cukup baik' : pct >= 25 ? 'Mulai terbentuk' : 'Belum aman';
  async function create() {
    await fetch('/api/goals', { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' }, body: JSON.stringify({ name: 'Dana Tak Terduga', target_amount: Number(target_amount), current_amount: Number(current_amount || 0), type: 'emergency' }) });
    target_amount = ''; current_amount = '';
    await invalidateAll();
  }
</script>

<section class="mx-auto max-w-3xl space-y-5">
  <div class="card p-5">
    <p class="section-label">Dana Tak Terduga</p>
    <h1 class="page-title mt-1 flex items-center gap-3"><ShieldCheck size={28} /> Dana tak terduga</h1>
    <p class="mt-2 text-sm text-muted">Pisahkan dana aman dari tabungan biasa.</p>
    <p class="mt-3 text-4xl font-black text-moss">{pct}%</p>
    <p class="text-muted">{status}: {formatIDR(total)} dari {formatIDR(target)}</p>
    <div class="mt-4 h-4 overflow-hidden rounded-full bg-stone-soft"><div class="h-full bg-moss" style={`width:${Math.min(100, pct)}%`}></div></div>
  </div>
  <form class="card grid gap-3 p-4 md:p-5 sm:grid-cols-[1fr_1fr_auto]" on:submit|preventDefault={create}>
    <input class="input" type="number" placeholder="Target, mis. 3000000" bind:value={target_amount} required />
    <input class="input" type="number" placeholder="Saldo awal" bind:value={current_amount} />
    <button class="btn-primary"><ShieldCheck size={18} /> Simpan</button>
  </form>
</section>
