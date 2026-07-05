import { createWorker, type Worker } from 'tesseract.js';

let worker: Worker | null = null;
let activeProgress: ((progress: number) => void) | undefined;
const MAX_PDF_PAGES = 3;
const MAX_OCR_FILE_SIZE = 12 * 1024 * 1024;

export const supportedOcrMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv'
];

async function getWorker() {
  if (!worker) {
    try {
      worker = await createWorker('ind+eng', 1, {
        logger: (message) => {
          if (message.status === 'recognizing text') activeProgress?.(message.progress);
        }
      });
    } catch {
      worker = await createWorker('eng', 1, {
        logger: (message) => {
          if (message.status === 'recognizing text') activeProgress?.(message.progress);
        }
      });
    }
  }
  return worker;
}

async function recognizeImage(input: File | Blob, onProgress?: (progress: number) => void) {
  activeProgress = onProgress;
  const ocrWorker = await getWorker();
  const result = await ocrWorker.recognize(input);
  activeProgress = undefined;
  return {
    text: result.data.text,
    confidence: Math.max(0, Math.min(1, result.data.confidence / 100))
  };
}

async function renderPdfPageToBlob(page: any) {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas tidak tersedia untuk membaca PDF.');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.92));
  if (!blob) throw new Error('PDF gagal dirender untuk OCR.');
  return blob;
}

async function extractPdfText(file: File, onProgress?: (progress: number) => void) {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const textParts: string[] = [];
  const confidences: number[] = [];

  for (let index = 1; index <= pageCount; index += 1) {
    const page = await pdf.getPage(index);
    const textContent = await page.getTextContent();
    const selectableText = textContent.items.map((item: any) => item.str).filter(Boolean).join(' ').trim();
    if (selectableText.length > 30) {
      textParts.push(selectableText);
      confidences.push(0.96);
      onProgress?.(index / pageCount);
      continue;
    }

    const image = await renderPdfPageToBlob(page);
    const pageBase = (index - 1) / pageCount;
    const result = await recognizeImage(image, (progress) => onProgress?.(pageBase + progress / pageCount));
    textParts.push(result.text);
    confidences.push(result.confidence);
  }

  return {
    text: textParts.join('\n\n').trim(),
    confidence: confidences.length ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length : 0
  };
}

export async function runOcr(file: File, onProgress?: (progress: number) => void) {
  if (file.size > MAX_OCR_FILE_SIZE) {
    throw new Error('File terlalu besar. Maksimal 12 MB untuk OCR.');
  }

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return extractPdfText(file, onProgress);
  }

  if (file.type.startsWith('text/') || /\.(txt|csv)$/i.test(file.name)) {
    onProgress?.(1);
    return { text: await file.text(), confidence: 1 };
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Format belum didukung. Gunakan PDF, gambar, TXT, atau CSV.');
  }

  return recognizeImage(file, onProgress);
}

export async function terminateOcr() {
  if (worker) await worker.terminate();
  worker = null;
}
