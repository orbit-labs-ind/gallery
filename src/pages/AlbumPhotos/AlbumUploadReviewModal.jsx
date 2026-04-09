import { Modal, Button, Text, ScrollArea, ActionIcon } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import './AlbumUploadReviewModal.css'

function formatMb(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0'
  return (bytes / (1024 * 1024)).toFixed(bytes >= 1024 * 1024 ? 1 : 2)
}

export function AlbumUploadReviewModal({
  opened,
  onClose,
  items,
  onRemove,
  onConfirm,
  busy,
  maxUploadBytes,
  clientCompress,
}) {
  const maxLabel = formatMb(maxUploadBytes)
  const hasBlockingError = items.some((it) => it.error)
  const count = items.length

  return (
    <Modal
      opened={opened}
      onClose={busy ? () => {} : onClose}
      title="Review photos"
      size="lg"
      centered
      closeOnClickOutside={!busy}
      closeOnEscape={!busy}
      overlayProps={{ opacity: 0.55, blur: 4 }}
      styles={{
        header: { fontFamily: 'var(--font-body)', color: 'var(--text)' },
        title: { fontWeight: 700, fontSize: '1.1rem' },
        body: { paddingTop: 8 },
        content: {
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        },
      }}
    >
      <Text size="sm" c="dimmed" mb="md">
        Remove anything you picked by mistake, then confirm to upload.
        {clientCompress ? (
          <>
            {' '}
            Images will be compressed on this device before upload (GIFs stay as-is).
          </>
        ) : null}{' '}
        Max size per uploaded file is {maxLabel} MB.
      </Text>

      {count === 0 ? (
        <Text size="sm" c="dimmed" mb="md">
          No photos selected.
        </Text>
      ) : (
        <ScrollArea.Autosize mah={360} offsetScrollbars type="auto">
          <ul className="album-upload-review__grid">
            {items.map((it) => (
              <li key={it.id} className="album-upload-review__tile">
                <div className="album-upload-review__thumb-wrap">
                  <img
                    className="album-upload-review__thumb"
                    src={it.previewUrl}
                    alt=""
                  />
                  <ActionIcon
                    type="button"
                    variant="filled"
                    color="dark"
                    size="sm"
                    radius="xl"
                    className="album-upload-review__remove"
                    aria-label={`Remove ${it.file.name}`}
                    onClick={() => onRemove(it.id)}
                    disabled={busy}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </div>
                <Text size="xs" lineClamp={2} className="album-upload-review__name">
                  {it.file.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatMb(it.file.size)} MB
                </Text>
                {it.error ? (
                  <Text size="xs" c="var(--accent2)" mt={4}>
                    {it.error}
                  </Text>
                ) : null}
              </li>
            ))}
          </ul>
        </ScrollArea.Autosize>
      )}

      <div className="album-upload-review__actions">
        <Button
          variant="default"
          radius="md"
          onClick={onClose}
          disabled={busy}
          styles={{ root: { fontFamily: 'var(--font-body)' } }}
        >
          Cancel
        </Button>
        <Button
          radius="md"
          className="gallery-theme-btn--albums"
          onClick={onConfirm}
          loading={busy}
          disabled={count === 0 || hasBlockingError}
          styles={{ root: { fontFamily: 'var(--font-body)' } }}
        >
          {busy ? 'Uploading…' : `Upload ${count} photo${count === 1 ? '' : 's'}`}
        </Button>
      </div>
    </Modal>
  )
}
