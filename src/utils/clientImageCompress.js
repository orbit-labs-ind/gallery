const JPEG_QUALITY_START = 0.82
const WEBP_QUALITY_START = 0.8
const MIN_LONG_EDGE = 720
const MIN_QUALITY = 0.55

function canvasSupportsWebp() {
  try {
    const c = document.createElement('canvas')
    c.width = 1
    c.height = 1
    const d = c.toDataURL('image/webp')
    return typeof d === 'string' && d.startsWith('data:image/webp')
  } catch {
    return false
  }
}

function baseName(file) {
  const n = file.name || 'photo'
  const i = n.lastIndexOf('.')
  return i > 0 ? n.slice(0, i) : n
}

function pickOutputMime(fileType) {
  const t = (fileType || '').toLowerCase()
  const webpOk = canvasSupportsWebp()
  if (t === 'image/png' && webpOk) return 'image/webp'
  if (t === 'image/webp' && webpOk) return 'image/webp'
  return 'image/jpeg'
}

async function loadBitmap(file) {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    const url = URL.createObjectURL(file)
    try {
      const img = await new Promise((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = () => reject(new Error('Could not load image'))
        el.src = url
      })
      const c = document.createElement('canvas')
      c.width = img.naturalWidth || 1
      c.height = img.naturalHeight || 1
      const ctx = c.getContext('2d')
      if (!ctx) throw new Error('Could not compress image')
      ctx.drawImage(img, 0, 0)
      return await createImageBitmap(c)
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}

function scaleToMaxEdge(width, height, maxEdge) {
  const long = Math.max(width, height)
  if (long <= maxEdge) return { width, height }
  const scale = maxEdge / long
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

async function encodeBitmapToFile(bitmap, mime, quality, nameBase) {
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not compress image')
  ctx.drawImage(bitmap, 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not encode image'))
          return
        }
        const ext = mime === 'image/webp' ? '.webp' : '.jpg'
        resolve(
          new File([blob], `${nameBase}${ext}`, {
            type: mime,
            lastModified: Date.now(),
          })
        )
      },
      mime,
      quality
    )
  })
}

async function renderScaledBitmap(source, width, height) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Could not compress image')
  ctx.drawImage(source, 0, 0, width, height)
  return createImageBitmap(c)
}

/**
 * Re-encode raster images in-browser to reduce upload size. Skips animated GIF.
 * If the result is larger than the original, returns the original file.
 * If maxOutputBytes is set, scales down / lowers quality in steps to try to fit.
 */
export async function compressImageFileForUpload(file, maxOutputBytes) {
  const type = (file.type || '').toLowerCase()
  if (type === 'image/gif') return file
  if (!type.startsWith('image/')) return file

  let bitmap
  try {
    bitmap = await loadBitmap(file)
  } catch {
    return file
  }

  const mime = pickOutputMime(file.type)
  const nameBase = baseName(file)
  let maxEdge = 4096
  let quality =
    mime === 'image/webp' ? WEBP_QUALITY_START : JPEG_QUALITY_START

  try {
    for (let attempt = 0; attempt < 14; attempt += 1) {
      const { width, height } = scaleToMaxEdge(
        bitmap.width,
        bitmap.height,
        maxEdge
      )

      let work = bitmap
      let scaled = null
      let out
      try {
        if (width !== bitmap.width || height !== bitmap.height) {
          scaled = await renderScaledBitmap(bitmap, width, height)
          work = scaled
        }
        out = await encodeBitmapToFile(work, mime, quality, nameBase)
      } finally {
        if (scaled) scaled.close()
      }

      if (out.size >= file.size && attempt === 0) {
        return file
      }

      const fits = maxOutputBytes == null || out.size <= maxOutputBytes
      const exhausted =
        maxEdge <= MIN_LONG_EDGE && quality <= MIN_QUALITY

      if (fits) {
        return out.size < file.size ? out : file
      }

      if (exhausted) {
        throw new Error(
          'Image is still too large after compression. Try a smaller photo.'
        )
      }

      if (quality > MIN_QUALITY + 0.05) {
        quality = Math.max(MIN_QUALITY, quality - 0.08)
      } else {
        maxEdge = Math.max(MIN_LONG_EDGE, Math.floor(maxEdge * 0.75))
      }
    }

    return file
  } finally {
    bitmap.close()
  }
}

export async function maybeCompressAlbumPhoto(file, { enabled, maxUploadBytes }) {
  if (!enabled) return file
  return compressImageFileForUpload(file, maxUploadBytes)
}
