import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { Alert, Box, Button, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { useSelector } from 'react-redux'
import { IoAdd, IoChevronForward } from 'react-icons/io5'
import {
  useAlbumLibrary,
  ALBUM_SEGMENTS_WITHOUT_CREATE,
} from '../../context/AlbumLibraryContext'
import { isDevForceAuthEnabled } from '../../store/slices/authSlice'
import { fetchCurrentUser } from '../../api/session'
import { AlbumSlide } from './AlbumSlide'
import { AlbumCategorySegment } from './AlbumCategorySegment'
import { AlbumSettingsModal } from './AlbumSettingsModal'

const PROFILE_NUDGE_LS = 'gallery_profile_nudge_dismissed_v1'

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
  const [userId, setUserId] = useState(null)
  const [settingsAlbum, setSettingsAlbum] = useState(null)
  const navigate = useNavigate()
  const profile = useSelector((s) => s.currentUser.profile)
  const [profileNudgeHidden, setProfileNudgeHidden] = useState(() => {
    try {
      return localStorage.getItem(PROFILE_NUDGE_LS) === '1'
    } catch {
      return false
    }
  })
  const showProfileNudge = Boolean(
    profile?.needsProfileSetup && !profileNudgeHidden
  )

  const {
    sections: albumSections,
    openCreateAlbum,
    canCreateAlbum,
    currentOrgId,
    currentOrgName,
    albumsLoading,
    setActiveAlbumSegmentId,
    refreshAlbums,
    organizations,
  } = useAlbumLibrary()

  const currentOrgRow = organizations?.find(
    (o) => String(o.id) === String(currentOrgId)
  )
  const isCurrentOrgOwner = Boolean(currentOrgRow?.isOwner)
  const canManageAlbumsInOrg = Boolean(currentOrgRow?.myCaps?.canManageAlbums)

  useEffect(() => {
    if (isDevForceAuthEnabled()) return
    fetchCurrentUser()
      .then((d) => setUserId(d.user?.id || null))
      .catch(() => setUserId(null))
  }, [])

  useEffect(() => {
    if (isDevForceAuthEnabled()) return
    if (!currentOrgId) {
      navigate('/organizations', { replace: true })
    }
  }, [currentOrgId, navigate])

  useEffect(() => {
    const id = albumSections[sectionIndex]?.id
    if (id) setActiveAlbumSegmentId(id)
  }, [sectionIndex, albumSections, setActiveAlbumSegmentId])

  const goToSection = (index) => {
    setSectionIndex(index)
    sectionsSwiperRef.current?.slideTo(index)
  }

  const isCompletelyEmpty = albumSections.every((s) => s.albums.length === 0)

  if (!isDevForceAuthEnabled() && !currentOrgId) {
    return null
  }

  if (albumsLoading && isCompletelyEmpty) {
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
        <Text c="rgba(255,255,255,0.65)" size="sm">
          Loading albums…
        </Text>
      </section>
    )
  }

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
          {currentOrgName ? (
            <Paper className="dash-org-chip dash-org-chip--solo" p="sm" radius="md" withBorder>
              <Text size="sm" c="rgba(255,255,255,0.85)" ta="center" fw={600}>
                {currentOrgName}
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                Current organization
              </Text>
            </Paper>
          ) : null}
          <Title order={2} ta="center" c="#fff" fw={700}>
            No albums yet
          </Title>
          <Text ta="center" c="rgba(255,255,255,0.65)" size="sm" maw={360}>
            Create an album to start collecting memories. You can set privacy,
            invite members, and add photos after it&apos;s created.
          </Text>
          {canCreateAlbum ? (
            <Button
              leftSection={<IoAdd size={20} />}
              color="teal"
              size="md"
              radius="xl"
              onClick={openCreateAlbum}
            >
              Create album
            </Button>
          ) : (
            <Text size="sm" c="rgba(255,255,255,0.55)" ta="center">
              You don&apos;t have permission to create albums in this organization.
            </Text>
          )}
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
        <Paper
          component={Link}
          to="/organizations"
          className="dash-org-chip"
          p="sm"
          radius="md"
          withBorder
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          <Group justify="space-between" wrap="nowrap" gap="sm">
            <div style={{ minWidth: 0 }}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.06em' }}>
                Organization
              </Text>
              <Text size="sm" c="#fff" fw={700} lineClamp={1}>
                {currentOrgName || 'Select organization'}
              </Text>
            </div>
            <IoChevronForward size={18} color="rgba(165,243,252,0.85)" />
          </Group>
        </Paper>

        {showProfileNudge ? (
          <Alert
            color="teal"
            title="Finish your profile"
            withCloseButton
            onClose={() => {
              try {
                localStorage.setItem(PROFILE_NUDGE_LS, '1')
              } catch {
                /* ignore */
              }
              setProfileNudgeHidden(true)
            }}
            styles={{
              root: { background: 'rgba(45, 212, 191, 0.12)', borderColor: 'rgba(45, 212, 191, 0.35)' },
              title: { color: '#ecfeff' },
              message: { color: 'rgba(255,255,255,0.85)' },
            }}
          >
            <Text size="sm" c="rgba(255,255,255,0.88)">
              Add a username and optional details so people in your organization directory can spot
              you—especially if you share a name with someone else.
            </Text>
            <Button
              component={Link}
              to="/settings/profile"
              size="xs"
              mt="sm"
              color="teal"
              variant="light"
            >
              Open profile settings
            </Button>
          </Alert>
        ) : null}

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
                      {canCreateAlbum &&
                      !ALBUM_SEGMENTS_WITHOUT_CREATE.has(section.id) ? (
                        <Button
                          variant="light"
                          color="teal"
                          fullWidth
                          leftSection={<IoAdd size={18} />}
                          onClick={openCreateAlbum}
                        >
                          Create album
                        </Button>
                      ) : section.id === 'joined' ? (
                        <Text size="xs" ta="center" c="dimmed">
                          Albums others share with you appear here.
                        </Text>
                      ) : section.id === 'orgPrivateAsOwner' ? (
                        <Text size="xs" ta="center" c="dimmed">
                          Private albums in this org you can open as organization
                          owner.
                        </Text>
                      ) : null}
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
                              <AlbumSlide
                                album={album}
                                showSettings={
                                  Boolean(
                                    userId &&
                                      (String(album.ownerId) ===
                                        String(userId) ||
                                        isCurrentOrgOwner ||
                                        canManageAlbumsInOrg)
                                  )
                                }
                                onOpenSettings={setSettingsAlbum}
                                onOpenAlbum={(a) =>
                                  navigate(
                                    `/organizations/${currentOrgId}/albums/${a.id}`,
                                    { state: { album: a } }
                                  )
                                }
                              />
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

      <AlbumSettingsModal
        orgId={currentOrgId}
        album={settingsAlbum}
        opened={Boolean(settingsAlbum)}
        onClose={() => setSettingsAlbum(null)}
        onSaved={() => refreshAlbums()}
        canManageAlbumMembers={Boolean(
          userId &&
            settingsAlbum &&
            (String(settingsAlbum.ownerId) === String(userId) ||
              isCurrentOrgOwner ||
              canManageAlbumsInOrg)
        )}
        canApproveJoinRequests={Boolean(
          userId &&
            settingsAlbum &&
            (String(settingsAlbum.ownerId) === String(userId) ||
              isCurrentOrgOwner ||
              Boolean(currentOrgRow?.myCaps?.canApproveAlbumRequests))
        )}
        canEditAlbum={Boolean(
          userId &&
            settingsAlbum &&
            (String(settingsAlbum.ownerId) === String(userId) ||
              isCurrentOrgOwner ||
              (Array.isArray(settingsAlbum.coOwnerIds) &&
                settingsAlbum.coOwnerIds.some(
                  (id) => String(id) === String(userId)
                )))
        )}
      />
    </section>
  )
}

export default DashboardPage
