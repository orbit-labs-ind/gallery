import { NavLink } from 'react-router-dom';
import { Stack, Text, Group, Divider } from '@mantine/core';
import {
  IoGridOutline,
  IoImagesOutline,
  IoAlbumsOutline,
  IoSettingsOutline,
  IoHomeOutline,
  IoLogInOutline
} from "react-icons/io5";
import { useSelector } from 'react-redux';
import { useMediaQuery } from '@mantine/hooks';

function Sidebar() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const SidebarLink = ({ to, icon: Icon, label, end = false }) => (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        borderRadius: '8px',
        backgroundColor: isActive ? '#e0e7ff' : 'transparent',
        color: isActive ? '#4338ca' : '#4b5563',
        fontWeight: isActive ? 600 : 400,
        transition: 'all 0.2s ease'
      })}
    >
      <Icon size={20} />
      <Text size="sm">{label}</Text>
    </NavLink>
  );

  const containerStyle = isMobile
    ? {
        width: '100%',
        padding: '0.5rem 0'
      }
    : {
        width: '260px',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        borderRight: '1px solid #e0e0e0',
        padding: '1.5rem 1rem'
      };

  return (
    <aside style={containerStyle}>
      <nav>
        <Stack gap="xs">

          {/* Desktop Section Title */}
          {!isMobile && (
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs" pl="sm">
              Menu
            </Text>
          )}

          {/* Public Home */}
          <SidebarLink to="/" icon={IoHomeOutline} label="Home" end />

          {isAuthenticated ? (
            <>
              <SidebarLink to="/dashboard" icon={IoGridOutline} label="Dashboard" />
              <SidebarLink to="/photos" icon={IoImagesOutline} label="My Photos" />
              <SidebarLink to="/albums" icon={IoAlbumsOutline} label="Albums" />

              {!isMobile && <Divider my="sm" />}

              {!isMobile && (
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs" pl="sm">
                  Preferences
                </Text>
              )}

              <SidebarLink to="/settings" icon={IoSettingsOutline} label="Settings" />
            </>
          ) : (
            <>
              <Divider my="sm" />
              <SidebarLink to="/login" icon={IoLogInOutline} label="Sign In" />
            </>
          )}

        </Stack>
      </nav>
    </aside>
  );
}

export default Sidebar;
