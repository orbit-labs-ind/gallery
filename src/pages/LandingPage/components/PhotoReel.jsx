import { useRef, useState } from 'react'
import { Paper, Text } from '@mantine/core'
import { HERO_PHOTOS } from '../constants'
import './PhotoReel.css'

export default function PhotoReel() {
  const containerRef = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setRotateX(-y * 18)
    setRotateY(x * 18)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <div
      ref={containerRef}
      className="lp-photo-reel"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--rx': `${rotateX}deg`,
        '--ry': `${rotateY}deg`,
      }}
    >
      <div className="lp-photo-reel__stack">
        {HERO_PHOTOS.map((p, i) => (
          <div
            key={p.id}
            className="lp-photo-reel__card"
            style={{
              '--i': i,
              '--color': p.color,
              '--z': p.z ?? 10 + i,
            }}
          >
            <Paper className="lp-photo-reel__card-inner" shadow="xl" radius="lg" p="sm" withBorder>
              <div
                className="lp-photo-reel__img"
                style={{ background: `url(${p.imgSrc}) no-repeat center center`, backgroundSize: 'cover' }}
              >
              </div>
              <Text size="xs" fw={600} c="dimmed" ta="center" mt="xs" className="lp-photo-reel__label">
                {p.label}
              </Text>
            </Paper>
          </div>
        ))}
      </div>
    </div>
  )
}
