import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom'
import { ActionIcon, Menu, Text } from '@mantine/core'
import { IoArrowBack } from 'react-icons/io5'
import { IconDotsVertical, IconPhotoPlus } from '@tabler/icons-react'
import { getAlbum } from '../../api/organizations'
import { listAlbumPhotos, uploadAlbumPhotoFile } from '../../api/albumPhotos'
import { fetchCurrentUser } from '../../api/session'
import { isDevForceAuthEnabled } from '../../store/slices/authSlice'
import { useAlbumLibrary } from '../../context/AlbumLibraryContext'
import { AlbumSettingsModal } from '../Dashboard/AlbumSettingsModal'
import { fetchMockPhotoBatch, mockPhotoTotal } from './mockAlbumPhotos'
import { getBentoSpan } from './bentoSpans'
import { AuthedAlbumImage } from './AuthedAlbumImage'
import { AlbumPhotoViewer } from './AlbumPhotoViewer'
import './AlbumPhotosPage.css'

const HISTORY_VIEWER = 'album-photo-viewer'
const BATCH = 12

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

function pickContentType(file) {
  const t = (file.type || '').toLowerCase()
  if (ALLOWED_TYPES.includes(t)) return t
  const name = file.name.toLowerCase()
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.webp')) return 'image/webp'
  if (name.endsWith('.gif')) return 'image/gif'
  return null
}

function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth || 1,
        height: img.naturalHeight || 1,
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image dimensions'))
    }
    img.src = url
  })
}

