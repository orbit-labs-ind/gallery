import { Link, useNavigate, useMatch } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import {
  Group,
  Button,
  Avatar,
  Menu,
  ActionIcon,
  UnstyledButton,
  Indicator,
  Text,
  Modal,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks';
import {
  IoNotificationsOutline,
  IoLogOutOutline,
  IoChevronDown,
  IoPersonOutline,
  IoSettingsOutline,
  IoAdd,
  IoArchiveOutline,
  IoDownloadOutline,
} from 'react-icons/io5'
import { logout } from '../../store/slices/authSlice'
import './Layout.css'
import Logo from '../Logo/Logo'
import {
  useAlbumLibraryOptional,
  ALBUM_SEGMENTS_WITHOUT_CREATE,
} from '../../context/AlbumLibraryContext'
import {
  archiveAllNotifications,
  archiveNotification,
  listNotifications,
  markNotificationRead,
} from '../../api/notifications'
import { useEffect, useState } from 'react'
import { notificationTargetPath } from '../../utils/notificationPaths'
import { GALLERY_NOTIFY_EVENT } from '../../hooks/useNotificationSocket'
import { AuthedAlbumImage } from '../../pages/AlbumPhotos/AuthedAlbumImage'
import { usePwaInstallPrompt } from '../../hooks/usePwaInstallPrompt'

function Header() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const profile = useSelector((state) => state.currentUser.profile)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const albumLibrary = useAlbumLibraryOptional()
  const openCreateAlbum = albumLibrary?.openCreateAlbum ?? (() => {})
  const dashboardMatch = useMatch({ path: '/dashboard', end: true })
  const showCreateAlbum = Boolean(
    dashboardMatch &&
      albumLibrary?.canCreateAlbum &&
      !ALBUM_SEGMENTS_WITHOUT_CREATE.has(
        albumLibrary?.activeAlbumSegmentId || ''
      )
  )
  const organizations = albumLibrary?.organizations ?? []
  const currentOrgId = albumLibrary?.currentOrgId ?? null
  const setCurrentOrgId = albumLibrary?.setCurrentOrgId
  const [notifications, setNotifications] = useState([])
  const unreadCount = notifications.filter((n) => !n.readAt).length
  const pwaInstall = usePwaInstallPrompt()
  const [iosInstallOpen, setIosInstallOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      return
    }
    listNotifications(12, 'active')
      .then(setNotifications)
      .catch(() => setNotifications([]))
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    const onPush = (e) => {
      const n = e.detail
      if (!n?.id) return
      setNotifications((prev) => {
        if (prev.some((x) => String(x.id) === String(n.id))) return prev
        return [n, ...prev].slice(0, 12)
      })
    }
    window.addEventListener(GALLERY_NOTIFY_EVENT, onPush)
    return () => window.removeEventListener(GALLERY_NOTIFY_EVENT, onPush)
  }, [isAuthenticated])

  const handleNotificationClick = async (n) => {
    try {
      await markNotificationRead(n.id)
    } catch {
      /* navigate anyway */
    }
    setNotifications((prev) =>
      prev.map((x) =>
        String(x.id) === String(n.id) ? { ...x, readAt: new Date().toISOString() } : x
      )
    )
    const path = notificationTargetPath(n)
    if (path) navigate(path)
  }

  const handleArchiveOne = async (e, n) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await archiveNotification(n.id)
      setNotifications((prev) => prev.filter((x) => String(x.id) !== String(n.id)))
    } catch {
      /* noop */
    }
  }

  const handleArchiveAllMenu = async (e) => {
    e.preventDefault()
    try {
      await archiveAllNotifications()
      setNotifications([])
    } catch {
      /* noop */
    }
  }

  if (!isAuthenticated) {
    return (
      <>
      <header className="header-glass">
        <div className="header-glass-inner" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '0 1rem' : '0 2rem',
          height: '72px'
        }}>
          <Group>
            <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
              <Logo size={30} color="white" />
            </Link>
          </Group>

          <Group gap={isMobile ? 'xs' : 'md'} wrap="nowrap">
            {pwaInstall.canUseNativeInstallPrompt ? (
              <Button
                variant="outline"
                color="gray"
                size={isMobile ? 'xs' : 'sm'}
                radius="xl"
                leftSection={<IoDownloadOutline size={16} />}
                onClick={() => pwaInstall.promptInstall()}
                c="rgba(255,255,255,0.9)"
                style={{ borderColor: 'rgba(255,255,255,0.25)' }}
              >
                {isMobile ? 'App' : 'Install app'}
              </Button>
            ) : null}
            {pwaInstall.showIosAddToHomeHint ? (
              <Button
                variant="outline"
                color="gray"
                size={isMobile ? 'xs' : 'sm'}
                radius="xl"
                onClick={() => setIosInstallOpen(true)}
                c="rgba(255,255,255,0.9)"
                style={{ borderColor: 'rgba(255,255,255,0.25)' }}
              >
                {isMobile ? 'Add app' : 'Add to Home Screen'}
              </Button>
            ) : null}
            <Button
              variant="light"
              color="pink"
              size={isMobile ? 'xs' : 'sm'}
              onClick={() => navigate('/login')}
              className='landing-cta-header'
            >
              {isMobile ? 'Start' : 'Get Started'}
            </Button>
          </Group>
        </div>
      </header>

      <Modal
        opened={iosInstallOpen}
        onClose={() => setIosInstallOpen(false)}
        title="Install PicPoint"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Text size="sm" c="dimmed">
          On iPhone or iPad, use <strong>Safari</strong>. Tap the <strong>Share</strong> button, then{' '}
          <strong>Add to Home Screen</strong>. Open PicPoint from the new icon — it runs full screen like a
          native app (not a browser tab shortcut).
        </Text>
      </Modal>
      </>
    )
  }

  return (
    <>
      <header
        className="header-dashboard"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '0 1rem' : '0 2rem',
          background: 'rgba(10, 10, 14, 0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          height: '64px',
        }}
      >
        <Group gap="sm" wrap="nowrap">
          <Link to="/organizations" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Logo size={isMobile ? 26 : 30} color="white" />
          </Link>
        </Group>

        <Group gap={isMobile ? '6px' : 'sm'} wrap="nowrap">
          <Button
            component={Link}
            to="/shared-albums"
            variant="subtle"
            color="gray"
            size={isMobile ? 'xs' : 'sm'}
            radius="xl"
            c="rgba(255,255,255,0.85)"
          >
            {isMobile ? 'Shared' : 'Shared albums'}
          </Button>
          {showCreateAlbum ? (
            <Button
              leftSection={<IoAdd size={18} />}
              variant="light"
              color="teal"
              size={isMobile ? 'xs' : 'sm'}
              radius="xl"
              onClick={openCreateAlbum}
              styles={{
                root: {
                  background: 'rgba(45, 212, 191, 0.14)',
                  color: '#fff',
                  border: '1px solid rgba(45, 212, 191, 0.4)',
                },
              }}
            >
              {isMobile ? 'New' : 'Create album'}
            </Button>
          ) : null}

          {pwaInstall.canUseNativeInstallPrompt ? (
            <Button
              variant="light"
              size={isMobile ? 'xs' : 'sm'}
              radius="xl"
              leftSection={<IoDownloadOutline size={16} />}
              onClick={() => pwaInstall.promptInstall()}
              styles={{
                root: {
                  background: 'color-mix(in srgb, var(--accent3) 18%, transparent)',
                  color: '#fff',
                  border: '1px solid color-mix(in srgb, var(--accent3) 42%, transparent)',
                },
              }}
            >
              {isMobile ? 'App' : 'Install app'}
            </Button>
          ) : null}
          {pwaInstall.showIosAddToHomeHint ? (
            <Button
              variant="subtle"
              size={isMobile ? 'xs' : 'sm'}
              radius="xl"
              c="rgba(255,255,255,0.85)"
              onClick={() => setIosInstallOpen(true)}
            >
              {isMobile ? 'Add app' : 'Add to Home Screen'}
            </Button>
          ) : null}

          {/* 🔔 Notification Dropdown */}
          <Menu shadow="md" width={280} position="bottom-end" withArrow>
            <Menu.Target>
              {unreadCount > 0 ? (
                <Indicator color="red" size={8} offset={4}>
                  <ActionIcon variant="subtle" size="lg" c="white">
                    <IoNotificationsOutline size={22} />
                  </ActionIcon>
                </Indicator>
              ) : (
                <ActionIcon variant="subtle" size="lg" c="white">
                  <IoNotificationsOutline size={22} />
                </ActionIcon>
              )}
            </Menu.Target>

            <Menu.Dropdown>
              <Group justify="space-between" wrap="nowrap" px="sm" py={6}>
                <Menu.Label style={{ marginBottom: 0 }}>Notifications</Menu.Label>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color="gray"
                  aria-label="Archive all"
                  title="Archive all"
                  onClick={handleArchiveAllMenu}
                >
                  <IoArchiveOutline size={18} />
                </ActionIcon>
              </Group>
              <Menu.Item
                component={Link}
                to="/notifications"
                style={{ fontSize: 12 }}
              >
                View all & history
              </Menu.Item>
              <Menu.Divider />
              {notifications.length === 0 ? (
                <Menu.Item disabled>No new notifications</Menu.Item>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <Menu.Item
                    key={n.id}
                    closeMenuOnClick={false}
                    style={{ whiteSpace: 'normal', height: 'auto', paddingRight: 36 }}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <Group justify="space-between" wrap="nowrap" gap={6} align="flex-start">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Group gap={6} wrap="nowrap" align="center">
                          {!n.readAt ? (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: '#2dd4bf',
                                flexShrink: 0,
                              }}
                            />
                          ) : null}
                          <Text size="xs" fw={600} lineClamp={2}>
                            {n.title}
                          </Text>
                        </Group>
                        {n.body ? (
                          <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
                            {n.body}
                          </Text>
                        ) : null}
                      </div>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color="gray"
                        aria-label="Archive"
                        onClick={(ev) => handleArchiveOne(ev, n)}
                      >
                        <IoArchiveOutline size={16} />
                      </ActionIcon>
                    </Group>
                  </Menu.Item>
                ))
              )}
            </Menu.Dropdown>
          </Menu>

          {/* 👤 User Dropdown */}
          <Menu shadow="md" width={200} position="bottom-end" withArrow>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs" wrap="nowrap">
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    {profile?.profilePhotoStreamPath ? (
                      <AuthedAlbumImage
                        streamPath={profile.profilePhotoStreamPath}
                        alt=""
                        style={{ width: 34, height: 34, objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <Avatar radius="xl" size={34} color="teal">
                        {(profile?.username || profile?.email || '?').charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                  </div>
                  {!isMobile ? (
                    <Text size="sm" c="rgba(255,255,255,0.85)" lineClamp={1} maw={120}>
                      {profile?.username || profile?.email?.split('@')[0] || 'Account'}
                    </Text>
                  ) : null}
                  <IoChevronDown size={14} color="rgba(255,255,255,0.8)" />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>

              {organizations.length > 0 ? (
                <>
                  <Menu.Label>Current organization</Menu.Label>
                  {organizations.map((org) => (
                    <Menu.Item
                      key={org.id}
                      onClick={() => {
                        setCurrentOrgId?.(org.id)
                        navigate('/dashboard')
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap" gap="xs">
                        <Text size="sm" lineClamp={1}>
                          {org.name}
                        </Text>
                        {String(org.id) === String(currentOrgId) ? (
                          <Text size="xs" c="teal.3">
                            Active
                          </Text>
                        ) : null}
                      </Group>
                    </Menu.Item>
                  ))}
                  <Menu.Divider />
                </>
              ) : null}

              <Menu.Item
                leftSection={<IoPersonOutline size={14} />}
                onClick={() => navigate('/organizations')}
              >
                Organizations
              </Menu.Item>

              <Menu.Item
                leftSection={<IoSettingsOutline size={14} />}
                onClick={() => navigate('/settings/profile')}
              >
                Settings
              </Menu.Item>

              {pwaInstall.showIosAddToHomeHint ? (
                <Menu.Item
                  leftSection={<IoDownloadOutline size={14} />}
                  onClick={() => setIosInstallOpen(true)}
                >
                  Install on this device
                </Menu.Item>
              ) : null}

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IoLogOutOutline size={14} />}
                onClick={() => dispatch(logout())}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </header>

      <Modal
        opened={iosInstallOpen}
        onClose={() => setIosInstallOpen(false)}
        title="Install PicPoint"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Text size="sm" c="dimmed">
          On iPhone or iPad, use <strong>Safari</strong>. Tap the <strong>Share</strong> button, then{' '}
          <strong>Add to Home Screen</strong>. Open PicPoint from the new icon — it runs full screen like a
          native app (not a browser tab shortcut).
        </Text>
      </Modal>
    </>
  )
}

export default Header
