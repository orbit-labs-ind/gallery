import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Button,
  FileInput,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core'
import {
  IconGenderBigender,
  IconGenderFemale,
  IconGenderMale,
  IconMinus,
} from '@tabler/icons-react'
import { patchMyProfile, uploadMyAvatar } from '../../api/users'
import { setProfile } from '../../store/slices/currentUserSlice'
import { AuthedAlbumImage } from '../AlbumPhotos/AuthedAlbumImage'
import { ProfileAvatarCropModal } from './ProfileAvatarCropModal'
import { FcBusinessman } from "react-icons/fc";
import { FcBusinesswoman } from "react-icons/fc";

const USERNAME_RE = /^[a-z0-9_]{3,32}$/

/** Raised field surface on dark settings paper — not black, reads clearly when focused */
const settingsFieldStyles = {
  label: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    color: 'rgba(255, 255, 255, 0.94)',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.38)',
    },
  },
}

const settingsFileInputStyles = {
  label: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    color: 'rgba(255, 255, 255, 0.9)',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.38)',
    },
  },
}

const phoneInputStyles = {
  ...settingsFieldStyles,
  section: {
    color: 'rgba(255, 255, 255, 0.55)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
    marginRight: 0,
  },
}

/** Same surface language as text fields; active pill is teal-tinted, not bright gray/white */
const settingsVisibilitySegmentedStyles = {
  root: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
  },
  indicator: {
    backgroundColor: 'rgba(45, 212, 191, 0.2)',
    boxShadow: 'inset 0 0 0 1px rgba(45, 212, 191, 0.35)',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.5)',
    '&[data-active]': {
      color: 'rgba(255, 255, 255, 0.95)',
      fontWeight: 600,
    },
  },
}

const genderIconProps = { size: 18, stroke: 1.75 }

const genderSegmentData = [
  {
    value: 'unspecified',
    label: (
      <span title="Prefer not to say">
        <IconMinus {...genderIconProps} aria-hidden />
      </span>
    ),
  },
  {
    value: 'male',
    label: (
      <span title="Male">
        <FcBusinessman {...genderIconProps} aria-hidden />
      </span>
    ),
  },
  {
    value: 'female',
    label: (
      <span title="Female">
        <FcBusinesswoman {...genderIconProps} aria-hidden />
      </span>
    ),
  },
  {
    value: 'other',
    label: (
      <span title="Other">
        <IconGenderBigender {...genderIconProps} aria-hidden />
      </span>
    ),
  },
]

function genderFromApi(raw) {
  const x = String(raw || '')
    .trim()
    .toLowerCase()
  if (['male', 'female', 'other'].includes(x)) return x
  if (['m', 'man'].includes(x)) return 'male'
  if (['f', 'woman'].includes(x)) return 'female'
  return 'unspecified'
}

function genderToApi(ui) {
  return ui === 'unspecified' ? '' : ui
}

function usernameClientError(raw) {
  const t = raw.trim().toLowerCase()
  if (!t) return ''
  if (/\s/.test(raw)) {
    return 'Username cannot contain spaces.'
  }
  if (!USERNAME_RE.test(t)) {
    return 'Use 3–32 characters: lowercase letters, numbers, and underscores only.'
  }
  return ''
}

function applySavedProfile(saved, setters) {
  const {
    setUsername,
    setProfileVisibility,
    setBio,
    setOccupation,
    setLocationArea1,
    setLocationArea2,
    setLocationCity,
    setLocationPinCode,
    setAge,
    setGenderUi,
    setPhoneDigits,
  } = setters

  setUsername(saved.username || '')
  setProfileVisibility(saved.profileVisibility === 'public' ? 'public' : 'private')
  setBio(saved.bio || '')
  setOccupation(saved.occupation || '')
  const a1 = saved.locationArea1 || ''
  const a2 = saved.locationArea2 || ''
  const city = saved.locationCity || ''
  const pin = saved.locationPinCode || ''
  const legacy = (saved.location || '').trim()
  if (!a1 && !a2 && !city && !pin && legacy) {
    setLocationArea1('')
    setLocationArea2('')
    setLocationCity(legacy)
    setLocationPinCode('')
  } else {
    setLocationArea1(a1)
    setLocationArea2(a2)
    setLocationCity(city)
    setLocationPinCode(pin)
  }
  setAge(saved.age != null ? String(saved.age) : '')
  setGenderUi(genderFromApi(saved.gender))
  setPhoneDigits(String(saved.phone || '').replace(/\D/g, '').slice(0, 15))
}

