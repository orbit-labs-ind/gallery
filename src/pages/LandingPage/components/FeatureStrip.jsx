import { Box, Text } from '@mantine/core'
import { STRIP_ITEMS } from '../constants'
import './FeatureStrip.css'

export default function FeatureStrip() {
  const items = [...STRIP_ITEMS, ...STRIP_ITEMS]

  return (
    <section className="lp-strip">
      <div className="lp-strip-inner">
        {items.map((f, i) => (
          <Box key={`${f}-${i}`} className="lp-strip-item" component="span">
            <Text span className="lp-strip-dot">✦</Text>
            <Text span size="sm" fw={500} c="dimmed">{f}</Text>
          </Box>
        ))}
      </div>
    </section>
  )
}
