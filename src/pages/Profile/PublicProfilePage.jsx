import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button, Group, Modal, Stack, Text, Title } from '@mantine/core'
import { IoLockClosed } from 'react-icons/io5'
import { fetchUserProfile } from '../../api/users'
import { AuthedAlbumImage } from '../AlbumPhotos/AuthedAlbumImage'
import './PublicProfilePage.css'

function formatGenderLabel(g) {
  const x = String(g || '')
    .trim()
    .toLowerCase()
  const map = { male: 'Male', female: 'Female', other: 'Other' }
  if (map[x]) return map[x]
  return g ? String(g).trim() : ''
}

export default function PublicProfilePage() {
  const { userId } = useParams()
  const self = useSelector((s) => s.currentUser.profile)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetchUserProfile(userId)
      .then(setProfile)
      .catch((e) => setError(e.message || 'Could not load profile'))
      .finally(() => setLoading(false))
  }, [userId])

  const isSelf = self?.id && userId && String(self.id) === String(userId)

  if (loading) {
    return (
      <div className="public-profile-page">
        <Text c="dimmed">Loading…</Text>
      </div>
    )
  }
  if (error || !profile) {
    return (
      <div className="public-profile-page">
        <Text c="red.4">{error || 'Not found'}</Text>
      </div>
    )
  }

  const locked = profile.lockedProfile && !isSelf
  const canOpenFull = !locked && Boolean(profile.profilePhotoFullPath)
  const genderLabel = formatGenderLabel(profile.gender)

  return (
    <div className="public-profile-page">
      <Stack gap="lg" maw={480} mx="auto" py="xl" px="md">
        {isSelf ? (
          <Button component={Link} to="/settings/profile" variant="light" color="teal" size="xs" w="fit-content">
            Edit profile
          </Button>
        ) : null}
        <Group align="flex-start" gap="md" wrap="nowrap">
          <div style={{ position: 'relative' }}>
            {profile.profilePhotoStreamPath ? (
              <button
                type="button"
                onClick={() => canOpenFull && setLightbox(true)}
                className="public-profile-page__avatar-btn"
                disabled={!canOpenFull}
                aria-label={canOpenFull ? 'View full photo' : 'Profile photo'}
              >
                <AuthedAlbumImage
                  streamPath={profile.profilePhotoStreamPath}
                  alt=""
                  className="public-profile-page__avatar"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </button>
            ) : (
              <div className="public-profile-page__avatar public-profile-page__avatar--empty" />
            )}
            {locked ? (
              <span className="public-profile-page__lock" aria-hidden>
                <IoLockClosed size={18} />
              </span>
            ) : null}
          </div>
          <div style={{ minWidth: 0 }}>
            <Title order={3} c="#fff" lineClamp={2}>
              {profile.username || 'Member'}
            </Title>
            <Text size="sm" c="dimmed">
              {profile.profileVisibility === 'private' ? 'Private profile' : 'Public profile'}
            </Text>
          </div>
        </Group>

        {!locked || isSelf ? (
          <Stack gap="xs">
            {profile.bio ? (
              <Text size="sm" c="rgba(255,255,255,0.85)">
                {profile.bio}
              </Text>
            ) : null}
            {profile.occupation ? (
              <Text size="sm" c="dimmed">
                <Text component="span" fw={600} c="rgba(255,255,255,0.75)">
                  Role
                </Text>{' '}
                {profile.occupation}
              </Text>
            ) : null}
            {profile.location ? (
              <Text size="sm" c="dimmed">
                <Text component="span" fw={600} c="rgba(255,255,255,0.75)">
                  Location
                </Text>{' '}
                {profile.location}
              </Text>
            ) : null}
            {profile.age != null ? (
              <Text size="sm" c="dimmed">
                Age {profile.age}
              </Text>
            ) : null}
            {genderLabel ? (
              <Text size="sm" c="dimmed">
                {genderLabel}
              </Text>
            ) : null}
            {isSelf && profile.email ? (
              <Text size="sm" c="dimmed">
                {profile.email}
              </Text>
            ) : null}
            {isSelf && profile.phone ? (
              <Text size="sm" c="dimmed">
                {profile.phone}
              </Text>
            ) : null}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            This person keeps their profile private. You can still see their name and photo in shared
            albums.
          </Text>
        )}
      </Stack>

      <Modal opened={lightbox} onClose={() => setLightbox(false)} size="lg" centered title="Profile photo">
        {profile.profilePhotoFullPath ? (
          <AuthedAlbumImage
            streamPath={profile.profilePhotoFullPath}
            alt=""
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        ) : null}
      </Modal>
    </div>
  )
}
