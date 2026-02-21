/** spreadFrom = tight center cluster at start; spreadTo = entire screen (viewport %) at 90% scroll */
export const HERO_PHOTOS = [
  { id: 3, imgSrc: `/hero_img/camping.jpg`, label: 'Camping ⛺', rotate: '-3deg', z: 30, translateY: 0, translateX: 0, spreadFrom: { left: 50, top: 50 }, spreadTo: { left: 4, top: 88 }, spreadToMobile: { left: 4, top: 88 } },
  { id: 1, imgSrc: `/hero_img/beach.jpg`, label: 'Beach Day 🌊', rotate: '-8deg', z: 20, translateY: -5, translateX: -5, spreadFrom: { left: 50, top: 50 }, spreadTo: { left: 6, top: 8 }, spreadToMobile: { left: 6, top: 8 } },
  { id: 2, imgSrc: `/hero_img/road.jpg`, label: 'Road Trip 🚗', rotate: '5deg', z: 10, translateY: -5, translateX: 5, spreadFrom: { left: 50, top: 50 }, spreadTo: { left: 94, top: 6 }, spreadToMobile: { left: 94, top: 6 } },
  { id: 4, imgSrc: `/hero_img/city.jpg`, label: 'City Lights 🌃', rotate: '10deg', z: 5, translateY: 5, translateX: -5, spreadFrom: { left: 50, top: 50 }, spreadTo: { left: 96, top: 86 }, spreadToMobile: { left: 96, top: 86 } },
  { id: 5, imgSrc: `/hero_img/sunset.jpg`, label: 'Sunset 🌅', rotate: '-6deg', z: 25, translateY: 5, translateX: 5, spreadFrom: { left: 50, top: 50 }, spreadTo: { left: 50, top: 50 }, spreadToMobile: { left: 50, top: 50 } },
]

export const STEPS = [
  { num: '01', title: 'Snap & Upload', desc: 'Drop your photos or shoot directly in the app. Batch upload in seconds.' },
  { num: '02', title: 'Create an Album', desc: 'Group moments into beautiful shared albums with a tap.' },
  { num: '03', title: 'Invite Your People', desc: 'Send a link. Friends join instantly — no accounts required.' },
  { num: '04', title: 'Relive Together', desc: 'React, comment, and add your own shots to the same album.' },
]

export const STRIP_ITEMS = [
  'Instant sharing',
  'No account needed to view',
  'Collaborative albums',
  'Works offline',
  'Auto-backup',
  'End-to-end private',
]

export const CALLOUT_CARDS = [
  { icon: '🔗', title: 'Share with a link', text: 'One URL. Friends open it on any device, no app required. They can even add their own photos.' },
  { icon: '💬', title: 'React & comment', text: 'Drop emojis, leave comments on individual shots. Relive the moment together in real-time.' },
  { icon: '🗃️', title: 'Smart albums', text: 'Auto-grouped by date and location, or curate your own. Everything organized, always.' },
  { icon: '📲', title: 'Install as an app', text: 'Add to your home screen. Upload works offline and syncs when you\'re back online.' },
]
