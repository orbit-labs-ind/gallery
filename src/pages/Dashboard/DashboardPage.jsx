import React, { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import {
  EffectCoverflow,
  Keyboard,
  Mousewheel,
  Pagination,
  Parallax,
} from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/parallax'
import '../../common/common.css'
import './DashboardPage.css'
import { Box, Button, Stack, Text, Title } from '@mantine/core'
import { IoAdd } from 'react-icons/io5'
import { useAlbumLibrary } from '../../context/AlbumLibraryContext'
import { AlbumSlide } from './AlbumSlide'
import { AlbumCategorySegment } from './AlbumCategorySegment'

const verticalAlbumSwiperProps = {
  modules: [EffectCoverflow, Keyboard, Mousewheel, Pagination, Parallax],
  effect: 'coverflow',
  grabCursor: true,
  centeredSlides: true,
  loop: false,
  direction: 'vertical',
  keyboard: { enabled: true },
  mousewheel: false,
  pagination: false,
  slidesPerView: 'auto',
  spaceBetween: '-22%',
  parallax: true,
  coverflowEffect: {
    rotate: 0,
    stretch: '-38%',
    depth: 140,
    modifier: 1.15,
    slideShadows: true,
    scale: 0.72,
  },
}

const DashboardPage = () => {
  const heroRef = useRef(null)
  const sectionsSwiperRef = useRef(null)
  const [sectionIndex, setSectionIndex] = useState(0)
  const { sections: albumSections, openCreateAlbum } = useAlbumLibrary()

  const goToSection = (index) => {
    setSectionIndex(index)
    sectionsSwiperRef.current?.slideTo(index)
  }

  const isCompletelyEmpty = albumSections.every((s) => s.albums.length === 0)

  if (isCompletelyEmpty) {
    return (
      <section
        className="lp-hero dash-dashboard-hero"
        style={{ alignItems: 'center', padding: '6px', justifyContent: 'center' }}
        ref={heroRef}
      >
        <div className="lp-blob lp-blob-1" aria-hidden />
        <div className="lp-blob lp-blob-2" aria-hidden />
        <div className="lp-blob lp-blob-3" aria-hidden />
        <div className="lp-grid-overlay" aria-hidden />
        <Stack
          align="center"
          justify="center"
          gap="lg"
          py={48}
          px="md"
          maw={480}
          w="100%"
        >
          <Title order={2} ta="center" c="#fff" fw={700}>
            No albums yet
          </Title>
          <Text ta="center" c="rgba(255,255,255,0.65)" size="sm" maw={360}>
            Create an album to start collecting memories. You can set privacy,
            invite members, and add photos after it&apos;s created.
          </Text>
          <Button
            leftSection={<IoAdd size={20} />}
            color="pink"
            size="md"
            radius="xl"
            onClick={openCreateAlbum}
          >
            Create album
          </Button>
        </Stack>
      </section>
    )
  }

  return (
    <section
      className="lp-hero dash-dashboard-hero"
      style={{ alignItems: 'flex-start', padding: '6px', justifyContent: 'center' }}
      ref={heroRef}
    >
      <div className="lp-blob lp-blob-1" aria-hidden />
      <div className="lp-blob lp-blob-2" aria-hidden />
      <div className="lp-blob lp-blob-3" aria-hidden />
      <div className="lp-grid-overlay" aria-hidden />
      <Stack gap="12px" w="100%" maw="480px" h="100%" justify="flex-start" style={{ overflow: 'hidden' }} pt={12}>
        <AlbumCategorySegment
          sections={albumSections}
          activeIndex={sectionIndex}
          onSelect={goToSection}
        />
        <Box className="albums-container">
          <Swiper
            className="dash-sections-swiper"
            modules={[Keyboard]}
            direction="horizontal"
            slidesPerView={1.14}
            centeredSlides
            spaceBetween={10}
            speed={380}
            keyboard={{ enabled: true }}
            onSlideChange={(swiper) => setSectionIndex(swiper.activeIndex)}
            onSwiper={(swiper) => {
              sectionsSwiperRef.current = swiper
              setSectionIndex(swiper.activeIndex)
            }}
          >
            {albumSections.map((section) => (
              <SwiperSlide key={section.id}>
                <div className="dash-section-slide-inner">
                  {section.albums.length === 0 ? (
                    <Box className="dash-section-empty" p="xl">
                      <Text ta="center" c="rgba(255,255,255,0.7)" size="sm" mb="md">
                        No albums in {section.title.toLowerCase()} yet.
                      </Text>
                      <Button
                        variant="light"
                        color="pink"
                        fullWidth
                        leftSection={<IoAdd size={18} />}
                        onClick={openCreateAlbum}
                      >
                        Create album
                      </Button>
                    </Box>
                  ) : (
                    <div className="dash-expo-perspective">
                      <div className="dash-expo-stage">
                        <Swiper
                          className="dash-expo-swiper dash-expo-swiper--vertical"
                          nested
                          {...verticalAlbumSwiperProps}
                        >
                          {section.albums.map((album) => (
                            <SwiperSlide key={album.id}>
                              <AlbumSlide album={album} />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Stack>
    </section>
  )
}

export default DashboardPage
