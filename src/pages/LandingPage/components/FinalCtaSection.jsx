import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Title, Text, Button, Stack, Box } from '@mantine/core'
import './FinalCtaSection.css'

export default function FinalCtaSection() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  return (
    <section className="lp-final">
      <div className="lp-final-blob" aria-hidden />
      <Box className="lp-final-inner">
        <Title order={2} className="lp-final-h2">
          Your memories deserve
          <br />
          <span className="lp-gradient-text">better than a group chat.</span>
        </Title>
        <Text size="lg" c="dimmed" className="lp-final-p">
          Create your first shared album in under a minute.
        </Text>
        {isAuthenticated ? (
          <Button
            component={Link}
            to="/dashboard"
            size="xl"
            radius="xl"
            className="lp-btn-primary lp-btn-xl"
          >
            Open Dashboard →
          </Button>
        ) : (
          <Button
            component={Link}
            to="/login"
            size="xl"
            radius="xl"
            className="lp-btn-primary lp-btn-xl"
          >
            Start for free →
          </Button>
        )}
      </Box>
    </section>
  )
}
