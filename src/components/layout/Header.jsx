import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import {
  Group,
  Button,
  Avatar,
  Menu,
  ActionIcon,
  UnstyledButton,
  Drawer,
  Burger,
  Indicator
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IoImage,
  IoNotificationsOutline,
  IoLogOutOutline,
  IoChevronDown,
  IoPersonOutline,
  IoSettingsOutline,
  IoAdd,
} from 'react-icons/io5'
import { logout } from '../../store/slices/authSlice'
import Sidebar from './Sidebar'
import './Layout.css'
import Logo from '../Logo/Logo'
import { useAlbumLibraryOptional } from '../../context/AlbumLibraryContext'

function Header() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [opened, { toggle, close }] = useDisclosure(false)
  const albumLibrary = useAlbumLibraryOptional()
  const openCreateAlbum = albumLibrary?.openCreateAlbum ?? (() => {})

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
          {isMobile && <Burger opened={opened} onClick={toggle} color="white" />}
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Logo size={isMobile ? 26 : 30} color="white" />
          </Link>
        </Group>

        <Group gap={isMobile ? '6px' : 'sm'} wrap="nowrap">
          <Button
            leftSection={<IoAdd size={18} />}
            variant="light"
            color="pink"
            size={isMobile ? 'xs' : 'sm'}
            radius="xl"
            onClick={openCreateAlbum}
            styles={{
              root: {
                background: 'rgba(255, 107, 157, 0.18)',
                color: '#fff',
                border: '1px solid rgba(255, 107, 157, 0.35)',
              },
            }}
          >
            {isMobile ? 'New' : 'Create album'}
          </Button>

          {/* 🔔 Notification Dropdown */}
          <Menu shadow="md" width={260} position="bottom-end" withArrow>
            <Menu.Target>
              <Indicator color="red" size={8} offset={4}>
                <ActionIcon variant="subtle" size="lg" c="white">
                  <IoNotificationsOutline size={22} />
                </ActionIcon>
              </Indicator>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Notifications</Menu.Label>

              <Menu.Item>
                📸 New photo uploaded
              </Menu.Item>

              <Menu.Item>
                💬 Someone commented on your album
              </Menu.Item>

              <Menu.Item>
                ⭐ Your photo received a like
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item color="blue">
                View all notifications
              </Menu.Item>
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

              <Menu.Item leftSection={<IoPersonOutline size={14} />}>
                Profile
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

      {isMobile && (
        <Drawer
          opened={opened}
          onClose={close}
          size="75%"
          padding="md"
          title="Menu"
          position="left"
        >
          <Sidebar />
        </Drawer>
      )}
    </>
  )
}

export default Header
