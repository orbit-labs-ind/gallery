import { useEffect, useState } from 'react'
import {
  Modal,
  Stack,
  TextInput,
  Button,
  Text,
  Group,
  ScrollArea,
  ActionIcon,
} from '@mantine/core'
import { IoTrashOutline, IoCloseOutline } from 'react-icons/io5'
import {
  updateOrganization,
  deleteOrganization,
  getOrgMembers,
  removeOrgMember,
  getOrgAlbumsSummary,
} from '../../api/organizations'
import './OrganizationsPage.css'

const inputClassNames = { input: 'orgs-page__glass-input' }

export function EditOrganizationModal({ org, opened, onClose, onUpdated, onDeleted }) {
  const [name, setName] = useState('')
  const [members, setMembers] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    if (!opened || !org?.id) return
    setName(org.name || '')
    setError('')
    setLoading(true)
    Promise.all([getOrgMembers(org.id), getOrgAlbumsSummary(org.id)])
      .then(([m, a]) => {
        setMembers(m.members || [])
        setAlbums(a.albums || [])
      })
      .catch(() => {
        setMembers([])
        setAlbums([])
        setError('Could not load organization details')
      })
      .finally(() => setLoading(false))
  }, [opened, org?.id, org?.name])

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed || !org?.id) return
    setSaving(true)
    setError('')
    try {
      await updateOrganization(org.id, { name: trimmed })
      onUpdated?.()
      onClose()
    } catch (e) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!org?.id) return
    setRemovingId(userId)
    try {
      await removeOrgMember(org.id, userId)
      setMembers((prev) => prev.filter((m) => String(m.id) !== String(userId)))
    } catch {
      /* ignore */
    } finally {
      setRemovingId(null)
    }
  }

  const handleDeleteOrg = async () => {
    if (!org?.id) return
    const ok = window.confirm(
      'Delete this organization and all of its albums? This cannot be undone.'
    )
    if (!ok) return
    setSaving(true)
    setError('')
    try {
      await deleteOrganization(org.id)
      onDeleted?.(org.id)
      onClose()
    } catch (e) {
      setError(e.message || 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  if (!org) return null

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Organization settings"
      size="md"
      radius="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
      classNames={{
        content: 'edit-org-modal__content',
        header: 'edit-org-modal__header',
        title: 'edit-org-modal__title',
        body: 'edit-org-modal__body',
      }}
    >
      <Stack gap="md">
        {error ? (
          <Text size="sm" className="gallery-theme-text--warn">
            {error}
          </Text>
        ) : null}

        <div>
          <Text size="xs" fw={600} mb={6} style={{ color: 'var(--muted)' }}>
            Name
          </Text>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            disabled={!org.isOwner}
            classNames={inputClassNames}
          />
        </div>

        {org.isOwner ? (
          <Group justify="flex-end">
            <Button
              variant="default"
              className="gallery-theme-btn--accent3"
              onClick={handleSave}
              loading={saving}
            >
              Save name
            </Button>
          </Group>
        ) : (
          <Text size="xs" style={{ color: 'var(--muted)' }}>
            Only the owner can rename this organization.
          </Text>
        )}

        <div>
          <Text size="xs" fw={600} mb={6} style={{ color: 'var(--muted)' }}>
            Members ({loading ? '…' : members.length})
          </Text>
          <ScrollArea.Autosize mah={160} type="auto">
            <Stack gap={6}>
              {members.map((m) => (
                <Group key={m.id} justify="space-between" wrap="nowrap" gap="xs">
                  <Text size="sm" lineClamp={1} style={{ flex: 1, color: 'var(--text)' }}>
                    {m.email}{' '}
                    <Text span size="xs" style={{ color: 'var(--muted)' }}>
                      ({m.role})
                    </Text>
                  </Text>
                  {org.isOwner && m.role !== 'owner' ? (
                    <ActionIcon
                      variant="transparent"
                      size="sm"
                      className="gallery-theme-btn--ghost"
                      loading={removingId === m.id}
                      onClick={() => handleRemoveMember(m.id)}
                      aria-label="Remove member"
                    >
                      <IoCloseOutline size={18} />
                    </ActionIcon>
                  ) : null}
                </Group>
              ))}
              {!loading && members.length === 0 ? (
                <Text size="sm" style={{ color: 'var(--muted)' }}>
                  No members loaded.
                </Text>
              ) : null}
            </Stack>
          </ScrollArea.Autosize>
        </div>

        <div>
          <Text size="xs" fw={600} mb={6} style={{ color: 'var(--muted)' }}>
            Albums in this org ({loading ? '…' : albums.length})
          </Text>
          <ScrollArea.Autosize mah={140} type="auto">
            <Stack gap={4}>
              {albums.map((a) => (
                <Text key={a.id} size="sm" lineClamp={1} style={{ color: 'var(--text)' }}>
                  {a.title}{' '}
                  <Text span size="xs" style={{ color: 'var(--muted)' }}>
                    · {a.visibility}
                    {a.ownerEmail ? ` · ${a.ownerEmail}` : ''}
                  </Text>
                </Text>
              ))}
              {!loading && albums.length === 0 ? (
                <Text size="sm" style={{ color: 'var(--muted)' }}>
                  No albums yet.
                </Text>
              ) : null}
            </Stack>
          </ScrollArea.Autosize>
        </div>

        {org.isOwner ? (
          <Button
            variant="default"
            className="gallery-theme-btn--delete"
            leftSection={<IoTrashOutline size={18} />}
            onClick={handleDeleteOrg}
            loading={saving}
          >
            Delete organization
          </Button>
        ) : null}
      </Stack>
    </Modal>
  )
}
