<script lang="ts">
  import { runOcr, terminateOcr } from '$lib/utils/ocr';
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { CheckCircle2, CloudUpload, FileImage, ScanLine, ShieldCheck } from '@lucide/svelte';
  export let data: any;
  type Category = { id: string; name: string; type: string };
  let file: File | null = null;
  let preview = '';
  let progress = 0;
  let rawText = '';
  let draft: any = null;
  let saveImage = false;
  let status = 'idle';
  let error = '';

  async function choose(event: Event) {
    const input = event.target as HTMLInputElement;
    file = input.files?.[0] ?? null;
    if (!file) return;
    preview = URL.createObjectURL(file);
    status = 'preview';
  }

  async function scan() {
    if (!file) return;
    status = 'ocr_running';
    error = '';
    const result = await runOcr(file, (value) => (progress = Math.round(value * 100)));
    rawText = result.text;
    const res = await fetch('/api/scan/parse', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' },
      body: JSON.stringify({ ocr_text: rawText, use_ai: false, image_base64: null })
    });
    const json: any = await res.json();
    if (!json.ok) {
      error = json.error.message;
      status = 'error';
      return;
    }
    draft = json.data;
    status = 'parsed';
  }

  async function save() {
    if (!draft) return;
    let receipt_image_key = null;
    if (saveImage && file) {
      const form = new FormData();
      form.set('file', file);
      const upload = await fetch('/api/attachments', { method: 'POST', headers: { 'x-csrf-token': data.csrfToken ?? '' }, body: form });
      const uploadJson: any = await upload.json();
      if (uploadJson.ok) receipt_image_key = uploadJson.data.key;
    }
    const category = (data.categories as Category[]).find((cat) => cat.name === draft.category_hint);
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': data.csrfToken ?? '' },
      body: JSON.stringify({
        type: draft.type,
        amount: draft.amount,
        transaction_date: draft.transaction_date,
        merchant: draft.merchant,
        note: draft.note,
        category_id: category?.id ?? null,
        source: 'scan',
        receipt_image_key,
        ocr_text: rawText,
        confidence: draft.confidence
      })
    });
    const json: any = await res.json();
    if (json.ok) await goto('/app/transactions');
    else error = json.error.message;
  }

  onDestroy(() => terminateOcr());
</script>

<section class="mx-auto max-w-3xl space-y-5">
  <div>
    <p class="section-label">Scan OCR</p>
    <h1 class="page-title mt-1">Scan dulu, review sebelum simpan</h1>
    <p class="mt-2 text-sm text-muted">OCR berjalan di browser. Lampiran hanya naik ke cloud saat kamu pilih simpan bukti.</p>
  </div>

  <div class="card space-y-4 p-4 md:p-5">
    <label class="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-moss/25 bg-paper p-8 text-center transition hover:border-moss/50 hover:bg-sky-soft/15">
      <span class="grid size-12 place-items-center rounded-lg bg-sky-soft/35 text-moss"><FileImage size={26} /></span>
      <span class="mt-4 text-lg font-black">Upload, kamera, atau paste screenshot</span>
      <span class="mt-1 text-sm text-muted">OCR berjalan di browser. Gambar tidak dikirim kecuali kamu centang simpan bukti.</span>
      <input class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" on:change={choose} />
    </label>
    {#if preview}<img class="max-h-80 w-full rounded-lg object-contain" src={preview} alt="Preview bukti transaksi" />{/if}
    {#if error}<p class="rounded-2xl bg-rose-soft/30 p-3 text-sm">{error}</p>{/if}
    <button class="btn-primary w-full" disabled={!file || status === 'ocr_running'} on:click={scan}><ScanLine size={18} /> {status === 'ocr_running' ? `Membaca ${progress}%` : 'Jalankan OCR'}</button>
  </div>

  {#if draft}
    <section class="card space-y-4 p-5">
      <div>
        <h2 class="text-xl font-black">Review hasil scan</h2>
        {#if draft.confidence < 0.7}<p class="mt-1 text-sm text-clay">Hasil scan belum yakin. Cek nominalnya dulu ya.</p>{/if}
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <label><span class="field-label">Tipe</span><select class="input" bind:value={draft.type}><option value="expense">Uang keluar</option><option value="income">Uang masuk</option></select></label>
        <label><span class="field-label">Nominal</span><input class="input" type="number" bind:value={draft.amount} /></label>
        <label><span class="field-label">Tanggal</span><input class="input" type="date" bind:value={draft.transaction_date} /></label>
        <label><span class="field-label">Merchant</span><input class="input" bind:value={draft.merchant} /></label>
      </div>
      <label><span class="field-label">Catatan</span><textarea class="input min-h-24" bind:value={draft.note}></textarea></label>
      <label class="flex items-center gap-3 rounded-lg bg-stone-soft/60 p-3 text-sm font-bold"><input type="checkbox" bind:checked={saveImage} /> <CloudUpload size={18} /> Simpan bukti gambar ke cloud</label>
      <p class="flex items-center gap-2 text-sm text-muted"><ShieldCheck size={16} /> Tidak ada auto-save. Kamu tetap pegang keputusan terakhir.</p>
      <details class="rounded-lg bg-cream/70 p-3 text-sm"><summary class="font-bold">OCR raw text</summary><pre class="mt-3 whitespace-pre-wrap">{rawText}</pre></details>
      <button class="btn-primary w-full" on:click={save}><CheckCircle2 size={18} /> Simpan transaksi hasil scan</button>
    </section>
  {/if}
</section>
