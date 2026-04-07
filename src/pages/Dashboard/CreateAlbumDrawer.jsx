import React, { useEffect, useRef, useState } from 'react'
import {
  Drawer,
  Stack,
  TextInput,
  Textarea,
  Switch,
  Group,
  Text,
  Button,
  Popover,
  ScrollArea,
  Box,
} from '@mantine/core'
import { AnimatePresence, LayoutGroup } from 'framer-motion'
import { IoAddOutline, IoImageOutline } from 'react-icons/io5'
import { getAlbumCreateMemberCandidates } from '../../api/organizations'
import { AuthedAlbumImage } from '../AlbumPhotos/AuthedAlbumImage'
import { MemberPill } from './MemberPill'
import './CreateAlbumDrawer.css'

function memberAvatarStreamPath(path) {
  if (!path) return null
  const joiner = path.includes('?') ? '&' : '?'
  return `${path}${joiner}size=thumb`
}

export function CreateAlbumDrawer({ orgId, opened, onClose, onCreateAlbum }) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState([])
  const [orgPickList, setOrgPickList] = useState([])
  const [candidatesLoading, setCandidatesLoading] = useState(false)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const fileRef = useRef(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const didSubmitRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!opened) {
      setName('')
      setNameError('')
      setIsPublic(false)
      setDescription('')
      setMembers([])
      setOrgPickList([])
      setCandidatesLoading(false)
      setPickerOpen(false)
      setSubmitting(false)
      setSubmitError('')
      setCoverFile(null)
      setCoverPreviewUrl((prev) => {
        if (prev && !didSubmitRef.current) URL.revokeObjectURL(prev)
        didSubmitRef.current = false
        return null
      })
    }
  }, [opened])

  useEffect(() => {
    if (!opened || !orgId) {
      setOrgPickList([])
      return
    }
    setCandidatesLoading(true)
    getAlbumCreateMemberCandidates(orgId)
      .then((list) => setOrgPickList(Array.isArray(list) ? list : []))
      .catch(() => setOrgPickList([]))
      .finally(() => setCandidatesLoading(false))
  }, [opened, orgId])

  const addMember = (m) => {
    setMembers((prev) =>
      prev.some((x) => String(x.id) === String(m.id)) ? prev : [...prev, m]
    )
    setPickerOpen(false)
  }

  const removeMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    setCoverFile(file)
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Album name is required')
      return
    }
    setNameError('')
    setSubmitError('')
    setSubmitting(true)
    try {
      await onCreateAlbum({
        name: trimmed,
        isPublic,
        description,
        members,
        coverFile,
      })
      didSubmitRef.current = true
      onClose()
    } catch (e) {
      setSubmitError(e.message || 'Could not create album')
    } finally {
      setSubmitting(false)
    }
  }

  const availablePick = orgPickList.filter(
    (m) => !members.some((sel) => String(sel.id) === String(m.id))
  )

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="100%"
      radius={0}
      title="Create album"
      className="create-album-drawer"
      overlayProps={{ backgroundOpacity: 0.65, blur: 4 }}
      transitionProps={{ transition: 'slide-up', duration: 280 }}
      styles={{
        header: { alignItems: 'center' },
        body: { padding: 0 },
      }}
    >
      <Stack gap="lg" className="create-album-drawer__body" p="md" pt="sm">
        <div>
          <label className="create-album-drawer__label" htmlFor="album-name">
            Name <span style={{ color: '#ff6b9d' }}>*</span>
          </label>
          <TextInput
            id="album-name"
            placeholder="My summer trip"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError('')
            }}
            error={nameError}
            maxLength={120}
            styles={{
              input: {
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.14)',
                color: '#fff',
              },
            }}
          />
        </div>

        <div>
          <span className="create-album-drawer__label">Visibility</span>
          <Group justify="space-between" wrap="nowrap" gap="md" mt={4}>
            <Text
              size="sm"
              fw={600}
              c={!isPublic ? '#7dd3fc' : 'rgba(255,255,255,0.45)'}
            >
              Private
            </Text>
            <Switch
              checked={isPublic}
              onChange={(e) => setIsPublic(!!e.currentTarget.checked)}
              color="cyan"
              size="md"
              styles={{
                track: {
                  background: !isPublic
                    ? 'rgba(255,255,255,0.18)'
                    : 'rgba(255, 107, 157, 0.55)',
                },
              }}
            />
            <Text
              size="sm"
              fw={600}
              c={isPublic ? '#a5b4fc' : 'rgba(255,255,255,0.45)'}
            >
              Public
            </Text>
          </Group>
        </div>

        <div>
          <span className="create-album-drawer__label">Members (optional)</span>
          <Group
            align="stretch"
            wrap="wrap"
            gap={8}
            className="create-album-drawer__members-shell"
            mt={6}
          >
            <LayoutGroup>
              <AnimatePresence initial={false}>
                {members.map((m) => (
                  <MemberPill
                    key={m.id}
                    member={m}
                    onRemove={removeMember}
                  />
                ))}
              </AnimatePresence>
            </LayoutGroup>
            <Popover
              opened={pickerOpen}
              onChange={setPickerOpen}
              position="bottom-start"
              width="target"
              withinPortal
            >
              <Popover.Target>
                <div className="create-album-drawer__member-add">
                  <button
                    type="button"
                    className="create-album-drawer__member-trigger"
                    onClick={() => setPickerOpen((o) => !o)}
                  >
                    <Group gap={6} wrap="nowrap">
                      <IoAddOutline size={18} />
                      <span>Add members</span>
                    </Group>
                  </button>
                </div>
              </Popover.Target>
              <Popover.Dropdown
                styles={{ dropdown: { background: '#1a1a22', borderColor: 'rgba(255,255,255,0.12)' } }}
              >
                <ScrollArea.Autosize mah={240} type="auto">
                  {candidatesLoading ? (
                    <Text size="sm" c="dimmed" p="xs">
                      Loading organization members…
                    </Text>
                  ) : availablePick.length === 0 ? (
                    <Text size="sm" c="dimmed" p="xs">
                      {orgPickList.length === 0
                        ? 'No other members in this organization.'
                        : 'Everyone you can add is already selected.'}
                    </Text>
                  ) : (
                    availablePick.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="create-album-drawer__member-row"
                        onClick={() =>
                          addMember({
                            id: m.id,
                            name: m.displayName || m.email,
                            displayName: m.displayName,
                            email: m.email,
                            profilePhotoStreamPath: m.profilePhotoStreamPath,
                          })
                        }
                      >
                        {m.profilePhotoStreamPath ? (
                          <AuthedAlbumImage
                            streamPath={memberAvatarStreamPath(m.profilePhotoStreamPath)}
                            variant="full"
                            alt=""
                            className="create-album-drawer__member-avatar"
                            width={32}
                            height={32}
                            style={{
                              flexShrink: 0,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              minWidth: 32,
                              minHeight: 32,
                            }}
                          />
                        ) : (
                          <span
                            className="create-album-drawer__member-initial"
                            aria-hidden
                          >
                            {(m.displayName || m.email || '?').slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <span>
                          {m.displayName || m.email}
                          {m.username ? (
                            <Text component="span" size="xs" c="dimmed" display="block">
                              @{m.username}
                            </Text>
                          ) : null}
                        </span>
                      </button>
                    ))
                  )}
                </ScrollArea.Autosize>
              </Popover.Dropdown>
            </Popover>
          </Group>
        </div>

        <div>
          <Group justify="space-between" mb={6}>
            <label className="create-album-drawer__label" htmlFor="album-desc" style={{ marginBottom: 0 }}>
              Description
            </label>
            <Text size="xs" c="dimmed">
              {description.length}/500
            </Text>
          </Group>
          <Textarea
            id="album-desc"
            placeholder="What’s this album about?"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value.slice(0, 500))
            }
            minRows={3}
            maxLength={500}
            styles={{
              input: {
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.14)',
                color: '#fff',
              },
            }}
          />
        </div>

        <div>
          <span className="create-album-drawer__label">Cover image</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleCoverChange}
          />
          <Box
            role="button"
            tabIndex={0}
            className="create-album-drawer__cover-zone"
            mt={6}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileRef.current?.click()
              }
            }}
          >
            {coverPreviewUrl ? (
              <img
                src={coverPreviewUrl}
                alt=""
                className="create-album-drawer__cover-preview"
              />
            ) : (
              <>
                <IoImageOutline size={36} color="rgba(255,255,255,0.35)" />
                <Text size="sm" c="dimmed" ta="center">
                  Tap to upload a cover
                </Text>
              </>
            )}
            {coverPreviewUrl && (
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation()
                  setCoverFile(null)
                  setCoverPreviewUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev)
                    return null
                  })
                }}
              >
                Remove image
              </Button>
            )}
          </Box>
        </div>

        <Text className="create-album-drawer__hint" component="p">
          Once this album is created, you can add pictures to it from the album
          view.
        </Text>

        {submitError ? (
          <Text size="sm" c="red.4">
            {submitError}
          </Text>
        ) : null}

        <Group grow gap="sm" mt="md">
          <Button variant="default" color="gray" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button color="teal" onClick={handleSubmit} loading={submitting}>
            Create album
          </Button>
        </Group>
      </Stack>
    </Drawer>
  )
}
