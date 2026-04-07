/**
 * Draw a cropped region from an image into a canvas and return as Blob.
 * @param {string} imageSrc Object URL or remote URL
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop
 * @param {string} mimeType
 * @param {number} quality JPEG quality 0–1
 */
export function createImage(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (e) => reject(e))
    img.src = imageSrc
  })
}

const MAX_OUTPUT_SIDE = 1024

export async function getCroppedImageBlob(
  imageSrc,
  pixelCrop,
  mimeType = 'image/jpeg',
  quality = 0.92
) {
  const image = await createImage(imageSrc)
  const x = Math.round(pixelCrop.x)
  const y = Math.round(pixelCrop.y)
  const w = Math.round(pixelCrop.width)
  const h = Math.round(pixelCrop.height)

  const maxDim = Math.max(w, h)
  const scale = maxDim > MAX_OUTPUT_SIDE ? MAX_OUTPUT_SIDE / maxDim : 1
  const outW = Math.round(w * scale)
  const outH = Math.round(h * scale)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  ctx.drawImage(image, x, y, w, h, 0, 0, outW, outH)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Could not create image'))
      },
      mimeType,
      quality
    )
  })
}
