import { createWorker, type Worker } from 'tesseract.js';

let worker: Worker | null = null;

export async function runOcr(file: File, onProgress?: (progress: number) => void) {
  if (!worker) {
    try {
      worker = await createWorker('ind+eng', 1, {
        logger: (message) => {
          if (message.status === 'recognizing text') onProgress?.(message.progress);
        }
      });
    } catch {
      worker = await createWorker('eng', 1, {
        logger: (message) => {
          if (message.status === 'recognizing text') onProgress?.(message.progress);
        }
      });
    }
  }

  const result = await worker.recognize(file);
  return {
    text: result.data.text,
    confidence: Math.max(0, Math.min(1, result.data.confidence / 100))
  };
}

export async function terminateOcr() {
  if (worker) await worker.terminate();
  worker = null;
}
