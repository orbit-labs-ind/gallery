import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Keyboard, Navigation, Zoom } from 'swiper/modules'
import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
} from '@mantine/core'
import { IoClose } from 'react-icons/io5'
import {
  IconHeart,
  IconHeartFilled,
  IconFlag,
  IconMessageCircle,
  IconTrash,
} from '@tabler/icons-react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/zoom'
import {
  getPhotoEngagement,
  togglePhotoLike,
  postPhotoComment,
  submitPhotoReport,
} from '../../api/albumPhotoEngagement'
import { deleteAlbumPhoto } from '../../api/albumPhotos'
import { isDevForceAuthEnabled } from '../../store/slices/authSlice'
import {
  computeVisualCommentPlacements,
  displayCommentAuthor,
} from './visualCommentLayout'
import { AuthedAlbumImage } from './AuthedAlbumImage'
import './AlbumPhotoViewer.css'

function CommentDrawerAuthorRow({ comment: c }) {
  const u = c.user
  return (
    <Group gap={8} wrap="nowrap" align="center">
      {u?.profilePhotoStreamPath ? (
        <AuthedAlbumImage
          streamPath={u.profilePhotoStreamPath}
          alt=""
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      ) : null}
      <Text size="xs" c="var(--accent3)" fw={600}>
        {displayCommentAuthor(c)}
      </Text>
    </Group>
  )
}

function defaultEngagement() {
  return {
    likeCount: 0,
    likedByMe: false,
    viewerCanDelete: false,
    comments: [],
    reportContext: {
      albumOwner: { id: '', email: 'Album owner' },
      uploadedBy: null,
    },
  }
}