function AlbumPhotosPage() {
  const { orgId, albumId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const locationAlbum = location.state?.album
  const { refreshAlbums } = useAlbumLibrary()

  const useRemotePhotos = !isDevForceAuthEnabled()
  const totalMock = mockPhotoTotal()

  const [album, setAlbum] = useState(locationAlbum || null)
  const [loadError, setLoadError] = useState(null)
  const [photos, setPhotos] = useState([])
  const [photoTotal, setPhotoTotal] = useState(
    useRemotePhotos ? 0 : totalMock
  )
  const [photosLoading, setPhotosLoading] = useState(useRemotePhotos)
  const [photosError, setPhotosError] = useState(null)
  const [userId, setUserId] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const viewerOpenRef = useRef(false)

  const sentinelRef = useRef(null)
  const appendBatchRef = useRef(() => {})
  const remotePagingRef = useRef({
    loading: false,
    orgId: null,
    albumId: null,
  })
  const photosLenRef = useRef(0)
  const photoTotalRef = useRef(0)
  const fileInputRef = useRef(null)

  useEffect(() => {
    photosLenRef.current = photos.length
  }, [photos.length])

  useEffect(() => {
    photoTotalRef.current = photoTotal
  }, [photoTotal])

  useEffect(() => {
    viewerOpenRef.current = viewerOpen
  }, [viewerOpen])

  useEffect(() => {
    if (isDevForceAuthEnabled()) return
    fetchCurrentUser()
      .then((d) => setUserId(d.user?.id ?? null))
      .catch(() => setUserId(null))
  }, [])

  useEffect(() => {
    if (!orgId || !albumId) return
    let cancelled = false
    setLoadError(null)
    getAlbum(orgId, albumId)
      .then((a) => {
        if (!cancelled) setAlbum(a)
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e.message || 'Could not load album')
          if (locationAlbum) setAlbum(locationAlbum)
        }
      })
    return () => {
      cancelled = true
    }
  }, [orgId, albumId, locationAlbum])

  const appendBatch = useCallback(() => {
    setPhotos((prev) => {
      if (prev.length >= totalMock) return prev
      const batch = fetchMockPhotoBatch(prev.length, BATCH)
      if (!batch.length) return prev
      return [...prev, ...batch]
    })
  }, [totalMock])

  appendBatchRef.current = useRemotePhotos
    ? () => {}
    : appendBatch

  useEffect(() => {
    if (useRemotePhotos) return
    appendBatch()
  }, [useRemotePhotos, appendBatch])

  useEffect(() => {
    if (!useRemotePhotos || !orgId || !albumId || !album) return undefined
    let cancelled = false
    setPhotosLoading(true)
    setPhotosError(null)
    setPhotos([])
    setPhotoTotal(0)
    remotePagingRef.current = { loading: false, orgId, albumId }
    listAlbumPhotos(orgId, albumId, 0, BATCH)
      .then((data) => {
        if (cancelled) return
        setPhotos(Array.isArray(data.photos) ? data.photos : [])
        setPhotoTotal(typeof data.total === 'number' ? data.total : 0)
      })
      .catch((e) => {
        if (!cancelled) {
          setPhotosError(e.message || 'Could not load photos')
          setPhotos([])
          setPhotoTotal(0)
        }
      })
      .finally(() => {
        if (!cancelled) setPhotosLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [useRemotePhotos, orgId, albumId, album])

  const loadMoreRemote = useCallback(() => {
    if (!useRemotePhotos || !orgId || !albumId) return
    const r = remotePagingRef.current
    if (r.loading || r.orgId !== orgId || r.albumId !== albumId) return
    const offset = photosLenRef.current
    const total = photoTotalRef.current
    if (offset >= total) return
    r.loading = true
    listAlbumPhotos(orgId, albumId, offset, BATCH)
      .then((data) => {
        const next = Array.isArray(data.photos) ? data.photos : []
        setPhotos((p) => [...p, ...next])
        if (typeof data.total === 'number') setPhotoTotal(data.total)
      })
      .catch((e) => {
        setPhotosError(e.message || 'Could not load more photos')
      })
      .finally(() => {
        r.loading = false
      })
  }, [useRemotePhotos, orgId, albumId])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return undefined

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting)
        if (!hit) return
        if (useRemotePhotos) loadMoreRemote()
        else appendBatchRef.current()
      },
      { root: null, rootMargin: '240px', threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [useRemotePhotos, loadMoreRemote])

  const openViewer = useCallback((index) => {
    setViewerIndex(index)
    viewerOpenRef.current = true
    setViewerOpen(true)
    window.history.pushState({ kind: HISTORY_VIEWER }, '')
  }, [])

  const closeViewer = useCallback(() => {
    if (!viewerOpenRef.current) return
    viewerOpenRef.current = false
    setViewerOpen(false)
    if (window.history.state?.kind === HISTORY_VIEWER) {
      window.history.back()
    }
  }, [])

  useEffect(() => {
    const onPop = () => {
      if (viewerOpenRef.current) {
        viewerOpenRef.current = false
        setViewerOpen(false)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (!viewerOpen) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [viewerOpen])

  const uploadSingleFile = useCallback(
    async (file) => {
      const contentType = pickContentType(file)
      if (!contentType) {
        throw new Error(`${file.name}: use JPEG, PNG, WebP, or GIF`)
      }
      const { width, height } = await readImageDimensions(file)
      const { photo } = await uploadAlbumPhotoFile(
        orgId,
        albumId,
        file,
        width,
        height
      )
      return photo
    },
    [orgId, albumId]
  )

  const onFileInputChange = useCallback(
    async (e) => {
      const input = e.target
      const files = input.files ? Array.from(input.files) : []
      input.value = ''
      if (!files.length || !orgId || !albumId) return
      setUploadError(null)
      setUploading(true)
      try {
        for (const file of files) {
          const photo = await uploadSingleFile(file)
          setPhotos((prev) => [photo, ...prev])
          setPhotoTotal((t) => t + 1)
        }
        refreshAlbums()
        if (orgId && albumId) {
          getAlbum(orgId, albumId).then(setAlbum).catch(() => {})
        }
      } catch (err) {
        setUploadError(err.message || 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [orgId, albumId, uploadSingleFile, refreshAlbums]
  )

  const goBackToDashboard = () => {
    navigate('/dashboard')
  }

  const title = album?.title || 'Album'
  const canManageAlbum =
    album &&
    userId != null &&
    String(album.ownerId) === String(userId)

  const canUpload = Boolean(album?.viewerCanUpload)
  const effectiveTotal = useRemotePhotos ? photoTotal : totalMock
  const showEnd =
    photos.length > 0 &&
    photos.length >= effectiveTotal &&
    !photosLoading

  return (
    <div className="album-photos-page">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="album-photos-page__file-input"
        aria-hidden
        tabIndex={-1}
        onChange={onFileInputChange}
      />
      <header className="album-photos-page__toolbar">
        <ActionIcon
          variant="filled"
          size="lg"
          radius="xl"
          aria-label="Back to albums"
          className="album-photos-page__back"
          onClick={goBackToDashboard}
        >
          <IoArrowBack size={22} />
        </ActionIcon>
        <div className="album-photos-page__title-wrap">
          <h1 className="album-photos-page__title">{title}</h1>
          {loadError && album ? (
            <Text size="xs" c="var(--accent2)" mt={4}>
              {loadError} — showing cached info
            </Text>
          ) : null}
          {photosError ? (
            <Text size="xs" c="var(--accent2)" mt={4}>
              {photosError}
            </Text>
          ) : null}
          {uploadError ? (
            <Text size="xs" c="var(--accent2)" mt={4}>
              {uploadError}
            </Text>
          ) : null}
          {uploading ? (
            <Text size="xs" c="var(--muted)" mt={4}>
              Uploading…
            </Text>
          ) : null}
        </div>
        {useRemotePhotos && canUpload ? (
          <ActionIcon
            variant="filled"
            size="lg"
            radius="xl"
            aria-label="Add photos"
            className="album-photos-page__upload-trigger"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !orgId || !albumId}
          >
            <IconPhotoPlus size={22} />
          </ActionIcon>
        ) : null}
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="filled"
              size="lg"
              radius="xl"
              aria-label="Album actions"
              className="album-photos-page__menu-trigger"
            >
              <IconDotsVertical size={20} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown
            styles={{
              dropdown: {
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              },
            }}
          >
            {canManageAlbum ? (
              <Menu.Item
                onClick={() => setSettingsOpen(true)}
                styles={{
                  item: { color: 'var(--text)', fontFamily: 'var(--font-body)' },
                }}
              >
                Album settings
              </Menu.Item>
            ) : null}
            <Menu.Item
              disabled
              styles={{
                item: { color: 'var(--muted)', fontFamily: 'var(--font-body)' },
              }}
            >
              Share (soon)
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </header>

      <div className="album-photos-page__scroll">
        {!album && loadError ? (
          <Text ta="center" c="var(--muted)" py="xl">
            {loadError}
            <br />
            <button
              type="button"
              className="gallery-theme-btn--ghost"
              style={{ marginTop: 16, padding: '8px 16px', borderRadius: 12 }}
              onClick={goBackToDashboard}
            >
              Back to dashboard
            </button>
          </Text>
        ) : (
          <>
            {useRemotePhotos && photosLoading && photos.length === 0 ? (
              <Text ta="center" c="var(--muted)" py="xl">
                Loading photos…
              </Text>
            ) : null}
            {useRemotePhotos &&
            !photosLoading &&
            photos.length === 0 &&
            !photosError ? (
              <div className="album-photos-page__empty">
                <Text ta="center" c="var(--muted)" mb="md">
                  No photos in this album yet.
                </Text>
                {canUpload ? (
                  <button
                    type="button"
                    className="album-photos-page__empty-cta"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !orgId || !albumId}
                  >
                    Add photos
                  </button>
                ) : null}
              </div>
            ) : null}
            <div className="album-photos-page__bento">
              {photos.map((photo, index) => {
                const { col, row } = getBentoSpan(
                  photo.width,
                  photo.height,
                  index
                )
                const streamPath =
                  useRemotePhotos && orgId && albumId
                    ? `/organizations/${orgId}/albums/${albumId}/photos/${encodeURIComponent(photo.id)}/file`
                    : null
                return (
                  <button
                    key={photo.id}
                    type="button"
                    className="album-photos-page__bento-tile"
                    style={{
                      gridColumn: `span ${col}`,
                      gridRow: `span ${row}`,
                    }}
                    onClick={() => openViewer(index)}
                  >
                    <AuthedAlbumImage
                      streamPath={streamPath}
                      variant="thumb"
                      directSrc={photo.url}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                )
              })}
            </div>
            <div
              ref={sentinelRef}
              className="album-photos-page__sentinel"
              aria-hidden
            />
            {showEnd ? (
              <p className="album-photos-page__end">End of album</p>
            ) : null}
          </>
        )}
      </div>

      <AlbumPhotoViewer
        opened={viewerOpen}
        onClose={closeViewer}
        photos={photos}
        initialIndex={viewerIndex}
        orgId={orgId}
        albumId={albumId}
        albumTitle={title}
        album={album}
      />

      <AlbumSettingsModal
        orgId={orgId}
        album={album}
        opened={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => {
          refreshAlbums()
          if (orgId && albumId) {
            getAlbum(orgId, albumId).then(setAlbum).catch(() => {})
          }
        }}
      />
    </div>
  )
}

export default AlbumPhotosPage
