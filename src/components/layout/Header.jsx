import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Group, Text, Button, Avatar, Menu, ActionIcon, UnstyledButton } from '@mantine/core';
import { IoImage, IoNotificationsOutline, IoLogOutOutline, IoChevronDown, IoPersonOutline, IoSettingsOutline } from "react-icons/io5";
import { logout } from '../../store/slices/authSlice';

function Header() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        backgroundColor: '#42a5d3', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        height: '72px'
      }}>
        {/* Left: Logo */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Group gap="xs">
            <IoImage size={28} color="#4046bd" />
            <Text size="xl" fw={700} style={{ color: 'white' }}>Gallery</Text>
          </Group>
        </Link>

        {/* Right: Login/Signup Buttons */}
        <Group>
          <Button
            variant="subtle"
            color="gray"
            radius="md"
            style={{ color: 'white' }}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="filled"
            color="indigo"
            radius="md"
            onClick={() => navigate('/login')}
          >
            Sign Up
          </Button>
        </Group>
      </header>
    );
  }

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'flex-end', 
      alignItems: 'center',
      padding: '0 2rem',
      backgroundColor: 'white', 
      borderBottom: '1px solid #e0e0e0',
      color: '#333',
      height: '64px'
    }}>
      <Group gap="lg">
        {/* Notification Icon */}
        <ActionIcon variant="subtle" color="gray" size="lg" radius="xl" aria-label="Notifications">
          <IoNotificationsOutline size={22} />
        </ActionIcon>

        {/* User Avatar & Dropdown */}
        <Menu shadow="md" width={200} position="bottom-end" withArrow arrowPosition="center">
          <Menu.Target>
            <UnstyledButton style={{ display: 'flex', alignItems: 'center' }}>
              <Group gap="xs">
                <Avatar
                  src="https://robohash.org/83f3a28043cd58427867bf7ac4bfe034?set=set4&bgset=&size=400x400"
                  alt="User Avatar"
                  radius="xl"
                  size="md"
                  color="indigo"
                >
                </Avatar>
                <IoChevronDown size={14} color="#888" />
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
  );
}

export default Header;
