<script lang="ts">
  import MoneyInput from '$lib/components/ui/MoneyInput.svelte';
  import { runOcr, supportedOcrMimeTypes, terminateOcr } from '$lib/utils/ocr';
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { CheckCircle2, CloudUpload, FileImage, FileText, ScanLine, ShieldCheck } from '@lucide/svelte';
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
  $: isImage = file?.type.startsWith('image/') ?? false;
  $: isPdf = file?.type === 'application/pdf' || file?.name.toLowerCase().endsWith('.pdf') || false;
  $: accept = supportedOcrMimeTypes.join(',');
  $: fileDescription = file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB` : '';

  async function choose(event: Event) {
    const input = event.target as HTMLInputElement;
    file = input.files?.[0] ?? null;
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
    rawText = '';
    draft = null;
    progress = 0;
    error = '';
    status = 'preview';
  }

  async function scan() {
    if (!file) return;
    status = 'ocr_running';
    error = '';
    let result;
    try {
      result = await runOcr(file, (value) => (progress = Math.round(value * 100)));
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'OCR gagal membaca file.';
      status = 'error';
      return;
    }
    rawText = result.text.trim();
    if (!rawText) {
      error = 'Tidak ada teks yang terbaca dari file ini.';
      status = 'error';
      return;
    }
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

<section class="mx-auto max-w-6xl space-y-3 md:space-y-4">
  <div class="surface-panel overflow-hidden">
    <div class="grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
      <div class="min-w-0 space-y-4 p-4 md:p-5 lg:border-r lg:border-moss/10">
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="min-w-0">
            <p class="section-label">Scan OCR</p>
            <h1 class="page-title mt-1 flex items-center gap-2"><ScanLine class="shrink-0" size={25} /> Scan bukti transaksi</h1>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-muted">Upload bukti transaksi, cek hasil OCR, lalu simpan setelah nominal dan tanggalnya benar.</p>
          </div>
          <span class="status-pill w-fit shrink-0"><ShieldCheck size={14} /> Review dulu</span>
        </div>

        <label class="flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-moss/25 bg-paper p-5 text-center transition hover:border-moss/50 hover:bg-sky-soft/15 md:min-h-[260px] md:p-8">
        <span class="metric-icon"><FileImage size={24} /></span>
        <span class="mt-3 text-base font-black md:text-lg">Pilih file bukti</span>
        <span class="mt-1 max-w-sm text-sm leading-6 text-muted">Gambar, PDF, dan file teks. PDF diproses sampai 3 halaman pertama, maksimal 12 MB.</span>
        <input class="sr-only" type="file" {accept} capture="environment" on:change={choose} />
        </label>
        {#if preview}<img class="max-h-80 w-full rounded-lg object-contain" src={preview} alt="Preview bukti transaksi" />{/if}
        {#if file && !isImage}
          <div class="list-row flex items-center gap-3 p-4">
            <span class="metric-icon">{#if isPdf}<FileText size={22} />{:else}<FileImage size={22} />{/if}</span>
            <div class="min-w-0">
              <p class="truncate font-black">{file.name}</p>
              <p class="text-sm text-muted">{isPdf ? 'PDF akan dirender lalu di-OCR.' : 'Teks akan dibaca langsung.'} {fileDescription}</p>
            </div>
          </div>
        {/if}
        {#if status === 'ocr_running'}
          <div class="rounded-2xl bg-cream/60 p-3">
            <div class="flex items-center justify-between gap-3 text-sm font-black text-moss">
              <span>Membaca file</span>
              <span>{progress}%</span>
            </div>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-paper">
              <div class="h-full rounded-full bg-moss" style={`width:${Math.max(3, progress)}%`}></div>
            </div>
          </div>
        {/if}
        {#if error}<p class="rounded-2xl bg-rose-soft/30 p-3 text-sm font-bold">{error}</p>{/if}

        <div class="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <p class="flex items-start gap-2 text-xs font-bold leading-5 text-muted"><ShieldCheck class="mt-0.5 shrink-0" size={15} /> OCR berjalan di browser. Lampiran hanya naik ke cloud kalau kamu memilih simpan file bukti.</p>
          <button class="btn-primary w-full md:w-auto md:min-w-52" disabled={!file || status === 'ocr_running'} on:click={scan}><ScanLine size={18} /> {status === 'ocr_running' ? `Membaca ${progress}%` : 'Jalankan OCR'}</button>
        </div>
      </div>

      <aside class="space-y-4 bg-cream/35 p-4 md:p-5">
        <div>
          <p class="section-label">Alur scan</p>
          <h2 class="mt-1 text-xl font-black">Dari file ke transaksi</h2>
          <p class="mt-2 text-sm leading-6 text-muted">Panel ini membantu memastikan hasil scan tidak langsung masuk tanpa pengecekan.</p>
        </div>
        <div class="space-y-2">
          <div class="list-row flex items-center gap-3 p-3">
            <span class="metric-icon"><FileImage size={18} /></span>
            <div>
              <p class="font-black">1. Upload bukti</p>
              <p class="text-sm text-muted">JPG, PNG, WEBP, PDF, atau teks.</p>
            </div>
          </div>
          <div class="list-row flex items-center gap-3 p-3">
            <span class="metric-icon"><ScanLine size={18} /></span>
            <div>
              <p class="font-black">2. Baca OCR</p>
              <p class="text-sm text-muted">PDF diproses sampai 3 halaman pertama.</p>
            </div>
          </div>
          <div class="list-row flex items-center gap-3 p-3">
            <span class="metric-icon"><CheckCircle2 size={18} /></span>
            <div>
              <p class="font-black">3. Review hasil</p>
              <p class="text-sm text-muted">Edit nominal, tanggal, dan merchant sebelum simpan.</p>
            </div>
          </div>
        </div>
        <div class="soft-divider"></div>
        <p class="flex items-start gap-2 text-sm font-bold leading-6 text-muted"><ShieldCheck class="mt-0.5 shrink-0" size={16} /> Tidak ada transaksi yang disimpan otomatis dari OCR.</p>
      </aside>
    </div>
  </div>

  {#if draft}
    <section class="surface-panel space-y-4 p-4 md:p-5">
      <div>
        <h2 class="text-xl font-black">Review hasil scan</h2>
        {#if draft.confidence < 0.7}<p class="mt-1 text-sm text-clay">Hasil scan belum yakin. Cek nominalnya dulu ya.</p>{/if}
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <label><span class="field-label">Tipe</span><select class="input" bind:value={draft.type}><option value="expense">Uang keluar</option><option value="income">Uang masuk</option></select></label>
        <MoneyInput id="scan-amount" label="Nominal" bind:value={draft.amount} />
        <label><span class="field-label">Tanggal</span><input class="input" type="date" bind:value={draft.transaction_date} /></label>
        <label><span class="field-label">Merchant</span><input class="input" bind:value={draft.merchant} /></label>
      </div>
      <label><span class="field-label">Catatan</span><textarea class="input min-h-24" bind:value={draft.note}></textarea></label>
      <label class="list-row flex min-h-[48px] items-center gap-3 p-3 text-sm font-bold"><input class="size-5" type="checkbox" bind:checked={saveImage} /> <CloudUpload size={18} /> Simpan file bukti ke cloud</label>
      <p class="flex items-start gap-2 text-sm leading-6 text-muted"><ShieldCheck class="mt-0.5 shrink-0" size={16} /> Tidak ada auto-save. Kamu tetap pegang keputusan terakhir.</p>
      <details class="rounded-xl bg-cream/70 p-3 text-sm"><summary class="min-h-[44px] cursor-pointer font-bold">OCR raw text</summary><pre class="mt-3 max-h-56 overflow-auto whitespace-pre-wrap">{rawText}</pre></details>
      <button class="btn-primary w-full" on:click={save}><CheckCircle2 size={18} /> Simpan transaksi hasil scan</button>
    </section>
  {/if}
</section>
