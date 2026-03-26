import React from 'react'
import { motion as Motion } from 'framer-motion'
import { useSwiperSlide } from 'swiper/react'
import './AlbumSlide.css'

export function AlbumSlide({ album, orientation = 'vertical' }) {
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

      <Motion.div
        className="dash-slide-caption"
        initial={false}
        animate={{ opacity: isActive ? 1 : 0.4, y: isActive ? 0 : 3 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2>{album.title}</h2>
        <p className="dash-slide-meta">Updated {album.updated_at}</p>
      </Motion.div>
    </div>
  )
}
