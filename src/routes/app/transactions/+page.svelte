<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { formatIDR } from '$lib/utils/money';
  import { toDateInput } from '$lib/utils/date';
  import { ArrowDownCircle, ArrowUpCircle, CalendarDays, Coins, Save } from '@lucide/svelte';
  export let data: any;
  type Category = { id: string; name: string; type: string };
  let type: 'income' | 'expense' = 'expense';
  let amount = '';
  let transaction_date = toDateInput();
  let category_id = '';
  let title = '';
  let note = '';
  let saving = false;
  let error = '';

  async function submit() {
    saving = true;
    error = '';
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' },
      body: JSON.stringify({ type, amount: Number(amount), transaction_date, category_id: category_id || null, title, note, source: 'manual' })
    });
    const json: any = await res.json();
    saving = false;
    if (!json.ok) {
      error = json.error.message;
      return;
    }
    amount = '';
    title = '';
    note = '';
    await invalidateAll();
  }
</script>

<section class="grid gap-4 lg:grid-cols-[minmax(320px,400px)_1fr]">
  <form class="card h-fit space-y-4 p-4 md:p-5" on:submit|preventDefault={submit}>
    <div>
      <p class="section-label">Transaksi</p>
      <h1 class="page-title mt-1">Catat cepat</h1>
      <p class="mt-2 text-sm text-muted">Input minimal untuk pencatatan harian.</p>
    </div>
    {#if error}<p class="rounded-2xl bg-rose-soft/30 p-3 text-sm">{error}</p>{/if}
    <div class="grid grid-cols-2 gap-2">
      <button type="button" class="btn-secondary {type === 'expense' ? 'bg-clay/20 border-clay/40' : ''}" on:click={() => (type = 'expense')}><ArrowDownCircle size={18} /> Uang keluar</button>
      <button type="button" class="btn-secondary {type === 'income' ? 'bg-sage/30 border-moss/40' : ''}" on:click={() => (type = 'income')}><ArrowUpCircle size={18} /> Uang masuk</button>
    </div>
    <div>
      <label class="field-label" for="amount">Nominal</label>
      <div class="relative"><Coins class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={19} /><input class="input pl-10 text-2xl font-black" id="amount" bind:value={amount} inputmode="numeric" placeholder="25000" required /></div>
      <div class="mt-2 flex flex-wrap gap-2">
        {#each [10000, 20000, 50000, 100000, 500000] as chip}
          <button type="button" class="rounded-lg border border-moss/10 bg-stone-soft/60 px-3 py-1.5 text-sm font-bold text-ink" on:click={() => (amount = String(chip))}>{formatIDR(chip)}</button>
        {/each}
      </div>
    </div>
    <div>
      <label class="field-label" for="date">Tanggal</label>
      <div class="relative"><CalendarDays class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} /><input class="input pl-10" id="date" type="date" bind:value={transaction_date} required /></div>
    </div>
    <div>
      <label class="field-label" for="category">Kategori</label>
      <select class="input" id="category" bind:value={category_id}>
        <option value="">Lainnya</option>
        {#each (data.categories as Category[]).filter((cat) => cat.type === type) as cat}
          <option value={cat.id}>{cat.name}</option>
        {/each}
      </select>
    </div>
    <div>
      <label class="field-label" for="title">Judul / merchant</label>
      <input class="input" id="title" bind:value={title} placeholder="Makan siang" />
    </div>
    <div>
      <label class="field-label" for="note">Catatan</label>
      <textarea class="input min-h-24" id="note" bind:value={note}></textarea>
    </div>
    <button class="btn-primary w-full" disabled={saving}><Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan transaksi'}</button>
  </form>

  <section class="space-y-3">
    <div class="flex items-end justify-between gap-3">
      <div>
        <p class="section-label">History</p>
        <h2 class="text-xl font-black">Transaksi bulan ini</h2>
      </div>
    </div>
    {#each data.transactions as trx}
      <article class="card flex items-center justify-between gap-3 p-3.5">
        <div class="min-w-0">
          <p class="truncate font-bold">{trx.title || trx.merchant || (trx.type === 'income' ? 'Uang masuk' : 'Uang keluar')}</p>
          <p class="text-sm text-muted">{trx.transaction_date}</p>
        </div>
        <p class="font-black {trx.type === 'income' ? 'text-moss' : 'text-clay'}">{trx.type === 'income' ? '+' : '-'}{formatIDR(trx.amount)}</p>
      </article>
    {/each}
  </section>
</section>
