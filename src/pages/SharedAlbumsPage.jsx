import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Stack,
  Text,
  Title,
  Group,
} from '@mantine/core'
import { IoArrowForward, IoImagesOutline } from 'react-icons/io5'
import { listMyJoinedAlbums } from '../api/organizations'
import './SharedAlbumsPage.css'

export default function SharedAlbumsPage() {
  const navigate = useNavigate()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    listMyJoinedAlbums()
      .then((list) => {
        if (!cancelled) setAlbums(Array.isArray(list) ? list : [])
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Could not load albums')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="shared-albums-page">
      <div className="shared-albums-page__blob shared-albums-page__blob--1" aria-hidden />
      <Stack className="shared-albums-page__inner" gap="lg" py={40} px="md" maw={560} mx="auto">
        <div>
          <Title order={2} className="shared-albums-page__title">
            Albums shared with you
          </Title>
          <Text size="sm" className="shared-albums-page__subtitle" mt={8}>
            Albums you joined via invite link (without being in the organization).
          </Text>
        </div>

        {loading ? (
          <Text size="sm" c="dimmed">
            Loading…
          </Text>
        ) : null}
        {error ? (
          <Text size="sm" c="red.4">
            {error}
          </Text>
        ) : null}

        {!loading && !error && albums.length === 0 ? (
          <Paper className="shared-albums-page__glass" p="xl" radius="lg">
            <Text size="sm" ta="center" c="dimmed">
              No shared albums yet. When someone sends you an invite link and your request
              is approved, albums appear here.
            </Text>
            <Box ta="center" mt="md">
              <Button variant="light" onClick={() => navigate('/organizations')}>
                Organizations
              </Button>
            </Box>
          </Paper>
        ) : null}

        <Stack gap="sm">
          {albums.map((a) => (
            <Paper
              key={`${a.organizationId}-${a.albumId}`}
              className="shared-albums-page__glass"
              p="md"
              radius="lg"
            >
              <Group justify="space-between" wrap="nowrap" gap="md">
                <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Box className="shared-albums-page__icon" aria-hidden>
                    <IoImagesOutline size={22} />
                  </Box>
                  <div style={{ minWidth: 0 }}>
                    <Text fw={700} size="md" lineClamp={2} style={{ color: 'var(--text)' }}>
                      {a.title}
                    </Text>
                    <Text size="xs" mt={4} style={{ color: 'var(--muted)' }}>
                      {a.organizationName} · {a.visibility}
                    </Text>
                  </div>
                </Group>
                <Button
                  size="sm"
                  radius="xl"
                  variant="default"
                  className="gallery-theme-btn--albums"
                  rightSection={<IoArrowForward size={16} />}
                  onClick={() =>
                    navigate(`/organizations/${a.organizationId}/albums/${a.albumId}`)
                  }
                >
                  Open
                </Button>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </section>
  )
}
