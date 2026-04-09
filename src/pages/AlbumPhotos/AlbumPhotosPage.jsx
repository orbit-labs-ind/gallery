import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from 'react-router-dom'
import { ActionIcon, Button, Menu, Paper, Text } from '@mantine/core'
import { IoArrowBack } from 'react-icons/io5'
import { IconDotsVertical, IconPhotoPlus } from '@tabler/icons-react'
import { getAlbum, removeAlbumMember } from '../../api/organizations'
import { listAlbumPhotos, uploadAlbumPhotoFile } from '../../api/albumPhotos'
import { fetchCurrentUser } from '../../api/session'
import { isDevForceAuthEnabled } from '../../store/slices/authSlice'
import { useAlbumLibrary } from '../../context/AlbumLibraryContext'
import { AlbumSettingsModal } from '../Dashboard/AlbumSettingsModal'
import { fetchMockPhotoBatch, mockPhotoTotal } from './mockAlbumPhotos'
import { getBentoSpan } from './bentoSpans'
import { AuthedAlbumImage } from './AuthedAlbumImage'
import { AlbumPhotoViewer } from './AlbumPhotoViewer'
import { useAlbumEngagementChannel } from '../../hooks/useAlbumEngagementChannel'
import { AlbumUploadReviewModal } from './AlbumUploadReviewModal'
import { maybeCompressAlbumPhoto } from '../../utils/clientImageCompress'
import './AlbumPhotosPage.css'

const HISTORY_VIEWER = 'album-photo-viewer'
const BATCH = 12
const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024
/** Raw picker cap when server asks for client-side compression (GIF always uses server max only). */
const MAX_RAW_BYTES_WHEN_COMPRESS = 80 * 1024 * 1024

