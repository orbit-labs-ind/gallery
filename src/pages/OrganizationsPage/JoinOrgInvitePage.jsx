import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button, Stack, Text, Title, Paper, Loader } from '@mantine/core'
import { acceptOrgInviteByToken } from '../../api/organizations'
import './OrganizationsPage.css'

export default function JoinOrgInvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const [phase, setPhase] = useState(() => (token ? 'loading' : 'error'))
  const [detail, setDetail] = useState(() =>
    token
      ? ''
      : 'This link is missing the invitation token. Ask your teammate to resend the email from PicPoint.'
  )

  useEffect(() => {
    if (!token) {
      return undefined
    }

    let cancelled = false
    let redirectTimer
    ;(async () => {
      setPhase('loading')
      setDetail('')
      try {
        const data = await acceptOrgInviteByToken(token)
        if (cancelled) return
        setPhase('ok')
        setDetail(
          data.alreadyMember
            ? `You're already in ${data.organizationName || 'this organization'}.`
            : `You've joined ${data.organizationName || 'the organization'}.`
        )
        redirectTimer = setTimeout(() => {
          navigate('/organizations', { replace: true })
        }, 1600)
      } catch (e) {
        if (cancelled) return
        setPhase('error')
        setDetail(e.message || 'Could not accept this invitation.')
      }
    })()

    return () => {
      cancelled = true
      if (redirectTimer) clearTimeout(redirectTimer)
    }
  }, [token, navigate])

  return (
    <section className="orgs-page">
      <div className="orgs-page__blob orgs-page__blob--1" aria-hidden />
      <div className="orgs-page__blob orgs-page__blob--2" aria-hidden />
      <div className="orgs-page__grid" aria-hidden />

      <Stack className="orgs-page__inner" gap="lg" py={48} px="md" maw={520} mx="auto">
        <Paper className="orgs-page__glass" p="xl" radius="lg">
          <Stack gap="md" align="center">
            <Title order={3} className="orgs-page__title" ta="center">
              Organization invitation
            </Title>
            {phase === 'loading' ? (
              <>
                <Loader color="cyan" />
                <Text size="sm" style={{ color: 'var(--muted)' }} ta="center">
                  Accepting your invitation…
                </Text>
              </>
            ) : null}
            {phase === 'ok' ? (
              <Text size="sm" style={{ color: 'var(--text)' }} ta="center">
                {detail}
              </Text>
            ) : null}
            {phase === 'error' ? (
              <>
                <Text size="sm" style={{ color: 'var(--muted)' }} ta="center">
                  {detail}
                </Text>
                <Button
                  variant="default"
                  className="gallery-theme-btn--accent3"
                  onClick={() => navigate('/organizations', { replace: true })}
                >
                  Go to organizations
                </Button>
              </>
            ) : null}
          </Stack>
        </Paper>
      </Stack>
    </section>
  )
}
