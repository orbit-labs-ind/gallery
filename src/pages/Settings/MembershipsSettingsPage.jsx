import { Link } from 'react-router-dom'
import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { useAlbumLibrary } from '../../context/AlbumLibraryContext'
import { useEffect, useState } from 'react'
import { listMyJoinedAlbums } from '../../api/organizations'

export default function MembershipsSettingsPage() {
  const { organizations, setCurrentOrgId } = useAlbumLibrary()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listMyJoinedAlbums()
      .then((list) => setAlbums(Array.isArray(list) ? list : []))
      .catch(() => setAlbums([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Stack gap="xl">
      <div>
        <Title order={4} c="#fff" mb="xs">
          Organizations
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          Open an organization to switch context or manage it from the organizations page.
        </Text>
        <Stack gap="sm">
          {(organizations || []).map((org) => (
            <Button
              key={org.id}
              component={Link}
              to="/organizations"
              variant="light"
              color="gray"
              justify="flex-start"
              onClick={() => setCurrentOrgId?.(org.id)}
            >
              {org.name}
            </Button>
          ))}
          {!organizations?.length ? (
            <Text size="sm" c="dimmed">
              You are not in any organization yet.
            </Text>
          ) : null}
        </Stack>
      </div>
      <div>
        <Title order={4} c="#fff" mb="xs">
          Albums you joined
        </Title>
        {loading ? (
          <Text size="sm" c="dimmed">
            Loading…
          </Text>
        ) : (
          <Stack gap="sm">
            {albums.map((a) => (
              <Button
                key={`${a.organizationId}-${a.albumId}`}
                component={Link}
                to={`/organizations/${a.organizationId}/albums/${a.albumId}`}
                variant="light"
                color="teal"
                fullWidth
                justify="flex-start"
              >
                <Group justify="space-between" wrap="nowrap" w="100%" gap="xs">
                  <Text size="sm" truncate>
                    {a.title}
                  </Text>
                  <Text size="xs" c="dimmed" truncate maw="40%">
                    {a.organizationName}
                  </Text>
                </Group>
              </Button>
            ))}
            {albums.length === 0 ? (
              <Text size="sm" c="dimmed">
                No shared albums yet.
              </Text>
            ) : null}
          </Stack>
        )}
      </div>
    </Stack>
  )
}
