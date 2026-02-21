import { useTransform, motion as Motion } from 'framer-motion'
import { useMediaQuery } from '@mantine/hooks'
import { Paper, Text } from '@mantine/core'
import './FloatingPhoto.css'

export default function FloatingPhoto({
  color,
  label,
  rotate,
  z,
  delay,
  scrollYProgress,
  spreadFrom = { left: 50, top: 50 },
  spreadTo = { left: 50, top: 50 },
  spreadToMobile = { left: 50, top: 50 },
}) {
  const isMobile = useMediaQuery('(max-width: 900px)')
  const target = isMobile ? spreadToMobile : spreadTo

  // Spread progress: at 20% scroll = spread a little, at 90% = full entire-screen spread
  const spreadProgress = useTransform(
    scrollYProgress,
    [0, 0.2, 0.9, 1],
    [0, 0.15, 1, 1]
  )
  const left = useTransform(
    spreadProgress,
    (v) => `${spreadFrom.left + (target.left - spreadFrom.left) * v}%`
  )
  const top = useTransform(
    spreadProgress,
    (v) => `${spreadFrom.top + (target.top - spreadFrom.top) * v}%`
  )
  // Zoom: grow as they spread
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0.75, 0.9, 1.1, 1.15])
  // Fade: stay visible until ~70% scroll, then fade out by 90%
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.7, 0.9, 1], [1, 1, 1, 0.4, 0])
  const rotateNum = parseInt(String(rotate).replace(/deg|°/, ''), 10) || 0
  const rotateZ = useTransform(spreadProgress, (v) => `${v * rotateNum}deg`)
  const translateZ = useTransform(scrollYProgress, [0, 0.5, 1], [0, 50, 100])
  const rotateX = useTransform(scrollYProgress, (v) => (v - 0.5) * 6)
  const rotateY = useTransform(scrollYProgress, (v) => (v - 0.5) * 10)

  if (!scrollYProgress) {
    return (
      <div
        className="float-photo float-photo--fallback"
        style={{
          '--rotate': rotate,
          '--z': z,
          '--delay': delay + 's',
          '--color': color,
        }}
      >
        <Paper className="float-photo-inner" shadow="xl" radius="md" p="xs" withBorder>
          <div
            className="float-photo-img"
            style={{ background: `linear-gradient(135deg, ${color}cc, ${color}55)` }}
          >
            <div className="float-photo-shimmer" />
          </div>
          <Text size="xs" fw={600} c="dimmed" ta="center" mt="xs" className="float-photo-label">
            {label}
          </Text>
        </Paper>
      </div>
    )
  }

  return (
    <Motion.div
      className="float-photo float-photo--fullscreen"
      style={{
        left,
        top,
        x: '-50%',
        y: '-50%',
        scale,
        opacity,
        rotate: rotateZ,
        rotateX,
        rotateY,
        z: translateZ,
        perspective: 1200,
        transformStyle: 'preserve-3d',
        '--z': z,
        '--color': color,
      }}
    >
      <Motion.div
        className="float-photo-bob"
        animate={{ y: [-20, -8, 0] }}
        transition={{ duration: 3.5, delay: (delay || 0) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Paper className="float-photo-inner" shadow="xl" radius="md" p="xs" withBorder>
          <div
            className="float-photo-img"
            style={{ background: `linear-gradient(135deg, ${color}cc, ${color}55)` }}
          >
            <div className="float-photo-shimmer" />
          </div>
          <Text size="xs" fw={600} c="dimmed" ta="center" mt="xs" className="float-photo-label">
            {label}
          </Text>
        </Paper>
      </Motion.div>
    </Motion.div>
  )
}
