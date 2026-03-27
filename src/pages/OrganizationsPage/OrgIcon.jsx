import {
  IoLayersOutline,
  IoPlanetOutline,
  IoRocketOutline,
  IoDiamondOutline,
  IoFlameOutline,
  IoShieldOutline,
  IoStarOutline,
  IoCompassOutline,
} from 'react-icons/io5'
import { getOrgIconKey, getOrgVisualVariant } from '../../common/orgAccent'

const ICONS = {
  layers: IoLayersOutline,
  planet: IoPlanetOutline,
  rocket: IoRocketOutline,
  diamond: IoDiamondOutline,
  flame: IoFlameOutline,
  shield: IoShieldOutline,
  star: IoStarOutline,
  compass: IoCompassOutline,
}

export function OrgIcon({ orgId, size = 22, className = '' }) {
  const variant = getOrgVisualVariant(orgId)
  const key = getOrgIconKey(orgId)
  const Icon = ICONS[key] || IoLayersOutline
  return (
    <span
      className={`orgs-page__org-icon orgs-page__org-icon--v${variant} ${className}`.trim()}
      style={{ width: 44, height: 44 }}
    >
      <Icon size={size} aria-hidden />
    </span>
  )
}
