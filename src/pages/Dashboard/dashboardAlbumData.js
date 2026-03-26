export const INITIAL_ALBUM_SECTIONS = [
  {
    id: 'yours',
    title: 'Your albums',
    albums: [
      {
        id: 'yours-1',
        title: 'Family Tour',
        created_at: '01-01-2026',
        updated_at: '01-01-2026',
        tags: ['family', 'tour', 'travel'],
        cover_image:
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=80',
        is_accessible: true,
      },
      {
        id: 'yours-2',
        title: 'Wedding',
        created_at: '01-01-2026',
        updated_at: '01-01-2026',
        tags: ['wedding', 'marriage', 'ceremony'],
        cover_image:
          'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&q=80',
        is_accessible: false,
      },
      {
        id: 'yours-3',
        title: 'Birthday Party',
        created_at: '01-01-2026',
        updated_at: '01-01-2026',
        tags: ['birthday', 'celebration'],
        cover_image:
          'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&q=80',
        is_accessible: true,
      },
      {
        id: 'yours-4',
        title: 'College Trip',
        created_at: '01-01-2026',
        updated_at: '01-01-2026',
        tags: ['college', 'friends', 'trip'],
        cover_image:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80',
        is_accessible: true,
      },
      {
        id: 'yours-5',
        title: 'Nature Camp',
        created_at: '01-01-2026',
        updated_at: '01-01-2026',
        tags: ['nature', 'camp', 'adventure'],
        cover_image:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
        is_accessible: false,
      },
    ],
  },
  {
    id: 'private',
    title: 'Private',
    albums: [
      {
        id: 'priv-1',
        title: 'Family Tour',
        created_at: '01-01-2026',
        updated_at: '01-01-2026',
        tags: ['family', 'tour', 'travel'],
        cover_image:
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=80',
        is_accessible: true,
      },
      {
        id: 'priv-2',
        title: 'Birthday Party',
        created_at: '01-01-2026',
        updated_at: '01-01-2026',
        tags: ['birthday', 'celebration'],
        cover_image:
          'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&q=80',
        is_accessible: true,
      },
      {
        id: 'priv-3',
        title: 'Wedding',
        created_at: '01-01-2026',
        updated_at: '01-01-2026',
        tags: ['wedding', 'marriage', 'ceremony'],
        cover_image:
          'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&q=80',
        is_accessible: false,
      },
      {
        id: 'priv-4',
        title: 'Nature Camp',
        created_at: '01-01-2026',
        updated_at: '01-01-2026',
        tags: ['nature', 'camp', 'adventure'],
        cover_image:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
        is_accessible: false,
      },
      {
        id: 'priv-5',
        title: 'College Trip',
        created_at: '01-01-2026',
        updated_at: '01-01-2026',
        tags: ['college', 'friends', 'trip'],
        cover_image:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80',
        is_accessible: true,
      },
    ],
  },
  {
    id: 'joined',
    title: 'Joined',
    albums: [
      
    ],
  },
]

/** All categories start with no albums — switch provider to INITIAL_ALBUM_SECTIONS for demo data */
export const EMPTY_ALBUM_SECTIONS = INITIAL_ALBUM_SECTIONS.map((s) => ({
  id: s.id,
  title: s.title,
  albums: [],
}))
