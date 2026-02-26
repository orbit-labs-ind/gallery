import { useNavigate } from 'react-router-dom';
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
  Indicator,
  Flex
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import {
  IoNotificationsOutline,
  IoLogOutOutline,
  IoChevronDown,
  IoPersonOutline,
  IoSettingsOutline
} from "react-icons/io5";
import { logout } from '../../store/slices/authSlice';
import Sidebar from './Sidebar';
import './Header.css';

function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [opened, { toggle, close }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <Flex className="header-glass header-wrapper">
          <Flex
            className="header-glass-inner header-inner"
            justify="space-between"
            align="center"
          >
            <Group>
              {isMobile && (
                <Burger
                  opened={opened}
                  onClick={toggle}
                  aria-label="Toggle navigation"
                />
              )}
            </Group>

            {!isMobile && (
              <Group>
                <Button
                  variant="subtle"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>

                <Button
                  variant="light"
                  color="pink"
                  onClick={() => navigate('/login')}
                >
                  Get Started
                </Button>
              </Group>
            )}
          </Flex>
        </Flex>

        {isMobile && (
          <Drawer
            opened={opened}
            onClose={close}
            size="75%"
            padding="md"
            title="Menu"
            position="left"
          >
            <Sidebar onLinkClick={close} />
          </Drawer>
        )}
      </>
    );
  }

  return (
    <>
      <Flex
        className="header-auth-wrapper"
        justify="space-between"
        align="center"
      >
        <Group>
          {isMobile && (
            <Burger
              opened={opened}
              onClick={toggle}
              aria-label="Toggle navigation"
            />
          )}

          <Text fw={700}>Dashboard</Text>
        </Group>

        <Group>
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
              <Menu.Item>📸 New photo uploaded</Menu.Item>
              <Menu.Item>💬 Someone commented</Menu.Item>
              <Menu.Item>⭐ Your photo received a like</Menu.Item>
              <Menu.Divider />
              <Menu.Item color="blue">
                View all notifications
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Menu
            shadow="md"
            width={200}
            position="bottom-end"
            withArrow
            opened={userMenuOpened}
            onChange={setUserMenuOpened}
          >
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar
                    src={user?.avatar || undefined}
                    radius="xl"
                  >
                    {!user?.avatar && user?.name?.charAt(0)}
                  </Avatar>

                  <IoChevronDown
                    size={14}
                    className={userMenuOpened ? 'rotate' : ''}
                  />
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
                onClick={() => {
                  dispatch(logout());
                  navigate('/');
                }}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>

      {isMobile && (
        <Drawer
          opened={opened}
          onClose={close}
          size="75%"
          padding="md"
          title="Menu"
          position="left"
        >
          <Sidebar onLinkClick={close} />
        </Drawer>
      )}
    </>
  );
}

export default Header;