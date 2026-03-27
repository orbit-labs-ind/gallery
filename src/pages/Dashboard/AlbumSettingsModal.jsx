import { useEffect, useState } from 'react'
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Switch,
  Button,
  Text,
  Group,
} from '@mantine/core'
import { IoTrashOutline } from 'react-icons/io5'
import { updateAlbum, deleteAlbum } from '../../api/organizations'

export function AlbumSettingsModal({
  orgId,
  album,
  opened,
  onClose,
  onSaved,
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!opened || !album) return
    setTitle(album.title || '')
    setDescription(album.description || '')
    setIsPublic(album.visibility === 'public')
    setError('')
  }, [opened, album])

  const handleSave = async () => {
    if (!orgId || !album?.id) return
    const t = title.trim()
    if (!t) {
      setError('Title is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateAlbum(orgId, album.id, {
        title: t,
        description: description.trim(),
        visibility: isPublic ? 'public' : 'private',
      })
      onSaved?.()
      onClose()
    } catch (e) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!orgId || !album?.id) return
    const ok = window.confirm('Delete this album permanently?')
    if (!ok) return
    setSaving(true)
    setError('')
    try {
      await deleteAlbum(orgId, album.id)
      onSaved?.()
      onClose()
    } catch (e) {
      setError(e.message || 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  if (!album) return null

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Album settings"
      size="sm"
      radius="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
      styles={{
        content: {
          background: 'rgba(18, 18, 28, 0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
        },
        header: { background: 'transparent' },
        title: { color: '#fff', fontWeight: 700 },
      }}
    >
      <Stack gap="md">
        {error ? (
          <Text size="sm" c="red.4">
            {error}
          </Text>
        ) : null}

        <TextInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          styles={{
            input: {
              background: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(255,255,255,0.14)',
              color: '#fff',
            },
            label: { color: 'rgba(255,255,255,0.75)' },
          }}
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
          minRows={2}
          maxLength={2000}
          styles={{
            input: {
              background: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(255,255,255,0.14)',
              color: '#fff',
            },
            label: { color: 'rgba(255,255,255,0.75)' },
          }}
        />

        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" fw={600} c="rgba(255,255,255,0.85)">
            Public in organization
          </Text>
          <Switch
            checked={isPublic}
            onChange={(e) => setIsPublic(e.currentTarget.checked)}
            color="cyan"
          />
        </Group>

        <Text size="xs" c="dimmed">
          Changing to public clears private member list. Changing visibility may affect who sees photos.
        </Text>

        <Group grow>
          <Button variant="default" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button color="teal" onClick={handleSave} loading={saving}>
            Save
          </Button>
        </Group>

        <Button
          color="red"
          variant="light"
          leftSection={<IoTrashOutline size={18} />}
          onClick={handleDelete}
          loading={saving}
        >
          Delete album
        </Button>
      </Stack>
    </Modal>
  )
}
