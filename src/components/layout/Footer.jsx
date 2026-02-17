import { Container, Group, ActionIcon, Text, Anchor } from '@mantine/core';
import { IoLogoTwitter, IoLogoYoutube, IoLogoInstagram, IoImage } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Footer() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const themeStyles = {
    bg: '#1c244d', 
    border: '1px solid rgba(255,255,255,0.1)',
    text: 'white',
    dimmed: 'gray.5',
    iconColor: 'gray',
    logoColor: '#646cff'
  };

  return (
    <footer style={{
      borderTop: themeStyles.border,
      backgroundColor: themeStyles.bg,
      paddingTop: '2rem',
      paddingBottom: '2rem',
      marginTop: 'auto',
      transition: 'background-color 0.3s ease'
    }}>
      <Container size="lg">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          
          {/* Left Side: Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IoImage size={24} color={themeStyles.logoColor} />
            <Text fw={700} size="lg" style={{ color: themeStyles.text }}>
              Gallery 
            </Text>
          </div>

          {/* Center: Navigation Links */}
          <Group gap="lg">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Text c={themeStyles.dimmed} size="sm" style={{ cursor: 'pointer' }}>Home</Text>
            </Link>
            
            {/* Login link only shows if NOT authenticated */}
            {!isAuthenticated && (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Text c={themeStyles.dimmed} size="sm" style={{ cursor: 'pointer' }}>Login</Text>
              </Link>
            )}
            
            <Anchor href="#" c={themeStyles.dimmed} size="sm" underline="never">
              Privacy
            </Anchor>
            <Anchor href="#" c={themeStyles.dimmed} size="sm" underline="never">
              Terms
            </Anchor>
          </Group>

          {/* Right Side: Social Icons */}
          <Group gap="xs" justify="flex-end" wrap="nowrap">
            <ActionIcon 
              size="lg" 
              color={themeStyles.iconColor} 
              variant="subtle" 
              component="a" 
              href="https://twitter.com" 
              target="_blank"
            >
              <IoLogoTwitter size={18} />
            </ActionIcon>
            <ActionIcon 
              size="lg" 
              color={themeStyles.iconColor} 
              variant="subtle" 
              component="a" 
              href="https://youtube.com" 
              target="_blank"
            >
              <IoLogoYoutube size={18} />
            </ActionIcon>
            <ActionIcon 
              size="lg" 
              color={themeStyles.iconColor} 
              variant="subtle" 
              component="a" 
              href="https://instagram.com" 
              target="_blank"
            >
              <IoLogoInstagram size={18} />
            </ActionIcon>
          </Group>
        </div>

        {/* Bottom Copyright */}
        <Text c={themeStyles.dimmed} size="xs" ta="center" mt="xl">
          © {new Date().getFullYear()} Orbit Gallery. All rights reserved.
        </Text>
      </Container>
    </footer>
  );
}

export default Footer;
