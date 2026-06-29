export async function imageToWebp(file: File, maxWidth = 1600, quality = 0.82) {
  const image = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext('2d');
  if (!context) return file;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  return blob ? new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }) : file;
}
