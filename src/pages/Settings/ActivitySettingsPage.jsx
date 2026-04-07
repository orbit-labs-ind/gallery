import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Stack, Text, Title } from '@mantine/core'
import { fetchMyActivity } from '../../api/users'

export default function ActivitySettingsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyActivity()
      .then(setData)
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Text c="dimmed" size="sm">
        Loading activity…
      </Text>
    )
  }
  if (error) {
    return (
      <Text c="red.4" size="sm">
        {error}
      </Text>
    )
  }

  return (
    <Stack gap="xl">
      <div>
        <Title order={4} c="#fff" mb="xs">
          Uploads
        </Title>
        <Text c="rgba(255,255,255,0.85)" size="lg" fw={600}>
          {data?.photoUploadCount ?? 0}
        </Text>
        <Text size="xs" c="dimmed">
          Photos and videos you uploaded to albums.
        </Text>
      </div>
      <div>
        <Title order={4} c="#fff" mb="sm">
          Recent comments
        </Title>
        <Stack gap="xs">
          {(data?.recentComments || []).length ? (
            data.recentComments.map((c) => (
              <Text key={c.id} size="sm" c="rgba(255,255,255,0.8)">
                <Text component="span" fw={600}>
                  {c.albumTitle || 'Album'}
                </Text>
                : {c.body.slice(0, 120)}
                {c.body.length > 120 ? '…' : ''}
                {c.organizationId && c.albumId ? (
                  <>
                    {' '}
                    <Text
                      component={Link}
                      to={`/organizations/${c.organizationId}/albums/${c.albumId}`}
                      size="sm"
                      c="teal.4"
                      style={{ textDecoration: 'underline' }}
                    >
                      Open
                    </Text>
                  </>
                ) : null}
              </Text>
            ))
          ) : (
            <Text size="sm" c="dimmed">
              No comments yet.
            </Text>
          )}
        </Stack>
      </div>
      <div>
        <Title order={4} c="#fff" mb="sm">
          Reports you filed
        </Title>
        <Stack gap="xs">
          {(data?.recentReports || []).length ? (
            data.recentReports.map((r) => (
              <Text key={r.id} size="sm" c="rgba(255,255,255,0.8)">
                <Text component="span" size="xs" c="dimmed">
                  [{r.status}]
                </Text>{' '}
                {r.albumTitle}: {r.message.slice(0, 100)}
                {r.message.length > 100 ? '…' : ''}
              </Text>
            ))
          ) : (
            <Text size="sm" c="dimmed">
              No reports filed.
            </Text>
          )}
        </Stack>
      </div>
    </Stack>
  )
}
