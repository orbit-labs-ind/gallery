import { NavLink } from 'react-router-dom';
import { Stack, Text, Group, ThemeIcon, UnstyledButton, Divider } from '@mantine/core';
import { 
  IoGridOutline, 
  IoImagesOutline, 
  IoAlbumsOutline, 
  IoSettingsOutline, 
  IoHomeOutline,
  IoLogInOutline 
} from "react-icons/io5";
import { useSelector } from 'react-redux';

function Sidebar() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const SidebarLink = ({ to, icon: Icon, label, end = false }) => (
    <NavLink 
      to={to} 
      end={end}
      style={({ isActive }) => ({
        textDecoration: 'none',
        display: 'block',
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        backgroundColor: isActive ? '#e0e7ff' : 'transparent', 
        color: isActive ? '#4338ca' : '#4b5563', 
        fontWeight: isActive ? 600 : 400,
        transition: 'all 0.2s ease'
      })}
    >
      <Group gap="sm">
        <Icon size={20} />
        <Text size="sm">{label}</Text>
      </Group>
    </NavLink>
  );

  return (
    <aside className="layout-sidebar" style={{
      width: '260px',
      height: '100vh',
      backgroundColor: '#f9fafb', 
      borderRight: '1px solid #e0e0e0',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Navigation Links */}
      <nav style={{ flex: 1 }}>
        <Stack gap="xs">
          
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs" pl="sm">
            Menu
          </Text>

          {/* Public Home Link */}
          <SidebarLink to="/" icon={IoHomeOutline} label="Home" end />

          {/* Conditional Links based on Auth */}
          {isAuthenticated ? (
            <>
              <SidebarLink to="/dashboard" icon={IoGridOutline} label="Dashboard" />
              <SidebarLink to="/photos" icon={IoImagesOutline} label="My Photos" />
              <SidebarLink to="/albums" icon={IoAlbumsOutline} label="Albums" />
              
              <Divider my="sm" />
              
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs" pl="sm">
                Preferences
              </Text>
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