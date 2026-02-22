import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Title, Text, Button, Group, Box, Badge } from '@mantine/core'
import PhotoReel from './PhotoReel'
import './LandingHero.css'
import { useMediaQuery } from '@mantine/hooks'

export default function LandingHero() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const heroRef = useRef(null)
  const isMobile = useMediaQuery('(max-width: 900px)')

  return (
    <section className="lp-hero" ref={heroRef}>
      <div className="lp-blob lp-blob-1" aria-hidden />
      <div className="lp-blob lp-blob-2" aria-hidden />
      <div className="lp-blob lp-blob-3" aria-hidden />
      <div className="lp-grid-overlay" aria-hidden />

      <div className="lp-hero-inner">
        <Box className="lp-hero-left">
          <Badge variant="light" color="yellow" size="lg" className="lp-pill">
            ✨ Free photo sharing for everyone
          </Badge>
          <Title order={1} className="lp-hero-h1">
            Share moments,
            <br />
            <span className="lp-gradient-text">not screenshots.</span>
          </Title>
          <Text className="lp-hero-p" size="lg" c="dimmed">
            Create shared albums, invite friends instantly, and relive your best
            memories together — no storage limits, no complexity.
          </Text>
          <Group className="lp-hero-cta" gap="md">
            {isAuthenticated ? (
              <Button
                component={Link}
                to="/dashboard"
                size="md"
                radius="xl"
                className="lp-btn-primary"
              >
                Open Dashboard →
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  size="md"
                  radius="xl"
                  className="lp-btn-primary"
                >
                  Start sharing free →
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  variant="subtle"
                  color="gray"
                  size="md"
                  className="lp-btn-ghost"
                >
                  Sign in
                </Button>
              </>
            )}
          </Group>
          <Group className="lp-hero-social-proof" gap="sm">
            <Group gap={0} className="lp-avatars">
              {['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff'].map((c, i) => (
                <Box
                  key={i}
                  className="lp-avatar"
                  style={{ background: c, zIndex: 4 - i }}
                />
              ))}
            </Group>
            <Text size="sm" c="dimmed" className="lp-proof-text">
              Join <Text span fw={700} inherit>50,000+</Text> people sharing moments
            </Text>
          </Group>
        </Box>

        {!isMobile ? (
          <Box className="lp-hero-right">
            <PhotoReel />
          </Box>
        ) : (
          <></>
        )}
      </div>

      <div className="lp-scroll-hint">
        <div className="lp-scroll-dot" />
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          Scroll to explore
        </Text>
      </div>
    </section>
  )
}
