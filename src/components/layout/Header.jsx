import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Group,
  Text,
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
  IoSettingsOutline
} from "react-icons/io5";
import { logout } from '../../store/slices/authSlice';
import Sidebar from './Sidebar';

function Header() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [opened, { toggle, close }] = useDisclosure(false);

 
  if (!isAuthenticated) {
    return (
      <>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '0 1rem' : '0 2rem',
          backgroundColor: '#7f8390',
          color: 'white',
          height: '72px'
        }}>
          <Group>
            {isMobile && (
              <Burger
                opened={opened}
                onClick={toggle}
                color="white"
              />
            )}

            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group gap="xs">
                <IoImage size={26} />
                <Text fw={700}>Gallery</Text>
              </Group>
            </Link>
          </Group>

          {!isMobile && (
            <Group>
              <Button
                variant="subtle"
                style={{ color: 'white' }}
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>

              <Button
                variant="filled"
                color="indigo"
                onClick={() => navigate('/login')}
              >
                Get Started
              </Button>
            </Group>
          )}
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
    );
  }

  return (
    <>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '0 1rem' : '0 2rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        height: '64px'
      }}>
        <Group>
          {isMobile && (
            <Burger
              opened={opened}
              onClick={toggle}
            />
          )}

          <Text fw={700}>Dashboard</Text>
        </Group>

        <Group>

          {/* 🔔 Notification Dropdown */}
          <Menu shadow="md" width={260} position="bottom-end" withArrow>
            <Menu.Target>
              <Indicator color="red" size={8} offset={4}>
                <ActionIcon variant="subtle" size="lg">
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
                <Group gap="xs">
                  <Avatar
                    src="https://robohash.org/83f3a28043cd58427867bf7ac4bfe034?set=set4"
                    radius="xl"
                  />
                  <IoChevronDown size={14} />
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
  );
}

export default Header;
