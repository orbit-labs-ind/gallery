import { SimpleGrid, Card, Title, Text, Box } from '@mantine/core'
import { CALLOUT_CARDS } from '../constants'
import './CalloutSection.css'

export default function CalloutSection() {
  return (
    <section className="lp-callout">
      <div className="lp-callout-blob" aria-hidden />
      <div className="lp-callout-inner">
        {CALLOUT_CARDS.map((card, i) => (
          <Card
            key={card.title}
            className={`lp-callout-card lp-callout-card-${i + 1}`}
            padding="lg"
            radius="lg"
            withBorder
            shadow="sm"
          >
            <Text className="lp-callout-icon" size="2.25rem" component="span">
              {card.icon}
            </Text>
            <Title order={3} className="lp-callout-card-title">
              {card.title}
            </Title>
            <Text size="sm" c="dimmed" className="lp-callout-card-text">
              {card.text}
            </Text>
          </Card>
        ))}
      </div>
    </section>
  )
}
