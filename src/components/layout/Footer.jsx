import { Container, Group, ActionIcon, Text, Anchor, Flex } from '@mantine/core';
import { IoLogoTwitter, IoLogoYoutube, IoLogoInstagram, IoImage } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMediaQuery } from '@mantine/hooks';
import './Footer.css';

function Footer() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const footerClassName = `
    footer-root
    ${isAuthenticated ? 'footer-auth' : 'footer-glass'}
    ${isMobile ? 'footer-mobile' : ''}
  `;

  return (
    <Flex
      className={footerClassName}
      direction="column"
    >
      <Container size="lg">
        <Flex
          justify={isMobile ? 'center' : 'space-between'}
          direction={isMobile ? 'column' : 'row'}
          align="center"
          gap="1.5rem"
        >
          <Flex align="center" gap="8px">
            <IoImage size={24} className="footer-logo-icon" />
            <Text fw={700} size="lg" className="footer-text-main">
              Gallery
            </Text>
          </Flex>
          <Group gap="lg">
            <Link to="/" className="footer-link">
              <Text size="sm" className="footer-text-dim">Home</Text>
            </Link>

            {!isAuthenticated && (
              <Link to="/login" className="footer-link">
                <Text size="sm" className="footer-text-dim">Login</Text>
              </Link>
            )}

            <Anchor href="#" size="sm" underline="never" className="footer-text-dim">
              Privacy
            </Anchor>

            <Anchor href="#" size="sm" underline="never" className="footer-text-dim">
              Terms
            </Anchor>
          </Group>
          <Group gap="xs">
            <ActionIcon
              size="lg"
              variant="subtle"
              component="a"
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon"
            >
              <IoLogoTwitter size={18} />
            </ActionIcon>

            <ActionIcon
              size="lg"
              variant="subtle"
              component="a"
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon"
            >
              <IoLogoYoutube size={18} />
            </ActionIcon>

            <ActionIcon
              size="lg"
              variant="subtle"
              component="a"
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon"
            >
              <IoLogoInstagram size={18} />
            </ActionIcon>
          </Group>
        </Flex>

        <Text size="xs" ta="center" mt="xl" className="footer-text-dim">
          © {new Date().getFullYear()} Orbit Gallery. All rights reserved.
        </Text>
      </Container>
    </Flex>
  );
}

export default Footer;