import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Switch,
  Button,
  Text,
  Group,
  Divider,
  MultiSelect,
  ScrollArea,
  Paper,
  ActionIcon,
  Collapse,
  Box,
} from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import {
  IoTrashOutline,
  IoCopyOutline,
  IoShieldCheckmarkOutline,
  IoChevronDown,
  IoImageOutline,
} from 'react-icons/io5'
import {
  updateAlbum,
  deleteAlbum,
  getAlbumInviteCandidates,
  addAlbumMembers,
  getAlbumMembers,
  getAlbumJoinRequests,
  approveAlbumJoinRequest,
  rejectAlbumJoinRequest,
  patchAlbumMember,
  removeAlbumMember,
  uploadAlbumCover,
} from '../../api/organizations'
import { AuthedAlbumImage } from '../AlbumPhotos/AuthedAlbumImage'

const ALBUM_CAP_DEFS = [
  { key: 'canLike', label: 'Like' },
  { key: 'canComment', label: 'Comment' },
  { key: 'canUpload', label: 'Upload' },
  { key: 'canDownload', label: 'Download' },
]

export function AlbumSettingsModal({
  orgId,
  album,
  opened,
  onClose,
  onSaved,
  canManageAlbumMembers = false,
  canApproveJoinRequests = false,
  canEditAlbum = false,
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [inviteCandidates, setInviteCandidates] = useState([])
  const [albumMembers, setAlbumMembers] = useState([])
  const [joinRequests, setJoinRequests] = useState([])
  const [selectedToAdd, setSelectedToAdd] = useState([])
  const [inviteLoading, setInviteLoading] = useState(false)
  const [busyMemberId, setBusyMemberId] = useState(null)
  const [permMember, setPermMember] = useState(null)
  const [expandedMemberRows, setExpandedMemberRows] = useState({})
  const [pendingCoverFile, setPendingCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const clipboard = useClipboard({ timeout: 2000 })

  const shareUrl = useMemo(() => {
    if (!album?.shareToken || typeof window === 'undefined') return ''
    return `${window.location.origin}/join/album/${album.shareToken}`
  }, [album?.shareToken])

  useEffect(() => {
    if (!opened || !album) return
    setTitle(album.title || '')
    setDescription(album.description || '')
    setIsPublic(album.visibility === 'public')
    setError('')
    setSelectedToAdd([])
    setPermMember(null)
    setExpandedMemberRows({})
    setPendingCoverFile(null)
    setCoverPreview(null)
  }, [opened, album])

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  const reloadManagement = useCallback(async () => {
    if (!orgId || !album?.id) return
    setInviteLoading(true)
    try {
      if (canManageAlbumMembers) {
        const [candidates, members] = await Promise.all([
          getAlbumInviteCandidates(orgId, album.id),
          getAlbumMembers(orgId, album.id),
        ])
        setInviteCandidates(Array.isArray(candidates) ? candidates : [])
        setAlbumMembers(Array.isArray(members) ? members : [])
      } else {
        setInviteCandidates([])
        setAlbumMembers([])
      }
      if (canApproveJoinRequests) {
        const requests = await getAlbumJoinRequests(orgId, album.id)
        setJoinRequests(Array.isArray(requests) ? requests : [])
      } else {
        setJoinRequests([])
      }
    } catch {
      setInviteCandidates([])
      setAlbumMembers([])
      setJoinRequests([])
    } finally {
      setInviteLoading(false)
    }
  }, [
    orgId,
    album?.id,
    canManageAlbumMembers,
    canApproveJoinRequests,
  ])

  useEffect(() => {
    if (!opened || !album?.id || !orgId) {
      setInviteCandidates([])
      setAlbumMembers([])
      setJoinRequests([])
      return undefined
    }
    if (!canManageAlbumMembers && !canApproveJoinRequests) {
      setInviteCandidates([])
      setAlbumMembers([])
      setJoinRequests([])
      return undefined
    }
    reloadManagement()
    return undefined
  }, [
    opened,
    album?.id,
    orgId,
    canManageAlbumMembers,
    canApproveJoinRequests,
    reloadManagement,
  ])

  const multiSelectData = useMemo(
    () =>
      inviteCandidates.map((m) => ({
        value: String(m.id),
        label: m.displayName || m.username || m.email || String(m.id),
      })),
    [inviteCandidates]
  )

  const handleCoverFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setPendingCoverFile(file)
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const clearPendingCover = () => {
    setPendingCoverFile(null)
    setCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

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
      if (pendingCoverFile && canEditAlbum) {
        await uploadAlbumCover(orgId, album.id, pendingCoverFile)
        clearPendingCover()
      }
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

  const handleClearCoverOnly = async () => {
    if (!orgId || !album?.id || !canEditAlbum) return
    setSaving(true)
    setError('')
    try {
      await updateAlbum(orgId, album.id, { coverImageUrl: '' })
      clearPendingCover()
      onSaved?.()
    } catch (e) {
      setError(e.message || 'Could not clear cover')
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

  const handleAddMembers = async () => {
    if (!orgId || !album?.id || selectedToAdd.length === 0) return
    setInviteLoading(true)
    setError('')
    try {
      await addAlbumMembers(orgId, album.id, selectedToAdd)
      setSelectedToAdd([])
      await reloadManagement()
      onSaved?.()
    } catch (e) {
      setError(e.message || 'Could not add members')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    if (!orgId || !album?.id) return
    setInviteLoading(true)
    setError('')
    try {
      await approveAlbumJoinRequest(orgId, album.id, requestId)
      await reloadManagement()
      onSaved?.()
    } catch (e) {
      setError(e.message || 'Approve failed')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleReject = async (requestId) => {
    if (!orgId || !album?.id) return
    setInviteLoading(true)
    setError('')
    try {
      await rejectAlbumJoinRequest(orgId, album.id, requestId)
      await reloadManagement()
    } catch (e) {
      setError(e.message || 'Reject failed')
    } finally {
      setInviteLoading(false)
    }
  }

  const patchMember = async (userId, payload) => {
    if (!orgId || !album?.id) return
    setBusyMemberId(userId)
    setError('')
    try {
      const updated = await patchAlbumMember(orgId, album.id, userId, payload)
      await reloadManagement()
      onSaved?.()
      if (updated) {
        setPermMember((cur) =>
          cur && String(cur.id) === String(userId)
            ? {
                ...cur,
                ...updated,
                isAlbumOwner: cur.isAlbumOwner,
              }
            : cur
        )
      }
    } catch (e) {
      setError(e.message || 'Update failed')
    } finally {
      setBusyMemberId(null)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!orgId || !album?.id) return
    setBusyMemberId(userId)
    setError('')
    try {
      await removeAlbumMember(orgId, album.id, userId)
      await reloadManagement()
      onSaved?.()
    } catch (e) {
      setError(e.message || 'Remove failed')
    } finally {
      setBusyMemberId(null)
    }
  }

  if (!album) return null

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Album settings"
        size="lg"
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

          {canApproveJoinRequests && album.shareToken ? (
            <>
              <Divider
                label="Invite & join requests"
                labelProps={{ style: { color: 'rgba(255,255,255,0.65)' } }}
              />
              <Text size="xs" c="dimmed">
                Share the link — they sign in, then <strong>request to join</strong>.
                You (or another approver) must approve before they can see the
                album, even if it is public.
              </Text>
              <TextInput
                label="Invite link"
                readOnly
                value={shareUrl}
                rightSection={
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    px={8}
                    onClick={() => shareUrl && clipboard.copy(shareUrl)}
                  >
                    {clipboard.copied ? 'Copied' : <IoCopyOutline size={16} />}
                  </Button>
                }
                styles={{
                  input: {
                    background: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(255,255,255,0.14)',
                    color: '#fff',
                  },
                  label: { color: 'rgba(255,255,255,0.75)' },
                }}
              />

              {joinRequests.length > 0 ? (
                <>
                  <Text size="sm" fw={600} c="rgba(255,255,255,0.9)">
                    Pending requests ({joinRequests.length})
                  </Text>
                  <Stack gap="xs">
                    {joinRequests.map((r) => (
                      <Group key={r.id} justify="space-between" wrap="nowrap" gap="xs">
                        <Text size="sm" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
                          {r.email}
                        </Text>
                        <Group gap={6} wrap="nowrap">
                          <Button
                            size="xs"
                            color="teal"
                            variant="light"
                            loading={inviteLoading}
                            onClick={() => handleApprove(r.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            color="gray"
                            variant="subtle"
                            loading={inviteLoading}
                            onClick={() => handleReject(r.id)}
                          >
                            Decline
                          </Button>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                </>
              ) : (
                <Text size="xs" c="dimmed">
                  No pending join requests.
                </Text>
              )}
            </>
          ) : null}

          {canManageAlbumMembers ? (
            <>
              <Divider
                label="Album members"
                labelProps={{ style: { color: 'rgba(255,255,255,0.65)' } }}
              />
              <ScrollArea.Autosize mah={280} type="auto">
                <Stack gap="sm">
                  {albumMembers.map((m) => {
                    const rowKey = String(m.id)
                    const rowOpen = Boolean(expandedMemberRows[rowKey])
                    const isOwner = Boolean(m.isAlbumOwner)
                    return (
                      <Paper
                        key={rowKey}
                        p="sm"
                        radius="md"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <Group justify="flex-start" wrap="nowrap" gap="sm" align="center">
                          <ActionIcon
                            type="button"
                            variant="subtle"
                            size="sm"
                            color="gray"
                            aria-expanded={rowOpen}
                            aria-label={
                              rowOpen ? 'Hide member actions' : 'Show member actions'
                            }
                            onClick={() =>
                              setExpandedMemberRows((prev) => ({
                                ...prev,
                                [rowKey]: !prev[rowKey],
                              }))
                            }
                            style={{ flexShrink: 0 }}
                          >
                            <IoChevronDown
                              size={18}
                              style={{
                                display: 'block',
                                transform: rowOpen
                                  ? 'rotate(180deg)'
                                  : 'rotate(0deg)',
                                transition: 'transform 150ms ease',
                                color: 'rgba(255,255,255,0.65)',
                              }}
                            />
                          </ActionIcon>
                          {m.profilePhotoStreamPath ? (
                            <AuthedAlbumImage
                              streamPath={m.profilePhotoStreamPath}
                              alt=""
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                flexShrink: 0,
                              }}
                            />
                          ) : null}
                          <Text
                            component={Link}
                            to={`/profile/${m.id}`}
                            size="sm"
                            fw={600}
                            lineClamp={1}
                            style={{ color: '#fff', flex: 1, minWidth: 0, textDecoration: 'none' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {m.displayName || m.email}
                            {isOwner ? (
                              <Text span size="xs" c="dimmed" ml={6}>
                                (owner)
                              </Text>
                            ) : null}
                            {m.email && m.displayName && m.displayName !== m.email ? (
                              <Text span size="xs" c="dimmed" display="block" fw={400}>
                                {m.email}
                              </Text>
                            ) : null}
                          </Text>
                        </Group>
                        <Collapse in={rowOpen}>
                          <Divider
                            my="sm"
                            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                          />
                          <Group justify="space-between" wrap="wrap" gap="sm">
                            <Group gap={4} wrap="nowrap">
                              {!isOwner ? (
                                <Button
                                  type="button"
                                  variant="subtle"
                                  size="xs"
                                  color="gray"
                                  leftSection={<IoShieldCheckmarkOutline size={14} />}
                                  onClick={() => setPermMember(m)}
                                  disabled={busyMemberId === m.id}
                                >
                                  Permissions
                                </Button>
                              ) : null}
                            </Group>
                            {!isOwner ? (
                              <Button
                                size="xs"
                                color="red"
                                variant="subtle"
                                disabled={busyMemberId === m.id}
                                onClick={() => handleRemoveMember(String(m.id))}
                              >
                                Remove
                              </Button>
                            ) : null}
                          </Group>
                        </Collapse>
                      </Paper>
                    )
                  })}
                  {albumMembers.length === 0 && !inviteLoading ? (
                    <Text size="xs" c="dimmed">
                      No members loaded.
                    </Text>
                  ) : null}
                </Stack>
              </ScrollArea.Autosize>

              {multiSelectData.length > 0 ? (
                <>
                  <MultiSelect
                    label="Add people from your organization"
                    placeholder={
                      inviteLoading ? 'Loading…' : 'Choose members to add'
                    }
                    data={multiSelectData}
                    value={selectedToAdd}
                    onChange={setSelectedToAdd}
                    searchable
                    nothingFoundMessage="No one left to add"
                    disabled={inviteLoading}
                    styles={{
                      input: {
                        background: 'rgba(255,255,255,0.06)',
                        borderColor: 'rgba(255,255,255,0.14)',
                        color: '#fff',
                      },
                      label: { color: 'rgba(255,255,255,0.75)' },
                      pill: { background: 'rgba(99,102,241,0.35)' },
                    }}
                  />
                  <Button
                    variant="light"
                    color="indigo"
                    onClick={handleAddMembers}
                    disabled={selectedToAdd.length === 0 || inviteLoading}
                    loading={inviteLoading}
                  >
                    Add to album
                  </Button>
                </>
              ) : null}
            </>
          ) : null}

          {canEditAlbum ? (
            <>
              <Divider
                label="Cover"
                labelProps={{ style: { color: 'rgba(255,255,255,0.65)' } }}
              />
              <Text size="xs" c="dimmed">
                Shown on the dashboard. Saved when you tap Save below.
              </Text>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="album-settings-cover-input"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  handleCoverFile(f)
                }}
              />
              <Box
                role="button"
                tabIndex={0}
                onClick={() =>
                  document.getElementById('album-settings-cover-input')?.click()
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    document.getElementById('album-settings-cover-input')?.click()
                  }
                }}
                style={{
                  borderRadius: 12,
                  border: '1px dashed rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.04)',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: 12,
                  cursor: 'pointer',
                }}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt=""
                    style={{
                      width: '100%',
                      maxHeight: 160,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                ) : album.cover_stream_path ? (
                  <AuthedAlbumImage
                    streamPath={album.cover_stream_path}
                    directSrc={album.cover_image}
                    alt=""
                    className="album-settings-modal__cover-img"
                    style={{
                      width: '100%',
                      maxHeight: 160,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                ) : album.cover_image ? (
                  <img
                    src={album.cover_image}
                    alt=""
                    style={{
                      width: '100%',
                      maxHeight: 160,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <>
                    <IoImageOutline size={32} color="rgba(255,255,255,0.35)" />
                    <Text size="sm" c="dimmed">
                      Tap to choose a cover image
                    </Text>
                  </>
                )}
              </Box>
              <Group gap="sm">
                {pendingCoverFile ? (
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={clearPendingCover}
                  >
                    Discard new image
                  </Button>
                ) : null}
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={handleClearCoverOnly}
                  loading={saving}
                  disabled={Boolean(pendingCoverFile)}
                >
                  Remove album cover
                </Button>
              </Group>
            </>
          ) : null}

          <Divider
            label="Details"
            labelProps={{ style: { color: 'rgba(255,255,255,0.65)' } }}
          />

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
            Changing to public clears private member list. Changing visibility may
            affect who sees photos.
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

      <Modal
        opened={Boolean(permMember) && !permMember?.isAlbumOwner}
        onClose={() => setPermMember(null)}
        title={
          permMember ? (
            <Text size="sm" fw={600} c="#fff" lineClamp={2}>
              Permissions · {permMember.displayName || permMember.email}
            </Text>
          ) : (
            ''
          )
        }
        size="md"
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
        {permMember && !permMember.isAlbumOwner ? (
          <Stack gap="sm">
            <Text size="xs" c="dimmed">
              Album-level actions for this member. Changes save immediately.
            </Text>
            <ScrollArea.Autosize mah={360} type="auto">
              <Stack gap="xs">
                {ALBUM_CAP_DEFS.map(({ key, label }) => {
                  const checked =
                    key === 'canLike' || key === 'canComment'
                      ? permMember[key] !== false
                      : Boolean(permMember[key])
                  return (
                    <Switch
                      key={`${permMember.id}-${key}`}
                      label={label}
                      checked={checked}
                      disabled={busyMemberId === permMember.id}
                      onChange={(e) =>
                        patchMember(String(permMember.id), {
                          [key]: e.currentTarget.checked,
                        })
                      }
                      styles={{ label: { color: 'rgba(255,255,255,0.85)' } }}
                    />
                  )
                })}
              </Stack>
            </ScrollArea.Autosize>
          </Stack>
        ) : null}
      </Modal>
    </>
  )
}