export default function ProfileSettingsPage() {
  const dispatch = useDispatch()
  const saved = useSelector((s) => s.currentUser.profile)
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [profileVisibility, setProfileVisibility] = useState('private')
  const [bio, setBio] = useState('')
  const [occupation, setOccupation] = useState('')
  const [locationArea1, setLocationArea1] = useState('')
  const [locationArea2, setLocationArea2] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [locationPinCode, setLocationPinCode] = useState('')
  const [age, setAge] = useState('')
  const [genderUi, setGenderUi] = useState('unspecified')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [avatarPick, setAvatarPick] = useState(null)
  const [cropOpen, setCropOpen] = useState(false)

  useEffect(() => {
    if (!saved) return
    applySavedProfile(saved, {
      setUsername,
      setProfileVisibility,
      setBio,
      setOccupation,
      setLocationArea1,
      setLocationArea2,
      setLocationCity,
      setLocationPinCode,
      setAge,
      setGenderUi,
      setPhoneDigits,
    })
    setUsernameError('')
  }, [saved])

  const onUsernameChange = (e) => {
    const v = e.target.value
    setUsername(v)
    setUsernameError(usernameClientError(v))
  }

  const resetForm = () => {
    if (!saved) return
    setError('')
    setOk('')
    applySavedProfile(saved, {
      setUsername,
      setProfileVisibility,
      setBio,
      setOccupation,
      setLocationArea1,
      setLocationArea2,
      setLocationCity,
      setLocationPinCode,
      setAge,
      setGenderUi,
      setPhoneDigits,
    })
    setUsernameError(usernameClientError(saved.username || ''))
  }

  const onSave = async (e) => {
    e.preventDefault()
    setError('')
    setOk('')
    const uErr = usernameClientError(username)
    setUsernameError(uErr)
    if (uErr) return

    setSaving(true)
    try {
      const user = await patchMyProfile({
        username: username.trim().toLowerCase() || null,
        profileVisibility,
        bio,
        occupation,
        locationArea1,
        locationArea2,
        locationCity,
        locationPinCode,
        gender: genderToApi(genderUi),
        phone: phoneDigits,
        age: age === '' ? null : Number(age),
      })
      dispatch(setProfile(user))
      setOk('Saved')
    } catch (err) {
      setError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const onAvatarFileChosen = (file) => {
    if (!file) return
    setError('')
    setOk('')
    setAvatarPick(file)
    setCropOpen(true)
  }

  const onAvatarCropComplete = async (file) => {
    setError('')
    setOk('')
    setUploading(true)
    try {
      const user = await uploadMyAvatar(file)
      dispatch(setProfile(user))
      setOk('Photo updated')
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      setAvatarPick(null)
    }
  }

  const closeCropModal = () => {
    setCropOpen(false)
    setAvatarPick(null)
  }

  const onPhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 15)
    setPhoneDigits(digits)
  }

  const onPinChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 12)
    setLocationPinCode(digits)
  }

  const onAgeChange = (e) => {
    const v = e.target.value
    if (v === '') {
      setAge('')
      return
    }
    const n = Number(v)
    if (!Number.isFinite(n)) return
    if (n < 0 || n > 150) return
    setAge(String(Math.floor(n)))
  }

  return (
    <Stack gap="lg">
      <div>
        <Text fw={600} c="#fff" mb={4}>
          Profile photo
        </Text>
        <Text size="sm" c="dimmed" mb="sm">
          Shown next to your comments and in member lists.
        </Text>
        <Stack gap="sm" align="flex-start">
          {saved?.profilePhotoStreamPath ? (
            <AuthedAlbumImage
              streamPath={saved.profilePhotoStreamPath}
              alt=""
              className="settings-profile-avatar"
              style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="settings-profile-avatar settings-profile-avatar--placeholder"
              style={{ width: 96, height: 96, borderRadius: '50%' }}
            />
          )}
          <FileInput
            accept="image/png,image/jpeg,image/webp,image/gif"
            placeholder="Choose image to crop…"
            onChange={onAvatarFileChosen}
            disabled={uploading || cropOpen}
            styles={settingsFileInputStyles}
          />
        </Stack>
      </div>

      <ProfileAvatarCropModal
        opened={cropOpen}
        file={avatarPick}
        onClose={closeCropModal}
        onComplete={onAvatarCropComplete}
      />

      <form onSubmit={onSave}>
        <Stack gap="md">
          <TextInput
            label="Username"
            description="3–32 characters: lowercase letters, numbers, underscores. No spaces. Must be unique."
            value={username}
            onChange={onUsernameChange}
            error={usernameError || undefined}
            styles={settingsFieldStyles}
          />
          <div>
            <Text size="sm" fw={500} c="rgba(255,255,255,0.9)" mb={6}>
              Profile visibility
            </Text>
            <SegmentedControl
              value={profileVisibility}
              onChange={setProfileVisibility}
              data={[
                { label: 'Private', value: 'private' },
                { label: 'Public', value: 'public' },
              ]}
              fullWidth
              color="teal"
              withItemsBorders={false}
              styles={settingsVisibilitySegmentedStyles}
            />
            <Text size="xs" c="dimmed" mt={6}>
              Private: only your username and a small photo appear on your profile page to people
              outside your albums. Public: teammates who open your profile can see details you add
              below and open your photo full screen.
            </Text>
          </div>
          <Textarea
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            minRows={3}
            styles={settingsFieldStyles}
          />
          <TextInput
            label="Occupation"
            description="What you do for work or business — job title, field (e.g. engineering, design), freelance, student, etc. Helps coworkers find you in your organization directory."
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            styles={settingsFieldStyles}
          />
          <div>
            <Text size="sm" fw={500} c="rgba(255,255,255,0.9)" mb={6}>
              Location
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <TextInput
                label="Area 1"
                value={locationArea1}
                onChange={(e) => setLocationArea1(e.target.value)}
                styles={settingsFieldStyles}
              />
              <TextInput
                label="Area 2"
                value={locationArea2}
                onChange={(e) => setLocationArea2(e.target.value)}
                styles={settingsFieldStyles}
              />
              <TextInput
                label="City"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                styles={settingsFieldStyles}
              />
              <TextInput
                label="Pin code"
                value={locationPinCode}
                onChange={onPinChange}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                styles={settingsFieldStyles}
              />
            </SimpleGrid>
          </div>
          <Group grow align="flex-start" gap="md" wrap="nowrap">
            <TextInput
              label="Age"
              type="number"
              inputMode="numeric"
              min={0}
              max={150}
              value={age}
              onChange={onAgeChange}
              styles={settingsFieldStyles}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <Text size="sm" fw={500} c="rgba(255,255,255,0.9)" mb={6}>
                Gender
              </Text>
              <SegmentedControl
                value={genderUi}
                onChange={setGenderUi}
                data={genderSegmentData}
                fullWidth
                color="teal"
                withItemsBorders={false}
                styles={settingsVisibilitySegmentedStyles}
              />
            </div>
          </Group>
          <TextInput
            label="Phone"
            description="Indian mobile number (digits only). Country code +91 is fixed."
            value={phoneDigits}
            onChange={onPhoneChange}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            leftSection={<Text size="sm" c="rgba(255,255,255,0.55)">+91</Text>}
            leftSectionWidth={48}
            leftSectionPointerEvents="none"
            styles={phoneInputStyles}
          />
          {error ? (
            <Text size="sm" c="red.4">
              {error}
            </Text>
          ) : null}
          {ok ? (
            <Text size="sm" c="teal.4">
              {ok}
            </Text>
          ) : null}
          <Group grow gap="sm">
            <Button type="submit" loading={saving} color="teal">
              Save
            </Button>
            <Button type="button" variant="default" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  )
}
