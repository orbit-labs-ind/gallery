import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Modal, Stack, Text, Title } from '@mantine/core'
import { useAlbumLibrary } from '../../context/AlbumLibraryContext'
import { removeOrgMember, removeAlbumMember, listMyJoinedAlbums } from '../../api/organizations'
import { softDeleteMyAccount } from '../../api/users'
import { logout } from '../../store/slices/authSlice'
import { setProfile } from '../../store/slices/currentUserSlice'
import { useEffect } from 'react'

export default function DangerSettingsPage() {
  const dispatch = useDispatch()
  const me = useSelector((s) => s.currentUser.profile)
  const { organizations, refreshOrganizations, setCurrentOrgId, currentOrgId } = useAlbumLibrary()
  const [albums, setAlbums] = useState([])
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    listMyJoinedAlbums()
      .then((list) => setAlbums(Array.isArray(list) ? list : []))
      .catch(() => setAlbums([]))
  }, [])

  const leaveOrg = async (org) => {
    if (!me?.id) return
    setError('')
    if (!window.confirm(`Leave “${org.name}”? You will lose access until invited again.`)) return
    setBusy(`org-${org.id}`)
    try {
      await removeOrgMember(org.id, me.id)
      if (String(org.id) === String(currentOrgId)) {
        setCurrentOrgId?.(null)
      }
      await refreshOrganizations?.()
    } catch (e) {
      setError(e.message || 'Could not leave organization')
    } finally {
      setBusy(null)
    }
  }

  const leaveAlbum = async (a) => {
    if (!me?.id) return
    setError('')
    if (!window.confirm(`Leave album “${a.title}”?`)) return
    setBusy(`album-${a.albumId}`)
    try {
      await removeAlbumMember(a.organizationId, a.albumId, me.id)
      setAlbums((prev) =>
        prev.filter((x) => String(x.albumId) !== String(a.albumId))
      )
    } catch (e) {
      setError(e.message || 'Could not leave album')
    } finally {
      setBusy(null)
    }
  }

  const deactivate = async () => {
    setError('')
    setBusy('delete')
    try {
      await softDeleteMyAccount()
      dispatch(setProfile(null))
      dispatch(logout())
      setDeleteOpen(false)
    } catch (e) {
      setError(e.message || 'Could not deactivate account')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Stack gap="xl">
      <Text size="sm" c="red.3">
        Actions here can remove your access. They cannot always be undone without an admin.
      </Text>
      {error ? (
        <Text size="sm" c="red.4">
          {error}
        </Text>
      ) : null}

      <div>
        <Title order={4} c="#fff" mb="sm">
          Leave organization
        </Title>
        <Stack gap="xs">
          {(organizations || []).map((org) => (
            <Button
              key={org.id}
              color="orange"
              variant="light"
              disabled={org.isOwner || busy}
              loading={busy === `org-${org.id}`}
              onClick={() => leaveOrg(org)}
            >
              Leave {org.name}
              {org.isOwner ? ' (owner)' : ''}
            </Button>
          ))}
        </Stack>
        <Text size="xs" c="dimmed" mt="xs">
          Owners must transfer ownership or delete the organization from the organizations page.
        </Text>
      </div>

      <div>
        <Title order={4} c="#fff" mb="sm">
          Leave album
        </Title>
        <Stack gap="xs">
          {albums.map((a) => (
            <Button
              key={`${a.organizationId}-${a.albumId}`}
              color="gray"
              variant="outline"
              disabled={Boolean(busy)}
              loading={busy === `album-${a.albumId}`}
              onClick={() => leaveAlbum(a)}
            >
              Leave “{a.title}”
            </Button>
          ))}
          {!albums.length ? (
            <Text size="sm" c="dimmed">
              No joined albums to leave.
            </Text>
          ) : null}
        </Stack>
      </div>

      <div>
        <Title order={4} c="red.4" mb="sm">
          Deactivate account
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          Soft-deletes your account: you cannot sign in again until support restores it. You must not
          own any organization.
        </Text>
        <Button color="red" variant="filled" onClick={() => setDeleteOpen(true)}>
          Deactivate my account…
        </Button>
      </div>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Deactivate account?"
        centered
      >
        <Text size="sm" mb="md">
          This will sign you out and block API access. If you own an organization, the request will
          fail until you transfer or delete it.
        </Text>
        <Button color="red" fullWidth loading={busy === 'delete'} onClick={deactivate}>
          Yes, deactivate
        </Button>
      </Modal>
    </Stack>
  )
}
