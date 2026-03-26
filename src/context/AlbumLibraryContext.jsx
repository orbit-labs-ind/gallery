import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { CreateAlbumDrawer } from '../pages/Dashboard/CreateAlbumDrawer'
import { INITIAL_ALBUM_SECTIONS } from '../pages/Dashboard/dashboardAlbumData'

const AlbumLibraryContext = createContext(null)

function cloneSections(source) {
  return typeof structuredClone === 'function'
    ? structuredClone(source)
    : JSON.parse(JSON.stringify(source))
}

export function AlbumLibraryProvider({ children }) {
  const [sections, setSections] = useState(() => cloneSections(INITIAL_ALBUM_SECTIONS))
  const [createOpened, setCreateOpened] = useState(false)

  const openCreateAlbum = useCallback(() => setCreateOpened(true), [])
  const closeCreateAlbum = useCallback(() => setCreateOpened(false), [])

  const addAlbumToYours = useCallback((album) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === 'yours' ? { ...s, albums: [album, ...s.albums] } : s
      )
    )
  }, [])

  const handleCreated = useCallback(
    (album) => {
      addAlbumToYours(album)
      closeCreateAlbum()
    },
    [addAlbumToYours, closeCreateAlbum]
  )

  const value = useMemo(
    () => ({
      sections,
      setSections,
      openCreateAlbum,
      closeCreateAlbum,
      createOpened,
    }),
    [sections, openCreateAlbum, closeCreateAlbum, createOpened]
  )

  return (
    <AlbumLibraryContext.Provider value={value}>
      {children}
      <CreateAlbumDrawer
        opened={createOpened}
        onClose={closeCreateAlbum}
        onCreated={handleCreated}
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

/** Same context as useAlbumLibrary, but returns null when Header (etc.) renders outside AlbumLibraryProvider — e.g. LandingLayout. */
export function useAlbumLibraryOptional() {
  return useContext(AlbumLibraryContext)
}
