import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Stack, Text, Title } from '@mantine/core'
import { previewAlbumShare, requestAlbumJoin } from '../api/organizations'
import './JoinAlbumPage.css'

export default function JoinAlbumPage() {
  const { shareToken } = useParams()
  const navigate = useNavigate()
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [doneMessage, setDoneMessage] = useState('')

  useEffect(() => {
    const token = String(shareToken || '').trim()
    if (!token) {
      setError('Invalid invite link.')
      setLoading(false)
      return undefined
    }
    let cancelled = false
    previewAlbumShare(token)
      .then((data) => {
        if (cancelled) return
        setPreview(data)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.message || 'Album not found.')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [shareToken])

  const goAlbum = (orgId, albumId) => {
    navigate(`/organizations/${orgId}/albums/${albumId}`, { replace: true })
  }

  const handleRequest = async () => {
    const token = String(shareToken || '').trim()
    if (!token) return
    setSubmitting(true)
    setError('')
    try {
      const data = await requestAlbumJoin(token)
      if (data.alreadyHasAccess && data.organizationId && data.albumId) {
        goAlbum(data.organizationId, data.albumId)
        return
      }
      setDoneMessage(data.message || 'Request sent.')
    } catch (e) {
      setError(e.message || 'Request failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="join-album-page">
      <Box className="join-album-card" p="xl">
        <Stack gap="md">
          <Title order={3} c="#fff" ta="center">
            Join album
          </Title>
          {loading ? (
            <Text size="sm" c="dimmed" ta="center">
              Loading…
            </Text>
          ) : null}
          {preview && !doneMessage ? (
            <>
              <Text size="sm" c="rgba(255,255,255,0.85)" ta="center">
                <strong>{preview.title}</strong>
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                {preview.organizationName} · {preview.visibility} album
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                You need approval from an organizer before you can open this album
                (even if it is public).
              </Text>
              <Button
                fullWidth
                color="teal"
                onClick={handleRequest}
                loading={submitting}
              >
                Request to join
              </Button>
            </>
          ) : null}
          {doneMessage ? (
            <>
              <Text size="sm" c="teal.3" ta="center">
                {doneMessage}
              </Text>
              <Button variant="default" onClick={() => navigate('/organizations')}>
                Back to organizations
              </Button>
            </>
          ) : null}
          {error ? (
            <>
              <Text size="sm" c="red.4" ta="center">
                {error}
              </Text>
              <Button variant="light" onClick={() => navigate('/organizations')}>
                Back to organizations
              </Button>
            </>
          ) : null}
        </Stack>
      </Box>
    </div>
  )
}
