import { NavLink } from 'react-router-dom';
import { Text, Flex } from '@mantine/core';
import { useSelector } from 'react-redux';
import { useMediaQuery } from '@mantine/hooks';
import {
  IoImagesOutline,
  IoAlbumsOutline,
  IoSettingsOutline,
  IoHomeOutline,
  IoLogInOutline
} from 'react-icons/io5';
import './Sidebar.css';

function SidebarLink({ to, icon: Icon, label, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        isActive
          ? 'sidebar-link sidebar-link-active'
          : 'sidebar-link'
      }
    >
      <Icon size={20} />
      <Text size="sm">{label}</Text>
    </NavLink>
  );
}

function Sidebar({ onLinkClick }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!isAuthenticated) return null;

  return (
    <Flex
      direction="column"
      className={isMobile ? 'sidebar-mobile' : 'sidebar-desktop'}
    >
      <SidebarLink
        to="/"
        icon={IoHomeOutline}
        label="Home"
        end
        onClick={onLinkClick}
      />

      <SidebarLink
        to="/images"
        icon={IoImagesOutline}
        label="Images"
        onClick={onLinkClick}
      />

      <SidebarLink
        to="/albums"
        icon={IoAlbumsOutline}
        label="Albums"
        onClick={onLinkClick}
      />

      <SidebarLink
        to="/settings"
        icon={IoSettingsOutline}
        label="Settings"
        onClick={onLinkClick}
      />

      <SidebarLink
        to="/login"
        icon={IoLogInOutline}
        label="Login"
        onClick={onLinkClick}
      />
    </Flex>
  );
}

export default Sidebar;