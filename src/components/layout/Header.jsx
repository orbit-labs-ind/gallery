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
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IoNotificationsOutline,
  IoLogOutOutline,
  IoChevronDown,
  IoPersonOutline,
  IoSettingsOutline,
  IoAdd,
} from 'react-icons/io5'
import { logout } from '../../store/slices/authSlice'
import './Layout.css'
import Logo from '../Logo/Logo'
import { useAlbumLibraryOptional } from '../../context/AlbumLibraryContext'
import { listNotifications } from '../../api/notifications'
import { useEffect, useState } from 'react'

function Header() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const albumLibrary = useAlbumLibraryOptional()
  const openCreateAlbum = albumLibrary?.openCreateAlbum ?? (() => {})
  const dashboardMatch = useMatch({ path: '/dashboard', end: true })
  const showCreateAlbum = Boolean(
    dashboardMatch &&
      albumLibrary?.canCreateAlbum &&
      albumLibrary?.activeAlbumSegmentId !== 'joined'
  )
  const organizations = albumLibrary?.organizations ?? []
  const currentOrgId = albumLibrary?.currentOrgId ?? null
  const setCurrentOrgId = albumLibrary?.setCurrentOrgId
  const [notifications, setNotifications] = useState([])
  const unreadCount = notifications.filter((n) => !n.readAt).length

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      return
    }
    listNotifications(12)
      .then(setNotifications)
      .catch(() => setNotifications([]))
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
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
            {/* <Button
              variant="subtle"
              c="white"
              size={isMobile ? 'xs' : 'sm'}
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button> */}
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
              <Menu.Label>Notifications</Menu.Label>
              {notifications.length === 0 ? (
                <Menu.Item disabled>No notifications yet</Menu.Item>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <Menu.Item key={n.id} style={{ whiteSpace: 'normal', height: 'auto' }}>
                    <Text size="xs" fw={600} lineClamp={2}>
                      {n.title}
                    </Text>
                    {n.body ? (
                      <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
                        {n.body}
                      </Text>
                    ) : null}
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
                  <Avatar
                    src="https://robohash.org/83f3a28043cd58427867bf7ac4bfe034?set=set4"
                    radius="xl"
                  />
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

              <Menu.Item leftSection={<IoSettingsOutline size={14} />}>
                Settings
              </Menu.Item>

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
    </>
  )
}

export default Header
