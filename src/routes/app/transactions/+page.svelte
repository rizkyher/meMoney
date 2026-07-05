<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import MoneyInput from '$lib/components/ui/MoneyInput.svelte';
  import { formatIDR } from '$lib/utils/money';
  import { toDateInput } from '$lib/utils/date';
  import { ArrowDownCircle, ArrowUpCircle, CalendarDays, Pencil, Save, Trash2, X } from '@lucide/svelte';
  export let data: any;
  type Category = { id: string; name: string; type: string };
  type TransactionRow = {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    transaction_date: string;
    category_id?: string | null;
    title?: string | null;
    merchant?: string | null;
    note?: string | null;
  };
  let type: 'income' | 'expense' = 'expense';
  let amount = 0;
  let transaction_date = toDateInput();
  let category_id = '';
  let title = '';
  let note = '';
  let saving = false;
  let error = '';
  let editingId = '';

  async function submit() {
    saving = true;
    error = '';
    const payload = { type, amount, transaction_date, category_id: category_id || null, title, note, source: 'manual' };
    const res = await fetch(editingId ? `/api/transactions/${editingId}` : '/api/transactions', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' },
      body: JSON.stringify(payload)
    });
    const json: any = await res.json();
    saving = false;
    if (!json.ok) {
      error = json.error.message;
      return;
    }
    resetForm();
    await invalidateAll();
  }

  function resetForm() {
    editingId = '';
    amount = 0;
    title = '';
    note = '';
    category_id = '';
    type = 'expense';
    transaction_date = toDateInput();
  }

  function editTransaction(trx: TransactionRow) {
    editingId = trx.id;
    type = trx.type;
    amount = trx.amount;
    transaction_date = trx.transaction_date;
    category_id = trx.category_id ?? '';
    title = trx.title ?? trx.merchant ?? '';
    note = trx.note ?? '';
    error = '';
  }

  async function deleteTransaction(id: string) {
    if (!confirm('Hapus transaksi ini?')) return;
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'x-csrf-token': data.csrfToken ?? '' }
    });
    const json: any = await res.json();
    if (!json.ok) {
      error = json.error.message;
      return;
    }
    if (editingId === id) resetForm();
    await invalidateAll();
  }
</script>

<section class="grid gap-4 lg:grid-cols-[minmax(320px,400px)_1fr]">
  <form class="card h-fit space-y-4 p-4 md:p-5" on:submit|preventDefault={submit}>
    <div>
      <p class="section-label">Transaksi</p>
      <h1 class="page-title mt-1">{editingId ? 'Edit transaksi' : 'Catat cepat'}</h1>
      <p class="mt-2 text-sm text-muted">{editingId ? 'Ubah detail transaksi yang sudah tersimpan.' : 'Input minimal untuk pencatatan harian.'}</p>
    </div>
    {#if error}<p class="rounded-2xl bg-rose-soft/30 p-3 text-sm">{error}</p>{/if}
    <div class="grid grid-cols-2 gap-2">
      <button type="button" class="btn-secondary {type === 'expense' ? 'bg-clay/20 border-clay/40' : ''}" on:click={() => (type = 'expense')}><ArrowDownCircle size={18} /> Uang keluar</button>
      <button type="button" class="btn-secondary {type === 'income' ? 'bg-sage/30 border-moss/40' : ''}" on:click={() => (type = 'income')}><ArrowUpCircle size={18} /> Uang masuk</button>
    </div>
    <MoneyInput id="amount" label="Nominal" bind:value={amount} large required />
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
    <div class="grid gap-2 {editingId ? 'sm:grid-cols-2' : ''}">
      <button class="btn-primary w-full" disabled={saving}><Save size={18} /> {saving ? 'Menyimpan...' : editingId ? 'Update transaksi' : 'Simpan transaksi'}</button>
      {#if editingId}
        <button class="btn-secondary w-full" type="button" on:click={resetForm}><X size={18} /> Batal</button>
      {/if}
    </div>
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
          <p class="text-sm text-muted">{trx.transaction_date}{trx.note ? ` · ${trx.note}` : ''}</p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <p class="hidden font-black {trx.type === 'income' ? 'text-moss' : 'text-clay'} sm:block">{trx.type === 'income' ? '+' : '-'}{formatIDR(trx.amount)}</p>
          <button class="grid size-10 place-items-center rounded-lg border border-moss/10 bg-cream/60 text-moss" type="button" aria-label="Edit transaksi" on:click={() => editTransaction(trx)}><Pencil size={17} /></button>
          <button class="grid size-10 place-items-center rounded-lg border border-moss/10 bg-paper text-clay" type="button" aria-label="Hapus transaksi" on:click={() => deleteTransaction(trx.id)}><Trash2 size={17} /></button>
        </div>
      </article>
    {/each}
  </section>
</section>
