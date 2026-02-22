import { Container, Group, ActionIcon, Text, Anchor } from '@mantine/core';
import { IoLogoTwitter, IoLogoYoutube, IoLogoInstagram, IoImage } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMediaQuery } from '@mantine/hooks';

function Footer() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const themeStyles = {
    bg: '#1c244d',
    border: '1px solid rgba(255,255,255,0.1)',
    text: 'white',
    dimmed: '#cbd5e1',
    iconColor: 'gray',
    logoColor: '#646cff'
  };

  const footerClassName = !isAuthenticated ? 'footer-glass' : ''
  return (
    <footer
      className={footerClassName}
      style={{
        borderTop: themeStyles.border,
        backgroundColor: isAuthenticated ? themeStyles.bg : 'transparent',
        paddingTop: '2rem',
        paddingBottom: isMobile ? '6rem' : '2rem',
        marginTop: 'auto'
      }}
    >
      <Container size="lg">
        <div style={{
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          gap: '1.5rem'
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IoImage size={24} color={themeStyles.logoColor} />
            <Text fw={700} size="lg" c={themeStyles.text}>
              Gallery
            </Text>
          </div>

          {/* Navigation */}
          <Group gap="lg">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Text c={themeStyles.dimmed} size="sm">Home</Text>
            </Link>

            {!isAuthenticated && (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Text c={themeStyles.dimmed} size="sm">Login</Text>
              </Link>
            )}

            <Anchor href="#" c={themeStyles.dimmed} size="sm" underline="never">
              Privacy
            </Anchor>

            <Anchor href="#" c={themeStyles.dimmed} size="sm" underline="never">
              Terms
            </Anchor>
          </Group>

          {/* Social Icons */}
          <Group gap="xs">

            {/* Twitter */}
            <ActionIcon
              size="lg"
              variant="subtle"
              component="a"
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoTwitter size={18} />
            </ActionIcon>

            {/* YouTube */}
            <ActionIcon
              size="lg"
              variant="subtle"
              component="a"
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoYoutube size={18} />
            </ActionIcon>

            {/* Instagram */}
            <ActionIcon
              size="lg"
              variant="subtle"
              component="a"
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoInstagram size={18} />
            </ActionIcon>

          </Group>
        </div>

        <Text c={themeStyles.dimmed} size="xs" ta="center" mt="xl">
          © {new Date().getFullYear()} Orbit Gallery. All rights reserved.
        </Text>
      </Container>
    </footer>
  );
}

export default Footer;
