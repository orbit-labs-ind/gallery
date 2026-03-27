import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useSelector } from 'react-redux'
import {
  CURRENT_ORG_KEY,
  isDevForceAuthEnabled,
} from '../store/slices/authSlice'
import { CreateAlbumDrawer } from '../pages/Dashboard/CreateAlbumDrawer'
import {
  listOrganizations,
  fetchAlbumsForOrg,
  createAlbum as createAlbumApi,
} from '../api/organizations'

const AlbumLibraryContext = createContext(null)

/** id `joined` → no create-album affordances */
export const SECTION_DEF = [
  { id: 'myPublic', title: 'My public', accent: 'coral' },
  { id: 'myPrivate', title: 'My private', accent: 'violet' },
  { id: 'orgPublic', title: 'Org library', accent: 'teal' },
  { id: 'joined', title: 'Joined', accent: 'amber' },
]

function emptySections() {
  return SECTION_DEF.map((s) => ({ ...s, albums: [] }))
}

export function AlbumLibraryProvider({ children }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const isDevForce = isDevForceAuthEnabled()

  const [currentOrgId, setCurrentOrgIdState] = useState(() => {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(CURRENT_ORG_KEY)
  })
  const [organizations, setOrganizations] = useState([])
  const [sections, setSections] = useState(emptySections)
  const [canCreateAlbum, setCanCreateAlbum] = useState(false)
  const [albumsLoading, setAlbumsLoading] = useState(false)
  const [createOpened, setCreateOpened] = useState(false)
  const [activeAlbumSegmentId, setActiveAlbumSegmentId] = useState(
    SECTION_DEF[0].id
  )

  const setCurrentOrgId = useCallback((id) => {
    if (typeof localStorage !== 'undefined') {
      if (id) localStorage.setItem(CURRENT_ORG_KEY, String(id))
      else localStorage.removeItem(CURRENT_ORG_KEY)
    }
    setCurrentOrgIdState(id ? String(id) : null)
  }, [])

  const currentOrgName = useMemo(() => {
    if (!currentOrgId) return null
    const o = organizations.find((x) => String(x.id) === String(currentOrgId))
    return o?.name || null
  }, [organizations, currentOrgId])

  const refreshOrganizations = useCallback(async () => {
    if (!isAuthenticated || isDevForce) {
      setOrganizations([])
      return
    }
    try {
      const orgs = await listOrganizations()
      setOrganizations(orgs)
    } catch {
      setOrganizations([])
    }
  }, [isAuthenticated, isDevForce])

  const refreshAlbums = useCallback(async () => {
    if (!currentOrgId || !isAuthenticated || isDevForce) {
      setSections(emptySections())
      setCanCreateAlbum(false)
      return
    }
    setAlbumsLoading(true)
    try {
      const data = await fetchAlbumsForOrg(currentOrgId)
      setCanCreateAlbum(Boolean(data.canCreateAlbum))
      setSections([
        {
          id: 'myPublic',
          title: 'My public',
          accent: 'coral',
          albums: data.myPublic || [],
        },
        {
          id: 'myPrivate',
          title: 'My private',
          accent: 'violet',
          albums: data.myPrivate || [],
        },
        {
          id: 'orgPublic',
          title: 'Org library',
          accent: 'teal',
          albums: data.orgPublic || [],
        },
        {
          id: 'joined',
          title: 'Joined',
          accent: 'amber',
          albums: data.joined || [],
        },
      ])
    } catch (e) {
      const msg = String(e?.message || '').toLowerCase()
      setSections(emptySections())
      setCanCreateAlbum(false)
      if (msg.includes('not found')) {
        setCurrentOrgId(null)
      }
    } finally {
      setAlbumsLoading(false)
    }
  }, [currentOrgId, isAuthenticated, isDevForce, setCurrentOrgId])

  useEffect(() => {
    refreshOrganizations()
  }, [refreshOrganizations])

  useEffect(() => {
    refreshAlbums()
  }, [refreshAlbums])

  const openCreateAlbum = useCallback(() => setCreateOpened(true), [])
  const closeCreateAlbum = useCallback(() => setCreateOpened(false), [])

  const createAlbumFromDrawer = useCallback(
    async ({ name, isPublic, description, members }) => {
      if (!currentOrgId) {
        throw new Error('Select an organization first')
      }
      const memberIds = (members || [])
        .map((m) => m.id)
        .filter((id) => id && /^[a-f\d]{24}$/i.test(String(id)))
      await createAlbumApi(currentOrgId, {
        title: name.trim(),
        description: description || '',
        visibility: isPublic ? 'public' : 'private',
        memberIds,
      })
      await refreshAlbums()
    },
    [currentOrgId, refreshAlbums]
  )

  const value = useMemo(
    () => ({
      currentOrgId,
      currentOrgName,
      setCurrentOrgId,
      organizations,
      refreshOrganizations,
      sections,
      setSections,
      canCreateAlbum,
      albumsLoading,
      openCreateAlbum,
      closeCreateAlbum,
      createOpened,
      createAlbumFromDrawer,
      refreshAlbums,
      activeAlbumSegmentId,
      setActiveAlbumSegmentId,
    }),
    [
      currentOrgId,
      currentOrgName,
      setCurrentOrgId,
      organizations,
      refreshOrganizations,
      sections,
      canCreateAlbum,
      albumsLoading,
      openCreateAlbum,
      closeCreateAlbum,
      createOpened,
      createAlbumFromDrawer,
      refreshAlbums,
      activeAlbumSegmentId,
    ]
  )

  return (
    <AlbumLibraryContext.Provider value={value}>
      {children}
      <CreateAlbumDrawer
        opened={createOpened}
        onClose={closeCreateAlbum}
        onCreateAlbum={createAlbumFromDrawer}
      />
    </AlbumLibraryContext.Provider>
  )
}

export function useAlbumLibrary() {
  const ctx = useContext(AlbumLibraryContext)
  if (!ctx) {
    throw new Error('useAlbumLibrary must be used within AlbumLibraryProvider')
  }
  return ctx
}

export function useAlbumLibraryOptional() {
  return useContext(AlbumLibraryContext)
}
