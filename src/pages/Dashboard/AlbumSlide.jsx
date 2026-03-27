import React from 'react'
import { motion as Motion } from 'framer-motion'
import { useSwiperSlide } from 'swiper/react'
import { ActionIcon, Group, Text } from '@mantine/core'
import { IoSettingsOutline } from 'react-icons/io5'
import './AlbumSlide.css'

export function AlbumSlide({
  album,
  orientation = 'vertical',
  showSettings = false,
  onOpenSettings,
}) {
  const { isActive } = useSwiperSlide()
  const isHorizontal = orientation === 'horizontal'

  const parallaxProps = isHorizontal
    ? {
        'data-swiper-parallax-x': '50%',
        'data-swiper-parallax-scale': '1.8',
        'data-swiper-parallax-duration': '300',
      }
    : {
        'data-swiper-parallax-y': '50%',
        'data-swiper-parallax-scale': '1.8',
        'data-swiper-parallax-duration': '300',
      }

  const members = album.memberCount ?? 0
  const photos = album.photoCount ?? 0

  return (
    <div
      className={`dash-slide${isHorizontal ? ' dash-slide--horizontal' : ''}`}
    >
      <div
        className={`dash-slide-img-wrap${isHorizontal ? ' dash-slide-img-wrap--horizontal' : ''}`}
        {...parallaxProps}
      >
        <img src={album.cover_image} alt={album.title} loading="lazy" />
      </div>

      <div className="dash-slide-scrim" aria-hidden />

      {!album.is_accessible && (
        <span className="dash-slide-lock">Private</span>
      )}

      {showSettings ? (
        <div className="dash-slide-settings">
          <ActionIcon
            variant="filled"
            size="md"
            radius="xl"
            aria-label="Album settings"
            className="dash-slide-settings__btn"
            onClick={(e) => {
              e.stopPropagation()
              onOpenSettings?.(album)
            }}
          >
            <IoSettingsOutline size={20} />
          </ActionIcon>
        </div>
      ) : null}

      <Motion.div
        className="dash-slide-caption"
        initial={false}
        animate={{ opacity: isActive ? 1 : 0.4, y: isActive ? 0 : 3 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2>{album.title}</h2>
        <Group gap="md" wrap="wrap" className="dash-slide-stats">
          <Text component="span" size="xs" className="dash-slide-stat">
            {members} member{members === 1 ? '' : 's'}
          </Text>
          <Text component="span" size="xs" className="dash-slide-stat">
            {photos} photo{photos === 1 ? '' : 's'}
          </Text>
        </Group>
        <p className="dash-slide-meta">Updated {album.updated_at}</p>
      </Motion.div>
    </div>
  )
}