function newLocalId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

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
  const [searchParams, setSearchParams] = useSearchParams()
  const locationAlbum = location.state?.album
  const { refreshAlbums, organizations } = useAlbumLibrary()
  const orgRowForPage = organizations?.find((o) => String(o.id) === String(orgId))
  const isOrgOwnerForThisPage = Boolean(orgRowForPage?.isOwner)
  const canManageAlbumsInOrg = Boolean(orgRowForPage?.myCaps?.canManageAlbums)

  const useRemotePhotos = !isDevForceAuthEnabled()

  useAlbumEngagementChannel(orgId, albumId, Boolean(useRemotePhotos && orgId && albumId))
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
  const [maxUploadBytes, setMaxUploadBytes] = useState(DEFAULT_MAX_UPLOAD_BYTES)
  const [clientCompress, setClientCompress] = useState(false)
  const [uploadReviewOpen, setUploadReviewOpen] = useState(false)
  const [uploadQueue, setUploadQueue] = useState([])
  const [leaveAlbumError, setLeaveAlbumError] = useState(null)

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
  const uploadQueueRef = useRef(uploadQueue)
  uploadQueueRef.current = uploadQueue
  const openedFromPhotoQueryRef = useRef(false)

  useEffect(() => () => {
    uploadQueueRef.current.forEach((it) => {
      if (it.previewUrl) URL.revokeObjectURL(it.previewUrl)
    })
  }, [])

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
      .then((d) => {
        setUserId(d.user?.id ?? null)
        const cfg = d.appConfig
        if (cfg && typeof cfg.maxUploadBytes === 'number') {
          setMaxUploadBytes(cfg.maxUploadBytes)
        }
        if (cfg && typeof cfg.clientCompressMediaBeforeUpload === 'boolean') {
          setClientCompress(cfg.clientCompressMediaBeforeUpload)
        }
      })
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
    if (album.hasPhotoAccess === false) {
      setPhotosLoading(false)
      setPhotosError(null)
      setPhotos([])
      setPhotoTotal(0)
      remotePagingRef.current = { loading: false, orgId, albumId }
      return undefined
    }
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
  }, [useRemotePhotos, orgId, albumId, album, album?.hasPhotoAccess])

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

  useEffect(() => {
    openedFromPhotoQueryRef.current = false
  }, [orgId, albumId])

  useEffect(() => {
    if (!useRemotePhotos || photosLoading || photos.length === 0) return
    const key = searchParams.get('photo')
    if (!key || openedFromPhotoQueryRef.current) return
    const decoded = decodeURIComponent(key)
    const idx = photos.findIndex((p) => p.id === key || p.id === decoded)
    if (idx < 0) return
    openedFromPhotoQueryRef.current = true
    openViewer(idx)
    const next = new URLSearchParams(searchParams)
    next.delete('photo')
    setSearchParams(next, { replace: true })
  }, [
    useRemotePhotos,
    photosLoading,
    photos,
    searchParams,
    setSearchParams,
    openViewer,
  ])

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
      if (file.size > maxUploadBytes) {
        const mb = (maxUploadBytes / (1024 * 1024)).toFixed(0)
        throw new Error(`${file.name}: file must be at most ${mb} MB`)
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
    [orgId, albumId, maxUploadBytes]
  )

  const clearUploadQueue = useCallback(() => {
    setUploadQueue((prev) => {
      prev.forEach((it) => {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl)
      })
      return []
    })
  }, [])

  const onFileInputChange = useCallback(
    (e) => {
      const input = e.target
      const files = input.files ? Array.from(input.files) : []
      input.value = ''
      if (!files.length || !orgId || !albumId) return
      setUploadError(null)

      const next = []
      for (const file of files) {
        const contentType = pickContentType(file)
        const id = newLocalId()
        const previewUrl = URL.createObjectURL(file)
        if (!contentType) {
          next.push({
            id,
            file,
            previewUrl,
            error: 'Use JPEG, PNG, WebP, or GIF',
          })
          continue
        }
        const maxPick =
          contentType === 'image/gif' || !clientCompress
            ? maxUploadBytes
            : MAX_RAW_BYTES_WHEN_COMPRESS
        if (file.size > maxPick) {
          const mb = (maxPick / (1024 * 1024)).toFixed(
            maxPick >= 1024 * 1024 ? 0 : 1
          )
          next.push({
            id,
            file,
            previewUrl,
            error: `Max ${mb} MB per file${
              clientCompress && contentType !== 'image/gif'
                ? ' before compression'
                : ''
            }`,
          })
          continue
        }
        next.push({ id, file, previewUrl, error: null })
      }

      setUploadQueue((prev) => {
        prev.forEach((it) => {
          if (it.previewUrl) URL.revokeObjectURL(it.previewUrl)
        })
        return next
      })
      setUploadReviewOpen(true)
    },
    [orgId, albumId, maxUploadBytes, clientCompress]
  )

  const removeFromUploadQueue = useCallback((itemId) => {
    setUploadQueue((prev) => {
      const it = prev.find((x) => x.id === itemId)
      if (it?.previewUrl) URL.revokeObjectURL(it.previewUrl)
      return prev.filter((x) => x.id !== itemId)
    })
  }, [])

  const cancelUploadReview = useCallback(() => {
    if (uploading) return
    clearUploadQueue()
    setUploadReviewOpen(false)
  }, [uploading, clearUploadQueue])

  const confirmUploadReview = useCallback(async () => {
    const items = uploadQueue.filter((it) => !it.error)
    if (!items.length || !orgId || !albumId) return
    setUploadError(null)
    setUploading(true)
    try {
      for (const { file: original } of items) {
        let file = await maybeCompressAlbumPhoto(original, {
          enabled: clientCompress,
          maxUploadBytes,
        })
        if (file.size > maxUploadBytes) {
          const mb = (maxUploadBytes / (1024 * 1024)).toFixed(0)
          throw new Error(
            `${file.name}: still over ${mb} MB after compression`
          )
        }
        const photo = await uploadSingleFile(file)
        setPhotos((prev) => [photo, ...prev])
        setPhotoTotal((t) => t + 1)
      }
      clearUploadQueue()
      setUploadReviewOpen(false)
      refreshAlbums()
      if (orgId && albumId) {
        getAlbum(orgId, albumId).then(setAlbum).catch(() => {})
      }
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [
    uploadQueue,
    orgId,
    albumId,
    clientCompress,
    maxUploadBytes,
    uploadSingleFile,
    clearUploadQueue,
    refreshAlbums,
  ])

  const goBackToDashboard = () => {
    navigate('/dashboard')
  }

  const title = album?.title || 'Album'
  const canManageAlbum =
    album &&
    userId != null &&
    (String(album.ownerId) === String(userId) ||
      isOrgOwnerForThisPage ||
      canManageAlbumsInOrg)

  const canUpload = Boolean(album?.viewerCanUpload)
  const canLeaveAlbum = Boolean(
    album?.viewerCanLeaveAlbum && userId != null
  )
  const effectiveTotal = useRemotePhotos ? photoTotal : totalMock

  const lockedOutOfPhotos =
    useRemotePhotos &&
    album &&
    album.hasPhotoAccess === false &&
    album.visibility === 'public'

  const handleLeaveAlbum = async () => {
    if (!orgId || !albumId || !userId) return
    setLeaveAlbumError(null)
    const ok = window.confirm(
      'Leave this album? You will need to be added again to access private content.'
    )
    if (!ok) return
    try {
      await removeAlbumMember(orgId, albumId, userId)
      refreshAlbums()
      navigate('/dashboard')
    } catch (e) {
      setLeaveAlbumError(e.message || 'Could not leave album')
    }
  }

  const handlePhotoDeleted = useCallback(
    (photoKey) => {
      setPhotos((prev) => {
        const next = prev.filter((p) => p.id !== photoKey)
        if (next.length === 0) {
          queueMicrotask(() => {
            viewerOpenRef.current = false
            setViewerOpen(false)
            if (window.history.state?.kind === HISTORY_VIEWER) {
              window.history.back()
            }
          })
        }
        return next
      })
      setPhotoTotal((t) => Math.max(0, t - 1))
      refreshAlbums()
      if (orgId && albumId) {
        getAlbum(orgId, albumId).then(setAlbum).catch(() => {})
      }
    },
    [orgId, albumId, refreshAlbums]
  )
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
          {leaveAlbumError ? (
            <Text size="xs" c="var(--accent2)" mt={4}>
              {leaveAlbumError}
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
        {canManageAlbum || canLeaveAlbum ? (
          <Menu shadow="md" width={220} position="bottom-end">
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
              {canLeaveAlbum ? (
                <Menu.Item
                  color="red"
                  onClick={handleLeaveAlbum}
                  styles={{
                    item: { fontFamily: 'var(--font-body)' },
                  }}
                >
                  Leave album
                </Menu.Item>
              ) : null}
            </Menu.Dropdown>
          </Menu>
        ) : null}
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
            {lockedOutOfPhotos ? (
              <Paper
                radius="lg"
                p="xl"
                mt="md"
                mx="md"
                style={{
                  background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
                  border: '1px solid var(--border)',
                }}
              >
                <Text size="sm" style={{ color: 'var(--text)' }} mb="sm">
                  This album is visible in your organization so people know it exists.
                  To see photos, the album owner must approve your join request.
                </Text>
                {album.shareToken ? (
                  <Button
                    radius="md"
                    variant="light"
                    className="gallery-theme-btn--albums"
                    onClick={() =>
                      navigate(`/join/album/${album.shareToken}`)
                    }
                  >
                    Request access
                  </Button>
                ) : (
                  <Text size="xs" c="dimmed">
                    Ask the album owner for an invite link.
                  </Text>
                )}
              </Paper>
            ) : null}
            {useRemotePhotos && photosLoading && photos.length === 0 ? (
              <Text ta="center" c="var(--muted)" py="xl">
                Loading photos…
              </Text>
            ) : null}
            {useRemotePhotos &&
            !lockedOutOfPhotos &&
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
            {!lockedOutOfPhotos ? (
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
            ) : null}
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

      <AlbumUploadReviewModal
        opened={uploadReviewOpen}
        onClose={cancelUploadReview}
        items={uploadQueue}
        onRemove={removeFromUploadQueue}
        onConfirm={confirmUploadReview}
        busy={uploading}
        maxUploadBytes={maxUploadBytes}
        clientCompress={clientCompress}
      />

      <AlbumPhotoViewer
        opened={viewerOpen}
        onClose={closeViewer}
        photos={photos}
        initialIndex={viewerIndex}
        orgId={orgId}
        albumId={albumId}
        albumTitle={title}
        album={album}
        onPhotoDeleted={handlePhotoDeleted}
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
        canManageAlbumMembers={Boolean(
          userId &&
            album &&
            (String(album.ownerId) === String(userId) ||
              isOrgOwnerForThisPage ||
              canManageAlbumsInOrg)
        )}
        canApproveJoinRequests={Boolean(
          userId &&
            album &&
            (String(album.ownerId) === String(userId) ||
              isOrgOwnerForThisPage ||
              Boolean(orgRowForPage?.myCaps?.canApproveAlbumRequests))
        )}
        canEditAlbum={Boolean(
          userId &&
            album &&
            (String(album.ownerId) === String(userId) ||
              isOrgOwnerForThisPage ||
              (Array.isArray(album.coOwnerIds) &&
                album.coOwnerIds.some((id) => String(id) === String(userId))))
        )}
      />
    </div>
  )
}

export default AlbumPhotosPage
