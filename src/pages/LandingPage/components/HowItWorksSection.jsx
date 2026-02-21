import { Title, Text, Stack, Box } from '@mantine/core'
import { STEPS } from '../constants'
import './HowItWorksSection.css'

export default function HowItWorksSection() {
  return (
    <section className="lp-how">
      <div className="lp-how-inner">
        <Text size="xs" fw={600} tt="uppercase" c="pink" className="lp-section-label">
          How it works
        </Text>
        <Title order={2} className="lp-section-h2">
          From snap to shared
          <br />
          <span className="lp-gradient-text">in just four steps</span>
        </Title>

        <Stack gap={0} className="lp-steps">
          {STEPS.map((s, i) => (
            <Box key={s.num} className="lp-step" style={{ '--i': i }}>
              <div className="lp-step-num">{s.num}</div>
              <Box className="lp-step-content">
                <Title order={3} className="lp-step-title">
                  {s.title}
                </Title>
                <Text size="md" c="dimmed" className="lp-step-desc">
                  {s.desc}
                </Text>
              </Box>
              {i < STEPS.length - 1 && <div className="lp-step-connector" />}
            </Box>
          ))}
        </Stack>
      </div>
    </section>
  )
}
