import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Modal,
  Stack,
  TextInput,
  Button,
  Text,
  Group,
  ScrollArea,
  ActionIcon,
  Divider,
  Select,
  Switch,
  Accordion,
  Paper,
  Badge,
  Alert,
  Collapse,
} from '@mantine/core'
import {
  IoTrashOutline,
  IoCloseOutline,
  IoPersonAddOutline,
  IoImagesOutline,
  IoEyeOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoMailOutline,
  IoChevronDown,
  IoTrash,
} from 'react-icons/io5'
import {
  updateOrganization,
  deleteOrganization,
  getOrgMembers,
  removeOrgMember,
  getOrgAlbumsSummary,
  inviteOrgMember,
  updateOrgMember,
} from '../../api/organizations'
import './OrganizationsPage.css'
import { MemberPill } from '../Dashboard/MemberPill'
import { AuthedAlbumImage } from '../AlbumPhotos/AuthedAlbumImage'

const inputClassNames = { input: 'orgs-page__glass-input' }

const CAP_DEFS = [
  { key: 'canCreateAlbum', label: 'Create albums' },
  { key: 'canUpload', label: 'Upload (org-wide default)' },
  { key: 'canDownload', label: 'Download' },
  { key: 'canLike', label: 'Like' },
  { key: 'canComment', label: 'Comment' },
  { key: 'canManageOrgMembers', label: 'Manage org members' },
  { key: 'canManageRoles', label: 'Assign admins & roles' },
  { key: 'canApproveAlbumRequests', label: 'Approve album join requests' },
  { key: 'canManageAlbums', label: 'Manage album members & settings' },
  { key: 'canDeleteImages', label: 'Delete images' },
  { key: 'canModerateRestrictions', label: 'Moderate restrictions' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function splitEmailsFromString(str) {
  return str
    .split(/[\s,;]+/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
}

function isValidEmail(s) {
  return EMAIL_RE.test(s)
}

const modalClassNames = {
  content: 'edit-org-modal__content',
  header: 'edit-org-modal__header',
  title: 'edit-org-modal__title',
  body: 'edit-org-modal__body',
}

export function EditOrganizationModal({ org, opened, onClose, onUpdated, onDeleted }) {
  const [name, setName] = useState('')
  const [members, setMembers] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [inviteEmailChips, setInviteEmailChips] = useState([])
  const [inviteInput, setInviteInput] = useState('')
  const [inviteEmailError, setInviteEmailError] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteCaps, setInviteCaps] = useState({})
  const [inviting, setInviting] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [memberSearch, setMemberSearch] = useState('')
  const [permMember, setPermMember] = useState(null)
  const [emailsAwaitingEmailInvite, setEmailsAwaitingEmailInvite] = useState([])
  const [sendingEmailInvites, setSendingEmailInvites] = useState(false)
  const [expandedMemberRows, setExpandedMemberRows] = useState({})

  const canManageMembers = Boolean(org?.isOwner || org?.canManageOrgMembers)
  const canAssignRoles = Boolean(org?.isOwner || org?.canManageRoles)

  useEffect(() => {
    if (!opened || !org?.id) return
    setName(org.name || '')
    setError('')
    setInviteEmailChips([])
    setInviteInput('')
    setInviteEmailError('')
    setInviteRole('member')
    setInviteCaps({})
    setMemberSearch('')
    setPermMember(null)
    setEmailsAwaitingEmailInvite([])
    setSendingEmailInvites(false)
    setExpandedMemberRows({})
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

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase()
    if (!q) return members
    return members.filter((m) => {
      const hay = `${m.displayName || ''} ${m.username || ''} ${m.email || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [members, memberSearch])

  const commitInviteTokens = () => {
    const raw = inviteInput.trim()
    if (!raw) {
      setInviteEmailError('')
      return
    }
    const tokens = splitEmailsFromString(raw)
    if (!tokens.length) return
    const valid = []
    const invalid = []
    for (const t of tokens) {
      if (isValidEmail(t)) valid.push(t)
      else invalid.push(t)
    }
    if (invalid.length) {
      setInviteEmailError(
        `Invalid email${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}`
      )
    } else {
      setInviteEmailError('')
    }
    if (valid.length) {
      setInviteEmailChips((prev) => {
        const set = new Set(prev)
        for (const v of valid) set.add(v)
        return [...set]
      })
    }
    setInviteInput('')
  }

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

  const requestRemoveMember = (member) => {
    const ok = window.confirm(
      `Remove ${member.email} from this organization? They will lose access immediately.`
    )
    if (!ok) return
    handleRemoveMember(member.id)
  }

  const handleRemoveMember = async (userId) => {
    if (!org?.id) return
    setRemovingId(userId)
    try {
      await removeOrgMember(org.id, userId)
      const data = await getOrgMembers(org.id)
      setMembers(data.members || [])
    } catch {
      /* ignore */
    } finally {
      setRemovingId(null)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!org?.id) return
    const fromInput = splitEmailsFromString(inviteInput.trim())
    const invalidTokens = fromInput.filter((t) => t && !isValidEmail(t))
    if (invalidTokens.length) {
      setInviteEmailError(
        `Invalid email${invalidTokens.length > 1 ? 's' : ''}: ${invalidTokens.join(', ')}`
      )
      return
    }
    const emailSet = new Set(
      [...inviteEmailChips, ...fromInput].map((x) => x.trim().toLowerCase()).filter(Boolean)
    )
    const emails = [...emailSet].filter(isValidEmail)
    if (!emails.length) {
      setInviteEmailError('Add at least one valid email address')
      return
    }
    if (inviteRole === 'admin' && !canAssignRoles) {
      setError('You cannot assign admins')
      return
    }
    setInviteEmailError('')
    setInviting(true)
    setError('')
    setEmailsAwaitingEmailInvite([])
    const failures = []
    const noAccount = []
    let directSuccessCount = 0
    try {
      for (const email of emails) {
        try {
          await inviteOrgMember(org.id, {
            email,
            role: inviteRole,
            caps: inviteCaps,
          })
          directSuccessCount += 1
        } catch (err) {
          if (err.code === 'NO_USER_FOR_EMAIL') {
            noAccount.push(email)
          } else {
            failures.push({ email, message: err.message || 'Invite failed' })
          }
        }
      }

      setEmailsAwaitingEmailInvite(noAccount)

      if (failures.length === emails.length && noAccount.length === 0) {
        setError(failures.map((f) => `${f.email}: ${f.message}`).join(' · '))
      } else {
        if (failures.length) {
          setError(
            `${failures.map((f) => `${f.email}: ${f.message}`).join(' · ')}${
              noAccount.length
                ? ` · ${noAccount.length} address(es) are not on PicPoint yet — send email invitations below.`
                : ''
            }`
          )
        } else if (noAccount.length === emails.length) {
          setError('')
        } else {
          setError('')
        }

        if (directSuccessCount > 0) {
          setInviteEmailChips([])
          setInviteInput('')
          setInviteEmailError('')
          setInviteRole('member')
          setInviteCaps({})
          const data = await getOrgMembers(org.id)
          setMembers(data.members || [])
          onUpdated?.()
        }
      }
    } finally {
      setInviting(false)
    }
  }

  const handleSendEmailInvitesToPending = async () => {
    if (!org?.id || !emailsAwaitingEmailInvite.length) return
    setSendingEmailInvites(true)
    setError('')
    try {
      for (const email of emailsAwaitingEmailInvite) {
        await inviteOrgMember(org.id, {
          email,
          role: inviteRole,
          caps: inviteCaps,
          sendEmailInvite: true,
        })
      }
      setEmailsAwaitingEmailInvite([])
      setInviteEmailChips([])
      setInviteInput('')
      setInviteEmailError('')
      setInviteRole('member')
      setInviteCaps({})
      const data = await getOrgMembers(org.id)
      setMembers(data.members || [])
      onUpdated?.()
    } catch (err) {
      setError(err.message || 'Failed to send invitation emails')
    } finally {
      setSendingEmailInvites(false)
    }
  }

  const patchMemberCaps = async (userId, capsPatch) => {
    if (!org?.id) return
    setUpdatingId(userId)
    setError('')
    try {
      const updated = await updateOrgMember(org.id, userId, { caps: capsPatch })
      setMembers((prev) =>
        prev.map((m) =>
          String(m.id) === String(userId)
            ? { ...m, caps: updated.caps || m.caps }
            : m
        )
      )
      setPermMember((cur) =>
        cur && String(cur.id) === String(userId)
          ? { ...cur, caps: updated.caps || cur.caps }
          : cur
      )
      onUpdated?.()
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const setMemberRole = async (userId, role) => {
    if (!org?.id) return
    if (role === 'admin' && !canAssignRoles) return
    setUpdatingId(userId)
    setError('')
    try {
      const updated = await updateOrgMember(org.id, userId, { role })
      setMembers((prev) =>
        prev.map((m) =>
          String(m.id) === String(userId) ? { ...m, role: updated.role } : m
        )
      )
      setPermMember((cur) =>
        cur && String(cur.id) === String(userId) ? { ...cur, role: updated.role } : cur
      )
      onUpdated?.()
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteOrg = async () => {
    if (!org?.id) return
    const ok = window.confirm(
      'Soft-delete this organization? Members lose access; album data stays in the database.'
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
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title="Organization settings"
        size="xl"
        fullScreen
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        classNames={modalClassNames}
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
            {org.isOwner ? (
              <Group align="flex-end" wrap="nowrap" gap="sm">
                <TextInput
                  flex={1}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={200}
                  placeholder="Organization name"
                  classNames={inputClassNames}
                  styles={{ root: { flex: 1 } }}
                />
                <Button
                  variant="default"
                  className="gallery-theme-btn--accent3"
                  onClick={handleSave}
                  loading={saving}
                  style={{ flexShrink: 0 }}
                >
                  Save name
                </Button>
              </Group>
            ) : (
              <TextInput
                value={name}
                readOnly
                disabled
                classNames={inputClassNames}
              />
            )}
          </div>

          {!org.isOwner ? (
            <Text size="xs" style={{ color: 'var(--muted)' }}>
              Only the owner can rename this organization.
            </Text>
          ) : null}

          {canManageMembers ? (
            <Paper p="md" radius="md" withBorder style={{
              borderColor: 'rgba(255, 255, 255, 0.42)',
              backgroundColor: '#000',
            }}>
              <Divider
                label="Invite to organization"
                labelProps={{ style: { color: 'var(--muted)' } }}
              />
              <Text size="xs" style={{ color: 'var(--muted)' }}>
                Members with a PicPoint account are added immediately. If someone is not
                signed up yet, you can send them an email invitation after you try to add
                them. Separate multiple emails with space, comma, or Enter.
              </Text>
              <form onSubmit={handleInvite}>
                <Stack gap="sm">
                  <Text size="xs" fw={600} style={{ color: 'var(--muted)' }}>
                    Emails
                  </Text>
                  <div
                    className="edit-org-modal__invite-shell"
                    data-invalid={inviteEmailError ? true : undefined}
                  >
                    {inviteEmailChips.map((email) => (
                      // <span key={email} className="edit-org-modal__email-chip">
                      //   <span className="edit-org-modal__email-chip-text" title={email}>
                      //     {email}
                      //   </span>
                      //   <button
                      //     type="button"
                      //     className="edit-org-modal__email-chip-remove"
                      //     aria-label={`Remove ${email}`}
                      //     onClick={() =>
                      //       setInviteEmailChips((prev) => prev.filter((x) => x !== email))
                      //     }
                      //   >
                      //     <IoCloseOutline size={16} aria-hidden />
                      //   </button>
                      // </span>
                      <MemberPill 
                        key={email} 
                        member={{name: email, id: email}}
                        showImage={false}
                        onRemove={(id) =>
                            setInviteEmailChips((prev) => prev.filter((x) => x !== id))
                          } />
                    ))}
                    <input
                      type="text"
                      inputMode="email"
                      autoComplete="off"
                      className="edit-org-modal__invite-input"
                      placeholder={
                        inviteEmailChips.length ? 'Add another…' : 'name@example.com'
                      }
                      value={inviteInput}
                      onChange={(e) => {
                        setInviteInput(e.target.value)
                        if (inviteEmailError) setInviteEmailError('')
                      }}
                      aria-invalid={Boolean(inviteEmailError)}
                      aria-describedby={inviteEmailError ? 'edit-org-invite-email-error' : undefined}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter' || ev.key === ',' || ev.key === ';' || ev.key === ' ') {
                          ev.preventDefault()
                          commitInviteTokens()
                        }
                        if (ev.key === 'Backspace' && !inviteInput && inviteEmailChips.length) {
                          setInviteEmailChips((prev) => prev.slice(0, -1))
                        }
                      }}
                      onBlur={() => {
                        if (inviteInput.trim()) commitInviteTokens()
                      }}
                    />
                  </div>
                  {inviteEmailError ? (
                    <Text
                      id="edit-org-invite-email-error"
                      size="xs"
                      role="alert"
                      style={{ color: 'color-mix(in srgb, var(--accent) 75%, white)' }}
                    >
                      {inviteEmailError}
                    </Text>
                  ) : null}
                  {emailsAwaitingEmailInvite.length > 0 ? (
                    <Alert
                      variant="light"
                      color="cyan"
                      title="No PicPoint account yet"
                      styles={{
                        root: {
                          background: 'color-mix(in srgb, var(--accent3) 12%, transparent)',
                          borderColor: 'color-mix(in srgb, var(--accent3) 35%, transparent)',
                        },
                        title: { color: 'var(--text)' },
                        message: { color: 'var(--muted)' },
                      }}
                    >
                      <Stack gap="sm">
                        <Text size="sm" style={{ color: 'var(--text)' }}>
                          These addresses are not registered yet. Send an email from PicPoint
                          with a link to sign up and accept this invitation:
                        </Text>
                        <Stack component="ul" gap={4} style={{ margin: 0, paddingLeft: 20 }}>
                          {emailsAwaitingEmailInvite.map((em) => (
                            <Text key={em} component="li" size="xs" style={{ color: 'var(--muted)' }}>
                              {em}
                            </Text>
                          ))}
                        </Stack>
                        <Group gap="sm" wrap="wrap">
                          <Button
                            type="button"
                            size="sm"
                            leftSection={<IoMailOutline size={18} />}
                            variant="default"
                            className="gallery-theme-btn--accent3"
                            loading={sendingEmailInvites}
                            onClick={handleSendEmailInvitesToPending}
                          >
                            Send invitation emails
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="subtle"
                            color="gray"
                            onClick={() => setEmailsAwaitingEmailInvite([])}
                          >
                            Dismiss
                          </Button>
                        </Group>
                      </Stack>
                    </Alert>
                  ) : null}
                  <Select
                    label=""
                    value={inviteRole}
                    onChange={(v) => setInviteRole(v || 'member')}
                    data={
                      canAssignRoles
                        ? [
                            { value: 'member', label: 'Member' },
                            { value: 'admin', label: 'Admin' },
                          ]
                        : [{ value: 'member', label: 'Member' }]
                    }
                    w={160}
                    classNames={inputClassNames}
                  />
                  {inviteRole === 'admin' && canAssignRoles ? (
                    <Accordion variant="contained" radius="md">
                      <Accordion.Item value="caps">
                        <Accordion.Control>Admin permissions</Accordion.Control>
                        <Accordion.Panel>
                          <Stack gap="xs">
                            {CAP_DEFS.map(({ key, label }) => (
                              <Switch
                                key={key}
                                label={label}
                                checked={Boolean(inviteCaps[key])}
                                onChange={(e) =>
                                  setInviteCaps((prev) => ({
                                    ...prev,
                                    [key]: e.currentTarget.checked,
                                  }))
                                }
                              />
                            ))}
                          </Stack>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  ) : null}
                  <Button
                    type="submit"
                    leftSection={<IoPersonAddOutline size={18} />}
                    variant="default"
                    className="gallery-theme-btn--albums"
                    loading={inviting}
                  >
                    Send invites
                  </Button>
                </Stack>
              </form>
            </Paper>
          ) : null}

          <Paper p="md" radius="md" withBorder style={{
              borderColor: 'rgba(255, 255, 255, 0.42)',
              backgroundColor: '#000',
            }}>
            <Group justify="space-between" align="flex-end" mb={6} wrap="wrap" gap="xs">
              <Text size="xs" fw={600} style={{ color: 'var(--muted)' }}>
                Members ({loading ? '…' : members.length})
              </Text>
              <TextInput
                placeholder="Search members…"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                size="xs"
                w={{ base: '100%', sm: 220 }}
                classNames={inputClassNames}
              />
            </Group>
            {filteredMembers.length !== members.length ? (
              <Text size="xs" mb={8} style={{ color: 'var(--muted)' }}>
                Showing {filteredMembers.length} of {members.length}
              </Text>
            ) : null}
            <ScrollArea.Autosize mah={360} type="auto" offsetScrollbars>
              <Stack gap={8}>
                {filteredMembers.map((m) => {
                  const rowKey = String(m.id)
                  const rowOpen = Boolean(expandedMemberRows[rowKey])
                  return (
                    <Paper
                      key={m.id}
                      p="sm"
                      radius="md"
                      withBorder
                      style={{
                        borderColor: 'rgba(255,255,255,0.08)',
                        backgroundColor: 'color-mix(in srgb, var(--surface) 55%, transparent)',
                      }}
                    >
                      <Group justify="flex-start" wrap="nowrap" gap="sm" align="center">
                        <ActionIcon
                          type="button"
                          variant="subtle"
                          size="sm"
                          className="gallery-theme-btn--ghost"
                          aria-expanded={rowOpen}
                          aria-label={rowOpen ? 'Hide member actions' : 'Show member actions'}
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
                              transform: rowOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 150ms ease',
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
                          lineClamp={2}
                          style={{
                            color: 'var(--text)',
                            flex: 1,
                            minWidth: 0,
                            textDecoration: 'none',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {m.displayName || m.email}
                          {m.email && m.displayName && m.displayName !== m.email ? (
                            <Text component="span" size="xs" c="dimmed" display="block" fw={400}>
                              {m.email}
                            </Text>
                          ) : null}
                        </Text>
                      </Group>
                      <Collapse in={rowOpen}>
                        <Divider my="sm" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                        <Group justify="space-between" wrap="wrap" gap="sm" align="center">
                          <Group gap="sm" wrap="wrap" style={{ flex: 1, minWidth: 0 }}>
                            {canAssignRoles && m.role !== 'owner' ? (
                              <Select
                                size="xs"
                                value={m.role}
                                onChange={(v) => v && setMemberRole(m.id, v)}
                                data={[
                                  { value: 'member', label: 'Member' },
                                  { value: 'admin', label: 'Admin' },
                                ]}
                                disabled={updatingId === m.id}
                                classNames={inputClassNames}
                                w={118}
                                styles={{ root: { flexShrink: 0 } }}
                              />
                            ) : (
                              <Badge
                                size="sm"
                                variant="light"
                                color={m.role === 'owner' ? 'pink' : 'gray'}
                                style={{ flexShrink: 0, textTransform: 'capitalize' }}
                              >
                                {m.role}
                              </Badge>
                            )}
                          </Group>
                          <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                            {m.role !== 'owner' && canManageMembers ? (
                              <Button
                                type="button"
                                variant="subtle"
                                size="xs"
                                leftSection={<IoShieldCheckmarkOutline size={14} />}
                                onClick={() => setPermMember(m)}
                                disabled={updatingId === m.id}
                                className="gallery-theme-btn--ghost"
                              >
                                Permissions
                              </Button>
                            ) : null}
                            {canManageMembers && m.role !== 'owner' ? (
                              <ActionIcon
                                variant="transparent"
                                size="md"
                                className="gallery-theme-btn--ghost"
                                loading={removingId === m.id}
                                onClick={() => requestRemoveMember(m)}
                                aria-label="Remove member"
                              >
                                <IoTrash size={18} />
                              </ActionIcon>
                            ) : null}
                          </Group>
                        </Group>
                      </Collapse>
                    </Paper>
                  )
                })}
                {!loading && members.length === 0 ? (
                  <Text size="sm" style={{ color: 'var(--muted)' }}>
                    No members loaded.
                  </Text>
                ) : null}
                {!loading && members.length > 0 && filteredMembers.length === 0 ? (
                  <Text size="sm" style={{ color: 'var(--muted)' }}>
                    No members match your search.
                  </Text>
                ) : null}
              </Stack>
            </ScrollArea.Autosize>
          </Paper>

          <Paper p="md" radius="md" withBorder style={{
              borderColor: 'rgba(255, 255, 255, 0.42)',
              backgroundColor: '#000',
            }}>
            <Text size="xs" fw={600} mb={10} style={{ color: 'var(--muted)' }}>
              Albums in this org ({loading ? '…' : albums.length})
            </Text>
            <ScrollArea.Autosize mah={320} type="auto" offsetScrollbars>
              <Stack gap="sm">
                {albums.map((a) => (
                  <Paper
                    key={a.id}
                    p="md"
                    radius="md"
                    withBorder
                    className="edit-org-modal__album-card"
                  >
                    <Group align="flex-start" wrap="nowrap" gap="md">
                      <div className="edit-org-modal__album-icon" aria-hidden>
                        <IoImagesOutline size={22} />
                      </div>
                      <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={600} size="sm" lineClamp={2} style={{ color: 'var(--text)' }}>
                          {a.title}
                        </Text>
                        <Group gap="sm" wrap="wrap">
                          <Badge
                            size="sm"
                            variant="outline"
                            color="cyan"
                            leftSection={<IoEyeOutline size={12} />}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {a.visibility}
                          </Badge>
                          {a.ownerEmail ? (
                            <Group gap={6} wrap="nowrap">
                              <IoPersonOutline
                                size={16}
                                style={{ color: 'var(--muted)', flexShrink: 0 }}
                              />
                              <Text size="xs" lineClamp={1} style={{ color: 'var(--muted)' }}>
                                {a.ownerDisplayName || a.ownerUsername || a.ownerEmail}
                              </Text>
                            </Group>
                          ) : null}
                        </Group>
                      </Stack>
                    </Group>
                  </Paper>
                ))}
                {!loading && albums.length === 0 ? (
                  <Text size="sm" style={{ color: 'var(--muted)' }}>
                    No albums yet.
                  </Text>
                ) : null}
              </Stack>
            </ScrollArea.Autosize>
          </Paper>

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

      <Modal
        opened={Boolean(permMember)}
        onClose={() => setPermMember(null)}
        title={
          permMember ? (
            <Text size="sm" fw={600} lineClamp={2} style={{ color: 'var(--text)' }}>
              Permissions · {permMember.displayName || permMember.email}
            </Text>
          ) : (
            ''
          )
        }
        size="md"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
        classNames={modalClassNames}
      >
        {permMember && permMember.role !== 'owner' ? (
          <Stack gap="sm">
            <Text size="xs" style={{ color: 'var(--muted)' }}>
              Toggle capabilities for this member. Changes save immediately.
            </Text>
            <ScrollArea.Autosize mah={420} type="auto">
              <Stack gap="xs">
                {CAP_DEFS.map(({ key, label }) => (
                  <Switch
                    key={`perm-${permMember.id}-${key}`}
                    label={label}
                    checked={Boolean(permMember.caps && permMember.caps[key])}
                    disabled={updatingId === permMember.id}
                    onChange={(e) =>
                      patchMemberCaps(permMember.id, {
                        [key]: e.currentTarget.checked,
                      })
                    }
                  />
                ))}
              </Stack>
            </ScrollArea.Autosize>
          </Stack>
        ) : null}
      </Modal>
    </>
  )
}
