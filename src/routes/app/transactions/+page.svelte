<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import MoneyInput from '$lib/components/ui/MoneyInput.svelte';
  import { formatIDR } from '$lib/utils/money';
  import { toDateInput } from '$lib/utils/date';
  import { ArrowDownCircle, ArrowUpCircle, Bot, Pencil, Save, SendHorizonal, Sparkles, Trash2, X } from '@lucide/svelte';
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
  let chatMessage = '';
  let chatLoading = false;
  let chatError = '';
  let chatSaved = '';
  let chatDraft: any = null;

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

  async function saveTransactionPayload(payload: any) {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' },
      body: JSON.stringify(payload)
    });
    const json: any = await res.json();
    if (!json.ok) throw new Error(json.error.message);
    return json.data;
  }

  async function parseChat(saveImmediately = false) {
    const message = chatMessage.trim();
    if (!message) return;
    chatLoading = true;
    chatError = '';
    chatSaved = '';
    chatDraft = null;
    const res = await fetch('/api/chat/transaction', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' },
      body: JSON.stringify({ message, today: toDateInput() })
    });
    const json: any = await res.json();
    chatLoading = false;
    if (!json.ok) {
      chatError = json.error.message;
      return;
    }
    if (saveImmediately) {
      saving = true;
      try {
        await saveTransactionPayload(toTransactionPayload(json.data));
        chatMessage = '';
        chatSaved = 'Transaksi berhasil disimpan.';
        resetForm();
        await invalidateAll();
      } catch (err) {
        chatDraft = json.data;
        applyChatDraft(json.data);
        chatError = err instanceof Error ? err.message : 'Transaksi belum bisa disimpan.';
      } finally {
        saving = false;
      }
      return;
    }
    chatDraft = json.data;
    applyChatDraft(json.data);
  }

  function applyChatDraft(draft: any) {
    editingId = '';
    type = draft.type;
    amount = draft.amount;
    transaction_date = draft.transaction_date;
    category_id = draft.category_id ?? '';
    title = draft.title ?? '';
    note = draft.note ?? '';
    error = '';
  }

  function toTransactionPayload(draft: any) {
    return {
      type: draft.type,
      amount: draft.amount,
      transaction_date: draft.transaction_date,
      category_id: draft.category_id ?? null,
      title: draft.title ?? '',
      note: draft.note ?? '',
      source: 'manual'
    };
  }

  async function saveChatDraft() {
    if (!chatDraft) return;
    saving = true;
    chatError = '';
    chatSaved = '';
    try {
      await saveTransactionPayload(toTransactionPayload(chatDraft));
      chatMessage = '';
      chatDraft = null;
      chatSaved = 'Transaksi berhasil disimpan.';
      resetForm();
      await invalidateAll();
    } catch (err) {
      chatError = err instanceof Error ? err.message : 'Transaksi belum bisa disimpan.';
    } finally {
      saving = false;
    }
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

<section class="grid min-w-0 gap-3 md:gap-4 xl:grid-cols-[minmax(340px,420px)_1fr]">
  <div class="min-w-0 space-y-3 md:space-y-4">
  <section class="surface-panel hidden space-y-4 p-4 md:block md:p-5">
    <div>
      <div class="flex items-center gap-2">
        <span class="metric-icon"><Bot size={18} /></span>
        <p class="section-label">Chat AI</p>
      </div>
      <h2 class="mt-2 text-xl font-black">Catat pakai kalimat</h2>
      <p class="mt-1 text-sm text-muted">Contoh: “makan bakso 20k”, “beli baju 100 ribu”, “terima gaji 5 juta”.</p>
    </div>
    <div class="space-y-2">
      <input class="input" bind:value={chatMessage} placeholder="makan bakso 20k" on:keydown={(event) => event.key === 'Enter' && parseChat(false)} />
      <div class="grid gap-2 sm:grid-cols-2">
        <button class="btn-secondary w-full" type="button" disabled={chatLoading || !chatMessage.trim()} on:click={() => parseChat(false)}><SendHorizonal size={18} /> Cek draft</button>
        <button class="btn-primary w-full" type="button" disabled={chatLoading || saving || !chatMessage.trim()} on:click={() => parseChat(true)}><Save size={18} /> {chatLoading || saving ? 'Menyimpan...' : 'Simpan langsung'}</button>
      </div>
    </div>
    {#if chatSaved}
      <p class="rounded-2xl bg-sage/25 p-3 text-sm font-bold text-moss">{chatSaved}</p>
    {/if}
    {#if chatError}
      <p class="rounded-2xl bg-rose-soft/30 p-3 text-sm">{chatError}</p>
    {/if}
    {#if chatDraft}
      <div class="rounded-2xl border border-moss/10 bg-paper/70 p-3">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="flex items-center gap-2 font-black"><Sparkles size={17} /> Draft siap dicek</p>
            <p class="mt-1 text-sm text-muted">{chatDraft.title} · {chatDraft.category_hint} · {chatDraft.transaction_date}</p>
          </div>
          <p class="shrink-0 font-black {chatDraft.type === 'income' ? 'text-moss' : 'text-clay'}">{chatDraft.type === 'income' ? '+' : '-'}{formatIDR(chatDraft.amount)}</p>
        </div>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          <button class="btn-primary w-full" type="button" disabled={saving} on:click={saveChatDraft}><Save size={18} /> Simpan draft</button>
          <button class="btn-secondary w-full" type="button" on:click={() => applyChatDraft(chatDraft)}><Pencil size={18} /> Edit dulu</button>
        </div>
      </div>
    {/if}
  </section>

  <form class="surface-panel h-fit space-y-3 p-3.5 md:space-y-4 md:p-5" on:submit|preventDefault={submit}>
    <div>
      <p class="section-label">Transaksi</p>
      <h1 class="page-title mt-1">{editingId ? 'Edit transaksi' : 'Catat cepat'}</h1>
      <p class="mt-1 text-sm text-muted md:mt-2">{editingId ? 'Ubah detail transaksi yang sudah tersimpan.' : 'Input minimal untuk pencatatan harian.'}</p>
    </div>
    {#if error}<p class="rounded-2xl bg-rose-soft/30 p-3 text-sm">{error}</p>{/if}
    <div class="grid grid-cols-2 gap-2">
      <button type="button" class="btn-secondary min-w-0 min-h-11 px-2 text-sm {type === 'expense' ? 'bg-clay/20 border-clay/40 shadow-soft' : ''}" on:click={() => (type = 'expense')}><ArrowDownCircle class="shrink-0" size={17} /> <span class="min-w-0 truncate">Uang keluar</span></button>
      <button type="button" class="btn-secondary min-w-0 min-h-11 px-2 text-sm {type === 'income' ? 'bg-sage/30 border-moss/40 shadow-soft' : ''}" on:click={() => (type = 'income')}><ArrowUpCircle class="shrink-0" size={17} /> <span class="min-w-0 truncate">Uang masuk</span></button>
    </div>
    <MoneyInput id="amount" label="Nominal" bind:value={amount} large required />
    <div class="grid gap-3 sm:grid-cols-2">
    <div>
      <label class="field-label" for="date">Tanggal</label>
      <input class="input" id="date" type="date" bind:value={transaction_date} required />
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
  </div>

  <section class="min-w-0 space-y-2.5 md:space-y-3">
    <div class="surface-panel flex items-end justify-between gap-3 p-3.5 md:p-4">
      <div>
        <p class="section-label">History</p>
        <h2 class="text-xl font-black">Transaksi bulan ini</h2>
      </div>
    </div>
    {#each data.transactions as trx}
      <article class="list-row flex items-center justify-between gap-2 p-3 md:gap-3 md:p-3.5">
        <div class="min-w-0 flex-1">
          <p class="truncate font-bold">{trx.title || trx.merchant || (trx.type === 'income' ? 'Uang masuk' : 'Uang keluar')}</p>
          <p class="text-sm text-muted">{trx.transaction_date}{trx.note ? ` · ${trx.note}` : ''}</p>
          <p class="mt-1 font-black {trx.type === 'income' ? 'text-moss' : 'text-clay'} sm:hidden">{trx.type === 'income' ? '+' : '-'}{formatIDR(trx.amount)}</p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <p class="hidden font-black {trx.type === 'income' ? 'text-moss' : 'text-clay'} sm:block">{trx.type === 'income' ? '+' : '-'}{formatIDR(trx.amount)}</p>
          <button class="icon-button size-9" type="button" aria-label="Edit transaksi" on:click={() => editTransaction(trx)}><Pencil size={16} /></button>
          <button class="icon-button size-9 text-clay" type="button" aria-label="Hapus transaksi" on:click={() => deleteTransaction(trx.id)}><Trash2 size={16} /></button>
        </div>
      </article>
    {/each}
  </section>
</section>
