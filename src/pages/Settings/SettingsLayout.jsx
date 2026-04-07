import { NavLink, Outlet } from 'react-router-dom'
import { Paper, Stack, Text, Title } from '@mantine/core'
import './SettingsLayout.css'

const links = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/memberships', label: 'Memberships' },
  { to: '/settings/activity', label: 'Activity' },
  { to: '/settings/danger', label: 'Danger zone' },
]

export default function SettingsLayout() {
  return (
    <div className="settings-layout">
      <div className="settings-layout__inner">
        <Title order={2} c="#fff" mb="md">
          Settings
        </Title>
        <Stack gap="lg">
          <Paper className="settings-layout__nav" p="sm" radius="md" withBorder>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs" px={4}>
              Sections
            </Text>
            <Stack gap={4}>
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/settings/profile'}
                  className={({ isActive }) =>
                    `settings-layout__link${isActive ? ' settings-layout__link--active' : ''}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </Stack>
          </Paper>
          <Paper className="settings-layout__content" p="lg" radius="md" withBorder>
            <Outlet />
          </Paper>
        </Stack>
      </div>
    </div>
  )
}
