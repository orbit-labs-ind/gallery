import { useEffect, useMemo, useState } from 'react'
import { fetchAuthenticatedImageBlob } from '../../api/albumImageBlob'

/**
 * Loads album bytes via authenticated API (fetch + blob) so the browser does not
 * treat cross-origin R2 URLs as opaque (ORB) or depend on R2 public Content-Type.
 *
 * @param {'full' | 'thumb'} variant — `thumb` requests a small JPEG grid tile; `full` is the original.
 */
export function AuthedAlbumImage({
  streamPath,
  variant = 'full',
  directSrc,
  alt = '',
  width,
  height,
  className,
  loading,
  decoding,
  draggable,
  style,
}) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [failed, setFailed] = useState(false)

  const fetchUrl = useMemo(() => {
    if (!streamPath) return null
    if (variant === 'thumb') {
      const joiner = streamPath.includes('?') ? '&' : '?'
      return `${streamPath}${joiner}variant=thumb`
    }
    return streamPath
  }, [streamPath, variant])

  useEffect(() => {
    if (!fetchUrl) {
      setBlobUrl(null)
      setFailed(false)
      return undefined
    }
    setBlobUrl(null)
    setFailed(false)
    let cancelled = false
    let objectUrl = null
    ;(async () => {
      try {
        const blob = await fetchAuthenticatedImageBlob(fetchUrl)
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        if (cancelled) {
          URL.revokeObjectURL(objectUrl)
          return
        }
        setBlobUrl(objectUrl)
        setFailed(false)
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fetchUrl])

  if (fetchUrl) {
    if (blobUrl) {
      return (
        <img
          src={blobUrl}
          alt={alt}
          width={width}
          height={height}
          className={className}
          loading={loading}
          decoding={decoding}
          draggable={draggable}
          style={style}
        />
      )
    }
    if (failed) {
      return (
        <div
          className={className}
          style={{
            background: 'var(--surface2)',
            minHeight: 80,
            ...style,
          }}
          aria-hidden
        />
      )
    }
    const ar =
      width && height ? { aspectRatio: `${width} / ${height}` } : { minHeight: 120 }
    return (
      <div
        className={className}
        style={{
          background: 'color-mix(in srgb, var(--text) 6%, transparent)',
          ...ar,
          ...style,
        }}
        aria-hidden
      />
    )
  }

  return (
    <img
      src={directSrc || undefined}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      decoding={decoding}
      draggable={draggable}
      style={style}
    />
  )
}
