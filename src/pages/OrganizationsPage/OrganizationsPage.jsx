import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  ActionIcon,
} from '@mantine/core'
import { IoAdd, IoArrowForward, IoCreateOutline } from 'react-icons/io5'
import { useAlbumLibrary } from '../../context/AlbumLibraryContext'
import { fetchCurrentUser } from '../../api/session'
import { createOrganization } from '../../api/organizations'
import {
  createOrgCreationRequest,
  listPendingOrgRequests,
  reviewOrgRequest,
} from '../../api/orgRequests'
import { OrgIcon } from './OrgIcon'
import { EditOrganizationModal } from './EditOrganizationModal'
import './OrganizationsPage.css'

export default function OrganizationsPage() {
  const navigate = useNavigate()
  const {
    organizations,
    refreshOrganizations,
    setCurrentOrgId,
    currentOrgId,
  } = useAlbumLibrary()

  const [me, setMe] = useState(null)
  const [newOrgName, setNewOrgName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [requestName, setRequestName] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [requestOk, setRequestOk] = useState('')
  const [pending, setPending] = useState([])
  const [reviewBusy, setReviewBusy] = useState(null)
  const [editOrg, setEditOrg] = useState(null)

  useEffect(() => {
    fetchCurrentUser()
      .then((d) => setMe(d.user))
      .catch(() => setMe(null))
  }, [])

  useEffect(() => {
    refreshOrganizations()
  }, [refreshOrganizations])

  useEffect(() => {
    if (!me?.isSuperadmin) {
      setPending([])
      return
    }
    listPendingOrgRequests()
      .then(setPending)
      .catch(() => setPending([]))
  }, [me])

  const canCreateOrg = Boolean(me?.isSuperadmin || me?.canCreateOrganizations)

  const openOrg = (id) => {
    setCurrentOrgId(id)
    navigate('/dashboard')
  }

  const handleOrgUpdated = () => {
    refreshOrganizations()
  }

  const handleOrgDeleted = (deletedId) => {
    if (String(deletedId) === String(currentOrgId)) {
      setCurrentOrgId(null)
    }
    refreshOrganizations()
  }

  const handleCreateOrg = async (e) => {
    e.preventDefault()
    const name = newOrgName.trim()
    if (!name) {
      setCreateError('Name is required')
      return
    }
    setCreateError('')
    setCreating(true)
    try {
      await createOrganization(name)
      setNewOrgName('')
      await refreshOrganizations()
    } catch (err) {
      setCreateError(err.message || 'Could not create organization')
    } finally {
      setCreating(false)
    }
  }

  const handleRequest = async (e) => {
    e.preventDefault()
    const name = requestName.trim()
    if (!name) {
      setRequestError('Proposed name is required')
      return
    }
    setRequestError('')
    setRequestOk('')
    setRequesting(true)
    try {
      await createOrgCreationRequest(name)
      setRequestName('')
      setRequestOk('Request submitted. A superadmin will review it.')
    } catch (err) {
      setRequestError(err.message || 'Request failed')
    } finally {
      setRequesting(false)
    }
  }

  const handleReview = async (requestId, action) => {
    setReviewBusy(requestId)
    try {
      await reviewOrgRequest(requestId, action)
      setPending((prev) => prev.filter((r) => r.id !== requestId))
    } catch {
      /* ignore */
    } finally {
      setReviewBusy(null)
    }
  }

  const inputClassNames = {
    input: 'orgs-page__glass-input',
  }

  return (
    <section className="orgs-page">
      <div className="orgs-page__blob orgs-page__blob--1" aria-hidden />
      <div className="orgs-page__blob orgs-page__blob--2" aria-hidden />
      <div className="orgs-page__blob orgs-page__blob--3" aria-hidden />
      <div className="orgs-page__grid" aria-hidden />

      <Stack className="orgs-page__inner" gap="xl" py={40} px="md" maw={560} mx="auto">
        <div>
          <Title order={2} className="orgs-page__title">
            Organizations
          </Title>
          <Text size="sm" className="orgs-page__subtitle" mt={8}>
            Choose where you work. Albums and members belong to one organization at a time.
          </Text>
        </div>

        {me?.isSuperadmin && pending.length > 0 ? (
          <Paper className="orgs-page__glass" p="md" radius="lg">
            <Text size="sm" fw={700} mb="sm" style={{ color: 'var(--text)' }}>
              Pending organization requests
            </Text>
            <Stack gap="sm">
              {pending.map((r) => (
                <Group key={r.id} justify="space-between" wrap="nowrap" gap="xs">
                  <div style={{ minWidth: 0 }}>
                    <Text size="sm" fw={600} lineClamp={1} style={{ color: 'var(--text)' }}>
                      {r.proposedOrgName}
                    </Text>
                    <Text size="xs" lineClamp={1} style={{ color: 'var(--muted)' }}>
                      {r.user?.email}
                    </Text>
                  </div>
                  <Group gap={6} wrap="nowrap">
                    <Button
                      size="xs"
                      variant="default"
                      className="gallery-theme-btn--accent3"
                      loading={reviewBusy === r.id}
                      onClick={() => handleReview(r.id, 'approve')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="xs"
                      variant="default"
                      className="gallery-theme-btn--ghost"
                      disabled={reviewBusy === r.id}
                      onClick={() => handleReview(r.id, 'reject')}
                    >
                      Reject
                    </Button>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Paper>
        ) : null}

        <Stack gap="sm">
          {organizations.length === 0 ? (
            <Paper className="orgs-page__glass" p="xl" radius="lg">
              <Text size="sm" ta="center" style={{ color: 'var(--muted)' }}>
                You&apos;re not in any organization yet. Create one if you have permission, or
                request access from a superadmin.
              </Text>
            </Paper>
          ) : (
            organizations.map((org) => {
              const active = String(org.id) === String(currentOrgId)
              return (
                <Paper
                  key={org.id}
                  className={`orgs-page__glass orgs-page__org-card${active ? ' orgs-page__org-card--active' : ''}`}
                  p="md"
                  radius="lg"
                >
                  <Group justify="space-between" wrap="nowrap" align="flex-start" gap="md">
                    <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }} align="flex-start">
                      <OrgIcon orgId={org.id} />
                      <div style={{ minWidth: 0 }}>
                        <Text fw={700} size="md" lineClamp={2} style={{ color: 'var(--text)' }}>
                          {org.name}
                        </Text>
                        <Text size="xs" mt={4} style={{ color: 'var(--muted)' }}>
                          {org.isOwner ? 'Owner' : org.role === 'admin' ? 'Admin' : 'Member'}
                          {active ? ' · Active' : ''}
                        </Text>
                        <Group gap="lg" mt={10}>
                          <Box>
                            <Text size="xs" tt="uppercase" fw={700} style={{ color: 'var(--muted)' }}>
                              Albums
                            </Text>
                            <Text size="lg" fw={800} lh={1.2} style={{ color: 'var(--text)' }}>
                              {org.albumCount ?? 0}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="xs" tt="uppercase" fw={700} style={{ color: 'var(--muted)' }}>
                              Members
                            </Text>
                            <Text size="lg" fw={800} lh={1.2} style={{ color: 'var(--text)' }}>
                              {org.memberCount ?? 1}
                            </Text>
                          </Box>
                        </Group>
                      </div>
                    </Group>
                    <Stack gap={8} align="flex-end" style={{ flexShrink: 0 }}>
                      {org.isOwner ? (
                        <ActionIcon
                          variant="transparent"
                          radius="md"
                          aria-label="Edit organization"
                          className="gallery-theme-btn--icon"
                          onClick={() => setEditOrg(org)}
                        >
                          <IoCreateOutline size={20} />
                        </ActionIcon>
                      ) : null}
                      <Button
                        size="sm"
                        radius="xl"
                        variant="default"
                        className="gallery-theme-btn--albums"
                        rightSection={<IoArrowForward size={16} />}
                        onClick={() => openOrg(org.id)}
                      >
                        Albums
                      </Button>
                    </Stack>
                  </Group>
                </Paper>
              )
            })
          )}
        </Stack>

        {canCreateOrg ? (
          <Paper className="orgs-page__glass" p="md" radius="lg" component="form" onSubmit={handleCreateOrg}>
            <Text size="sm" fw={700} mb="sm" style={{ color: 'var(--text)' }}>
              Create organization
            </Text>
            <Group align="flex-start" wrap="nowrap" gap="sm">
              <TextInput
                flex={1}
                placeholder="Yogi's Professional Life"
                value={newOrgName}
                onChange={(e) => {
                  setNewOrgName(e.target.value)
                  if (createError) setCreateError('')
                }}
                error={createError}
                maxLength={200}
                classNames={inputClassNames}
              />
              <Button
                type="submit"
                variant="default"
                leftSection={<IoAdd size={18} />}
                className="gallery-theme-btn--primary"
                radius="xl"
                loading={creating}
              >
                Create
              </Button>
            </Group>
          </Paper>
        ) : (
          <Paper className="orgs-page__glass" p="md" radius="lg" component="form" onSubmit={handleRequest}>
            <Text size="sm" fw={700} mb="sm" style={{ color: 'var(--text)' }}>
              Request permission to create organizations
            </Text>
            <Group align="flex-start" wrap="nowrap" gap="sm">
              <TextInput
                flex={1}
                placeholder="Name you’d like for your first org"
                value={requestName}
                onChange={(e) => {
                  setRequestName(e.target.value)
                  setRequestError('')
                  setRequestOk('')
                }}
                error={requestError}
                maxLength={200}
                classNames={inputClassNames}
              />
              <Button
                type="submit"
                variant="default"
                className="gallery-theme-btn--accent3"
                radius="xl"
                loading={requesting}
              >
                Send
              </Button>
            </Group>
            {requestOk ? (
              <Text size="xs" className="gallery-theme-text--accent3" mt="sm">
                {requestOk}
              </Text>
            ) : null}
          </Paper>
        )}
      </Stack>

      <EditOrganizationModal
        org={editOrg}
        opened={Boolean(editOrg)}
        onClose={() => setEditOrg(null)}
        onUpdated={handleOrgUpdated}
        onDeleted={handleOrgDeleted}
      />
    </section>
  )
}
