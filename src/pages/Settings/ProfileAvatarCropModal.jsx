import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { Button, Group, Modal, Slider, Stack, Text } from '@mantine/core'
import { getCroppedImageBlob } from '../../utils/cropImage'
import './ProfileAvatarCropModal.css'

export function ProfileAvatarCropModal({ opened, file, onClose, onComplete }) {
  const [imageSrc, setImageSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [cropError, setCropError] = useState('')
  const [cropReady, setCropReady] = useState(false)
  const croppedPixelsRef = useRef(null)

  useEffect(() => {
    if (!opened || !file) {
      setImageSrc('')
      setCropReady(false)
      return undefined
    }
    const url = URL.createObjectURL(file)
    setImageSrc(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCropReady(false)
    setCropError('')
    croppedPixelsRef.current = null
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [opened, file])

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    croppedPixelsRef.current = croppedAreaPixels
    setCropReady(true)
  }, [])

  const handleSave = async () => {
    const pixels = croppedPixelsRef.current
    if (!pixels || !imageSrc) return
    setExporting(true)
    setCropError('')
    try {
      const blob = await getCroppedImageBlob(imageSrc, pixels)
      const out = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' })
      await onComplete(out)
      onClose()
    } catch (e) {
      setCropError(e?.message || 'Could not process image')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal
      opened={opened && Boolean(file)}
      onClose={onClose}
      title="Crop profile photo"
      size="lg"
      centered
      styles={{
        title: { color: '#fff', fontWeight: 700 },
        content: {
          background: 'rgba(18, 18, 28, 0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
        },
        header: { background: 'transparent' },
        body: { paddingTop: 8 },
      }}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Drag to position, use the slider to zoom. The{' '}
          <Text component="span" c="teal.3" fw={600}>
            circle
          </Text>{' '}
          is exactly how your photo appears in comments, the header, and member lists. Corners of the
          square (dimmed area) are included in the file and can show when someone opens your picture
          full screen on your profile.
        </Text>

        <div className="profile-avatar-crop-modal__legend" aria-hidden>
          <div className="profile-avatar-crop-modal__legend-item">
            <span className="profile-avatar-crop-modal__swatch" />
            <span>Avatar &amp; lists (circular crop)</span>
          </div>
          <div className="profile-avatar-crop-modal__legend-item">
            <span className="profile-avatar-crop-modal__swatch profile-avatar-crop-modal__swatch--dim" />
            <span>Extra framing for full-screen view</span>
          </div>
        </div>

        {imageSrc ? (
          <div className="profile-avatar-crop-modal__stage">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={0}
              aspect={1}
              cropShape="round"
              showGrid={false}
              restrictPosition
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                },
                cropAreaStyle: {
                  border: '3px solid rgba(45, 212, 191, 0.95)',
                  boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.72)',
                },
              }}
            />
          </div>
        ) : null}

        <div className="profile-avatar-crop-modal__zoom">
          <Text size="xs" c="dimmed" mb={6}>
            Zoom
          </Text>
          <Slider
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={setZoom}
            color="teal"
            styles={{ track: { background: 'rgba(255,255,255,0.15)' } }}
          />
        </div>

        {cropError ? (
          <Text size="sm" c="red.4">
            {cropError}
          </Text>
        ) : null}

        <Group justify="flex-end" gap="sm" mt="sm">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button
            color="teal"
            loading={exporting}
            onClick={handleSave}
            disabled={!imageSrc || !cropReady}
          >
            Use this crop
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
