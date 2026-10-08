/**
 * Shrink a receipt photo to something that fits in localStorage: a phone
 * camera shot is several MB, a 900px JPEG is well under 150 KB.
 */
const MAX_EDGE = 900
const QUALITY = 0.72

/** Draw an image or a video frame onto a canvas no larger than MAX_EDGE, as a JPEG data URL. */
export function receiptDataUrl(source: CanvasImageSource, width: number, height: number): string {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas is not available')
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', QUALITY)
}

export async function receiptPhotoDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    return receiptDataUrl(bitmap, bitmap.width, bitmap.height)
  } finally {
    bitmap.close()
  }
}