export function AlbumPhotoViewer({
  opened,
  onClose,
  photos,
  initialIndex,
  orgId,
  albumId,
  albumTitle,
  album,
  onPhotoDeleted,
}) {
  const swiperRef = useRef(null)
  /** Each photoKey fetched at most once per album session (no API on every swipe). */
  const engagementLoadedKeysRef = useRef(new Set())
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [engagementByKey, setEngagementByKey] = useState({})
  const [showVisualComments, setShowVisualComments] = useState(true)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [reportDraft, setReportDraft] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [sendingReport, setSendingReport] = useState(false)
  const [deletingPhoto, setDeletingPhoto] = useState(false)
  const [actionError, setActionError] = useState('')

  const useRemote =
    Boolean(orgId && albumId) && !isDevForceAuthEnabled()

  const streamPathForPhoto = useCallback(
    (photoId) => {
      if (!useRemote || !orgId || !albumId || !photoId) return null
      return `/organizations/${orgId}/albums/${albumId}/photos/${encodeURIComponent(photoId)}/file`
    },
    [useRemote, orgId, albumId]
  )

  const currentPhoto = photos[activeIndex]
  const photoKey = currentPhoto?.id

  const mergeEngagement = useCallback((key, patch) => {
    setEngagementByKey((prev) => ({
      ...prev,
      [key]: { ...defaultEngagement(), ...prev[key], ...patch },
    }))
  }, [])

  const loadEngagement = useCallback(
    async (key) => {
      if (!key) return
      if (engagementLoadedKeysRef.current.has(key)) return

      if (!useRemote) {
        mergeEngagement(key, {
          ...defaultEngagement(),
          viewerCanDelete: false,
          reportContext: {
            albumOwner: {
              id: album?.ownerId ? String(album.ownerId) : '',
              email: album?.ownerId
                ? `User …${String(album.ownerId).slice(-6)}`
                : 'Album owner',
            },
            uploadedBy: null,
          },
        })
        engagementLoadedKeysRef.current.add(key)
        return
      }
      try {
        const data = await getPhotoEngagement(orgId, albumId, key)
        mergeEngagement(key, {
          likeCount: data.likeCount ?? 0,
          likedByMe: Boolean(data.likedByMe),
          viewerCanDelete: Boolean(data.viewerCanDelete),
          comments: Array.isArray(data.comments) ? data.comments : [],
          reportContext: data.reportContext || defaultEngagement().reportContext,
        })
        engagementLoadedKeysRef.current.add(key)
      } catch {
        mergeEngagement(key, {
          ...defaultEngagement(),
          viewerCanDelete: false,
          reportContext: {
            albumOwner: {
              id: album?.ownerId ? String(album.ownerId) : '',
              email: album?.ownerId
                ? `User …${String(album.ownerId).slice(-6)}`
                : '—',
            },
            uploadedBy: null,
          },
        })
        engagementLoadedKeysRef.current.add(key)
      }
    },
    [album, albumId, mergeEngagement, orgId, useRemote]
  )

  useEffect(() => {
    if (!opened || photos.length === 0) return
    if (activeIndex > photos.length - 1) {
      const next = Math.max(0, photos.length - 1)
      setActiveIndex(next)
      requestAnimationFrame(() => swiperRef.current?.slideTo(next, 0))
    }
  }, [opened, photos.length, activeIndex])

  useEffect(() => {
    engagementLoadedKeysRef.current = new Set()
    setEngagementByKey({})
  }, [orgId, albumId])

  useEffect(() => {
    if (!opened) {
      setCommentsOpen(false)
      setReportOpen(false)
      setCommentDraft('')
      setReportDraft('')
      setActionError('')
      setShowVisualComments(true)
      return
    }
    setActiveIndex(initialIndex)
    const t = requestAnimationFrame(() => {
      swiperRef.current?.slideTo(initialIndex, 0)
    })
    return () => cancelAnimationFrame(t)
  }, [opened, initialIndex])

  useEffect(() => {
    if (!opened || !photoKey) return
    loadEngagement(photoKey)
  }, [opened, photoKey, loadEngagement])

  useEffect(() => {
    if (!opened) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (commentsOpen || reportOpen) return
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'ArrowLeft' && !commentsOpen && !reportOpen) {
        e.preventDefault()
        swiperRef.current?.slidePrev()
      }
      if (e.key === 'ArrowRight' && !commentsOpen && !reportOpen) {
        e.preventDefault()
        swiperRef.current?.slideNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [opened, onClose, commentsOpen, reportOpen])

  const engagement = photoKey
    ? { ...defaultEngagement(), ...engagementByKey[photoKey] }
    : defaultEngagement()

  const visualPlacements = useMemo(
    () =>
      computeVisualCommentPlacements(
        engagement.comments,
        photoKey || 'none',
        4
      ),
    [engagement.comments, photoKey]
  )

  const handleToggleLike = async () => {
    if (!photoKey) return
    setActionError('')
    if (!useRemote) {
      const cur = engagementByKey[photoKey] || defaultEngagement()
      const nextLiked = !cur.likedByMe
      mergeEngagement(photoKey, {
        likedByMe: nextLiked,
        likeCount: Math.max(0, (cur.likeCount || 0) + (nextLiked ? 1 : -1)),
      })
      return
    }
    try {
      const data = await togglePhotoLike(orgId, albumId, photoKey)
      mergeEngagement(photoKey, {
        likeCount: data.likeCount,
        likedByMe: data.likedByMe,
      })
    } catch (err) {
      setActionError(err.message || 'Like failed')
    }
  }

  const handleSendComment = async () => {
    const text = commentDraft.trim()
    if (!text || !photoKey) return
    setSendingComment(true)
    setActionError('')
    try {
      if (!useRemote) {
        const cur = engagementByKey[photoKey] || defaultEngagement()
        mergeEngagement(photoKey, {
          comments: [
            ...cur.comments,
            {
              id: `local-${Date.now()}`,
              body: text,
              createdAt: new Date().toISOString(),
              user: { id: 'me', email: 'You' },
            },
          ],
        })
        setCommentDraft('')
        return
      }
      const { comment } = await postPhotoComment(orgId, albumId, photoKey, text)
      const cur = engagementByKey[photoKey] || defaultEngagement()
      mergeEngagement(photoKey, {
        comments: [...cur.comments, comment],
      })
      setCommentDraft('')
    } catch (err) {
      setActionError(err.message || 'Could not post comment')
    } finally {
      setSendingComment(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!photoKey || !useRemote || !orgId || !albumId) return
    const ok = window.confirm('Delete this photo permanently? This cannot be undone.')
    if (!ok) return
    setDeletingPhoto(true)
    setActionError('')
    try {
      await deleteAlbumPhoto(orgId, albumId, photoKey)
      engagementLoadedKeysRef.current.delete(photoKey)
      onPhotoDeleted?.(photoKey)
    } catch (err) {
      setActionError(err.message || 'Could not delete photo')
    } finally {
      setDeletingPhoto(false)
    }
  }

  const handleSubmitReport = async () => {
    const msg = reportDraft.trim()
    if (!msg || !photoKey) return
    setSendingReport(true)
    setActionError('')
    try {
      if (!useRemote) {
        setReportDraft('')
        setReportOpen(false)
        return
      }
      await submitPhotoReport(orgId, albumId, photoKey, msg)
      setReportDraft('')
      setReportOpen(false)
    } catch (err) {
      setActionError(err.message || 'Could not send report')
    } finally {
      setSendingReport(false)
    }
  }

  if (!opened || photos.length === 0) return null

  const uploaderLabel = engagement.reportContext?.uploadedBy
    ? engagement.reportContext.uploadedBy.email ||
      engagement.reportContext.uploadedBy.id
    : 'Not recorded (mock or legacy photo)'

  return (
    <div
      className="album-photo-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <div className="album-photo-viewer__top">
        <ActionIcon
          variant="filled"
          size="xl"
          radius="xl"
          aria-label="Close"
          className="album-photo-viewer__close"
          onClick={onClose}
        >
          <IoClose size={28} />
        </ActionIcon>
      </div>

      <div className="album-photo-viewer__swiper-wrap">
        <Swiper
          className="album-photo-viewer__swiper"
          modules={[Keyboard, Navigation, Zoom]}
          keyboard={{ enabled: true }}
          zoom={{ maxRatio: 4, minRatio: 1 }}
          navigation={false}
          initialSlide={initialIndex}
          spaceBetween={0}
          slidesPerView={1}
          speed={320}
          onSwiper={(sw) => {
            swiperRef.current = sw
          }}
          onSlideChange={(sw) => setActiveIndex(sw.activeIndex)}
          onTap={() => {
            if (commentsOpen || reportOpen) return
            setShowVisualComments((v) => !v)
          }}
          onSlideChangeTransitionEnd={(sw) => {
            try {
              sw.zoom?.out?.()
            } catch {
              /* noop */
            }
          }}
        >
          {photos.map((p) => (
            <SwiperSlide key={p.id}>
              <div className="swiper-zoom-container">
                <AuthedAlbumImage
                  streamPath={streamPathForPhoto(p.id)}
                  variant="full"
                  directSrc={p.url}
                  alt=""
                  draggable={false}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {showVisualComments && visualPlacements.length > 0 ? (
          <div
            className="album-photo-viewer__visual-layer"
            aria-hidden="true"
          >
            {visualPlacements.map(({ comment, left, top, w }, idx) => (
              <div
                key={comment.id || `vc-${idx}`}
                className="album-photo-viewer__visual-chip"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${w}%`,
                  maxWidth: `${w}%`,
                }}
              >
                <span className="album-photo-viewer__visual-chip-author">
                  {displayCommentAuthor(comment)}
                </span>
                <p className="album-photo-viewer__visual-chip-body">
                  {comment.body}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="album-photo-viewer__bottom">
        <button
          type="button"
          className={`album-photo-viewer__action${engagement.likedByMe ? ' album-photo-viewer__action--liked' : ''}`}
          onClick={handleToggleLike}
        >
          {engagement.likedByMe ? (
            <IconHeartFilled size={26} stroke={1.25} />
          ) : (
            <IconHeart size={26} stroke={1.5} />
          )}
          <span className="album-photo-viewer__action-count">
            {engagement.likeCount}
          </span>
        </button>
        <button
          type="button"
          className="album-photo-viewer__action album-photo-viewer__action--comments"
          onClick={() => setCommentsOpen(true)}
        >
          <span className="album-photo-viewer__action-iconwrap">
            <IconMessageCircle size={26} stroke={1.5} />
            {(engagement.comments?.length || 0) > 0 ? (
              <span className="album-photo-viewer__action-badge">
                {engagement.comments.length > 99
                  ? '99+'
                  : engagement.comments.length}
              </span>
            ) : null}
          </span>
          <span>Comments</span>
        </button>
        <button
          type="button"
          className="album-photo-viewer__action"
          onClick={() => setReportOpen(true)}
        >
          <IconFlag size={26} stroke={1.5} />
          <span>Report</span>
        </button>
        {useRemote && engagement.viewerCanDelete ? (
          <button
            type="button"
            className="album-photo-viewer__action album-photo-viewer__action--delete"
            onClick={handleDeletePhoto}
            disabled={deletingPhoto}
            aria-label="Delete photo"
          >
            <IconTrash size={26} stroke={1.5} />
            <span>Delete</span>
          </button>
        ) : null}
      </div>

      {actionError ? (
        <Text size="xs" c="var(--accent2)" ta="center" px="md" pb="xs">
          {actionError}
        </Text>
      ) : null}

      <Drawer
        opened={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        position="bottom"
        size="55%"
        title="All comments"
        styles={{
          content: {
            background: 'var(--surface)',
            fontFamily: 'var(--font-body)',
          },
          header: {
            background: 'var(--surface2)',
            borderBottom: '1px solid var(--border)',
          },
          title: {
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
          },
          body: { paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' },
        }}
      >
        <Stack gap="md">
          <div
            style={{
              maxHeight: 'min(38vh, 280px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {engagement.comments?.length ? (
              engagement.comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {c.user?.id ? (
                    <Link
                      className="album-photo-viewer__comment-author-link"
                      to={`/profile/${encodeURIComponent(String(c.user.id))}`}
                      onClick={() => setCommentsOpen(false)}
                      aria-label={`View ${displayCommentAuthor(c)}'s profile`}
                    >
                      <CommentDrawerAuthorRow comment={c} />
                    </Link>
                  ) : (
                    <CommentDrawerAuthorRow comment={c} />
                  )}
                  <Text size="sm" c="var(--text)" mt={4}>
                    {c.body}
                  </Text>
                </div>
              ))
            ) : (
              <Text size="sm" c="var(--muted)">
                No comments yet.
              </Text>
            )}
          </div>
          <Textarea
            placeholder="Write a comment…"
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            minRows={2}
            maxLength={2000}
            styles={{
              input: {
                background: 'var(--surface2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              },
            }}
          />
          <Button
            className="gallery-theme-btn--primary"
            onClick={handleSendComment}
            loading={sendingComment}
            disabled={!commentDraft.trim()}
          >
            Post comment
          </Button>
        </Stack>
      </Drawer>

      <Modal
        opened={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report photo"
        size="sm"
        radius="lg"
        styles={{
          content: {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          },
          title: {
            color: 'var(--text)',
            fontFamily: 'var(--font-display)',
          },
          body: { fontFamily: 'var(--font-body)' },
        }}
      >
        <Stack gap="sm">
          <Text size="sm" c="var(--muted)">
            Album:{' '}
            <Text span c="var(--text)" fw={600}>
              {albumTitle || '—'}
            </Text>
          </Text>
          <Text size="sm" c="var(--muted)">
            Album owner:{' '}
            <Text span c="var(--text)">
              {engagement.reportContext?.albumOwner?.email ||
                (album?.ownerId ? `User …${String(album.ownerId).slice(-6)}` : '—')}
            </Text>
          </Text>
          <Text size="sm" c="var(--muted)">
            Uploaded by:{' '}
            <Text span c="var(--text)">
              {uploaderLabel}
            </Text>
          </Text>
          <Textarea
            label="Your feedback"
            description="We notify the album owner. Moderation tools arrive later."
            placeholder="Describe what’s wrong…"
            value={reportDraft}
            onChange={(e) => setReportDraft(e.target.value)}
            minRows={4}
            maxLength={4000}
            styles={{
              input: {
                background: 'var(--surface2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              },
              label: { color: 'var(--text)' },
            }}
          />
          <Button
            className="gallery-theme-btn--delete"
            onClick={handleSubmitReport}
            loading={sendingReport}
            disabled={!reportDraft.trim()}
          >
            Send report
          </Button>
        </Stack>
      </Modal>
    </div>
  )
}
