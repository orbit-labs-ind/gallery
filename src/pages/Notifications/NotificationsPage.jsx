import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ActionIcon,
  Group,
  SegmentedControl,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IoArchiveOutline, IoChevronForward } from 'react-icons/io5'
import {
  archiveAllNotifications,
  archiveNotification,
  listNotifications,
  markNotificationRead,
  unarchiveNotification,
} from '../../api/notifications'
import { notificationTargetPath } from '../../utils/notificationPaths'
import { GALLERY_NOTIFY_EVENT } from '../../hooks/useNotificationSocket'

function formatWhen(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function SwipeArchiveRow({ children, onArchive, disabled }) {
  const startX = useRef(0)
  const dxRef = useRef(0)
  const [dx, setDx] = useState(0)
  const dragging = useRef(false)

  const onStart = (clientX) => {
    if (disabled) return
    dragging.current = true
    startX.current = clientX
    dxRef.current = 0
    setDx(0)
  }
  const onMove = (clientX) => {
    if (!dragging.current || disabled) return
    const d = Math.min(0, clientX - startX.current)
    dxRef.current = d
    setDx(d)
  }
  const onEnd = () => {
    if (!dragging.current) return
    dragging.current = false
    if (dxRef.current < -56) {
      onArchive()
    }
    dxRef.current = 0
    setDx(0)
  }

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}
      onTouchStart={(e) => onStart(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
      onTouchCancel={onEnd}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(239, 68, 68, 0.25)',
          color: '#fecaca',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Archive
      </div>
      <div
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging.current ? 'none' : 'transform 0.2s ease',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [scope, setScope] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await listNotifications(200, scope)
      setItems(rows)
    } catch (e) {
      setError(e.message || 'Could not load notifications')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [scope])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const onPush = (e) => {
      const n = e.detail
      if (!n?.id) return
      setItems((prev) => {
        if (prev.some((x) => String(x.id) === String(n.id))) return prev
        return [n, ...prev]
      })
    }
    window.addEventListener(GALLERY_NOTIFY_EVENT, onPush)
    return () => window.removeEventListener(GALLERY_NOTIFY_EVENT, onPush)
  }, [])

  const handleOpen = async (n) => {
    try {
      await markNotificationRead(n.id)
    } catch {
      /* still navigate */
    }
    setItems((prev) =>
      prev.map((x) =>
        String(x.id) === String(n.id) ? { ...x, readAt: new Date().toISOString() } : x
      )
    )
    const path = notificationTargetPath(n)
    if (path) navigate(path)
  }

  const handleArchive = async (n) => {
    try {
      if (n.archivedAt) {
        await unarchiveNotification(n.id)
        setItems((prev) =>
          prev.map((x) =>
            String(x.id) === String(n.id) ? { ...x, archivedAt: null } : x
          )
        )
      } else {
        await archiveNotification(n.id)
        setItems((prev) =>
          prev.map((x) =>
            String(x.id) === String(n.id)
              ? { ...x, archivedAt: new Date().toISOString() }
              : x
          )
        )
      }
    } catch {
      /* noop */
    }
  }

  const handleArchiveAll = async () => {
    try {
      await archiveAllNotifications()
      await load()
    } catch {
      /* noop */
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="lg">
        <div>
          <Title order={2} c="var(--text)" mb={4}>
            Notifications
          </Title>
          <Text size="sm" c="var(--muted)">
            Tap a row to open. Swipe left on mobile to archive.
          </Text>
        </div>
        <ActionIcon
          variant="light"
          color="gray"
          size="lg"
          radius="md"
          aria-label="Archive all active notifications"
          title="Archive all"
          onClick={handleArchiveAll}
        >
          <IoArchiveOutline size={22} />
        </ActionIcon>
      </Group>

      <SegmentedControl
        fullWidth
        mb="md"
        value={scope}
        onChange={setScope}
        data={[
          { label: 'All', value: 'all' },
          { label: 'Inbox', value: 'active' },
          { label: 'Archived', value: 'archived' },
        ]}
      />

      {error ? (
        <Text c="red" size="sm">
          {error}
        </Text>
      ) : null}
      {loading ? (
        <Text c="dimmed" size="sm">
          Loading…
        </Text>
      ) : null}

      <Stack gap="sm">
        {!loading && items.length === 0 ? (
          <Text c="dimmed" size="sm">
            No notifications in this view.
          </Text>
        ) : null}
        {items.map((n) => {
          const unread = !n.readAt
          const swipeEnabled = scope !== 'archived' && !n.archivedAt

          return (
            <SwipeArchiveRow
              key={n.id}
              disabled={!swipeEnabled}
              onArchive={() => {
                if (swipeEnabled) handleArchive(n)
              }}
            >
              <Group wrap="nowrap" gap={0} align="stretch">
                <UnstyledButton
                  onClick={() => handleOpen(n)}
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    padding: '12px 14px',
                    color: 'var(--text)',
                  }}
                >
                  <Group justify="space-between" wrap="nowrap" gap="sm" align="flex-start">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Group gap={8} wrap="nowrap" align="center">
                        {unread ? (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: 'var(--accent3, #2dd4bf)',
                              flexShrink: 0,
                            }}
                          />
                        ) : null}
                        <Text size="sm" fw={600} lineClamp={2}>
                          {n.title}
                        </Text>
                      </Group>
                      {n.body ? (
                        <Text size="xs" c="dimmed" mt={6} lineClamp={3}>
                          {n.body}
                        </Text>
                      ) : null}
                      <Text size="xs" c="dimmed" mt={6}>
                        {formatWhen(n.createdAt)}
                      </Text>
                    </div>
                    <IoChevronForward
                      size={18}
                      style={{ flexShrink: 0, opacity: 0.45, marginTop: 2 }}
                    />
                  </Group>
                </UnstyledButton>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  radius={0}
                  aria-label={n.archivedAt ? 'Unarchive' : 'Archive'}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleArchive(n)
                  }}
                  style={{ alignSelf: 'stretch', borderLeft: '1px solid var(--border)' }}
                >
                  <IoArchiveOutline size={20} />
                </ActionIcon>
              </Group>
            </SwipeArchiveRow>
          )
        })}
      </Stack>
    </div>
  )
}
