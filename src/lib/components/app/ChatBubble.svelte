<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { formatIDR } from '$lib/utils/money';
  import { toDateInput } from '$lib/utils/date';
  import { Bot, CheckCircle2, Pencil, Save, SendHorizonal, Sparkles, X } from '@lucide/svelte';
  import { onMount } from 'svelte';

  let { csrfToken = '' } = $props();

  let open = $state(false);
  let message = $state('');
  let loading = $state(false);
  let saving = $state(false);
  let error = $state('');
  let success = $state('');
  let draft = $state<any>(null);

  onMount(() => {
    const openChat = () => (open = true);
    window.addEventListener('memoney:open-chat', openChat);
    return () => window.removeEventListener('memoney:open-chat', openChat);
  });

  function toTransactionPayload(input: any) {
    return {
      type: input.type,
      amount: input.amount,
      transaction_date: input.transaction_date,
      category_id: input.category_id ?? null,
      title: input.title ?? '',
      note: input.note ?? '',
      source: 'manual'
    };
  }

  async function parseMessage(saveImmediately = false) {
    const trimmed = message.trim();
    if (!trimmed || loading || saving) return;
    loading = true;
    error = '';
    success = '';
    draft = null;

    const res = await fetch('/api/chat/transaction', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify({ message: trimmed, today: toDateInput() })
    });
    const json: any = await res.json();
    loading = false;

    if (!json.ok) {
      error = json.error.message;
      return;
    }

    if (saveImmediately) {
      draft = json.data;
      await saveDraft();
      return;
    }

    draft = json.data;
  }

  async function saveDraft() {
    if (!draft || saving) return;
    saving = true;
    error = '';
    success = '';

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken },
      body: JSON.stringify(toTransactionPayload(draft))
    });
    const json: any = await res.json();
    saving = false;

    if (!json.ok) {
      error = json.error.message;
      return;
    }

    const savedTitle = draft.title;
    message = '';
    draft = null;
    success = `${savedTitle || 'Transaksi'} berhasil disimpan.`;
    await invalidateAll();
  }
</script>

<div class="fixed bottom-[5.75rem] right-3 z-30 md:bottom-5 md:right-5">
  {#if open}
    <section class="mb-3 max-h-[72dvh] w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden overflow-y-auto rounded-3xl border border-moss/15 bg-paper/95 shadow-2xl backdrop-blur-xl">
      <div class="bg-moss px-4 py-3 text-paper">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="flex items-center gap-2 text-sm font-black"><Bot size={17} /> Chat transaksi</p>
            <p class="mt-1 text-xs leading-5 text-stone-soft">Ketik singkat, lalu simpan langsung.</p>
          </div>
          <button class="grid size-11 shrink-0 place-items-center rounded-xl border border-paper/15 bg-paper/10" type="button" aria-label="Tutup chat" onclick={() => (open = false)}>
            <X size={17} />
          </button>
        </div>
      </div>
      <div class="p-3">
      <textarea
        class="input min-h-20 resize-none"
        bind:value={message}
        placeholder="makan bakso 20k"
        onkeydown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') parseMessage(true);
        }}
      ></textarea>

      <div class="mt-2 grid gap-2 sm:grid-cols-2">
        <button class="btn-secondary w-full" type="button" disabled={loading || saving || !message.trim()} onclick={() => parseMessage(false)}>
          <SendHorizonal size={17} /> Cek
        </button>
        <button class="btn-primary w-full" type="button" disabled={loading || saving || !message.trim()} onclick={() => parseMessage(true)}>
          <Save size={17} /> {loading || saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {#if error}
        <p class="mt-3 rounded-xl bg-rose-soft/30 p-3 text-sm text-ink">{error}</p>
      {/if}

      {#if success}
        <p class="mt-3 flex items-center gap-2 rounded-xl bg-sage/20 p-3 text-sm font-bold text-moss"><CheckCircle2 size={17} /> {success}</p>
      {/if}

      {#if draft}
        <div class="mt-3 rounded-xl border border-moss/10 bg-cream/60 p-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="flex items-center gap-2 font-black"><Sparkles size={16} /> Draft</p>
              <p class="mt-1 text-sm text-muted">{draft.title} · {draft.category_hint} · {draft.transaction_date}</p>
            </div>
            <p class="shrink-0 font-black {draft.type === 'income' ? 'text-moss' : 'text-clay'}">{draft.type === 'income' ? '+' : '-'}{formatIDR(draft.amount)}</p>
          </div>
          <button class="btn-primary mt-3 w-full" type="button" disabled={saving} onclick={saveDraft}><Save size={17} /> Simpan draft</button>
        </div>
      {/if}

      <p class="mt-3 text-center text-[11px] font-bold text-muted">Ctrl/⌘ + Enter untuk simpan cepat</p>
      </div>
    </section>
  {/if}

  <button
    class="hidden size-12 place-items-center rounded-2xl bg-moss text-paper shadow-2xl ring-2 ring-paper/70 transition hover:bg-ink md:grid"
    type="button"
    aria-label="Buka chat transaksi"
    onclick={() => (open = !open)}
  >
    {#if open}<X size={22} />{:else}<Bot size={22} />{/if}
  </button>
</div>
