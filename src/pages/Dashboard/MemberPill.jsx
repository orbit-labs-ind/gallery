/* eslint-disable no-unused-vars */
import React from 'react'
import { motion } from 'framer-motion'
import { IoTrashOutline } from 'react-icons/io5'
import './MemberPill.css'
import { AuthedAlbumImage } from '../AlbumPhotos/AuthedAlbumImage'

/** User avatars use `?size=thumb`; album file URLs use AuthedAlbumImage `variant` instead. */
function streamPathForPill(streamPath) {
  if (!streamPath) return null
  const isUserAvatar =
    streamPath.includes('/users/') && streamPath.includes('/avatar/file')
  if (isUserAvatar && !/[?&]size=/.test(streamPath)) {
    const joiner = streamPath.includes('?') ? '&' : '?'
    return `${streamPath}${joiner}size=thumb`
  }
  return streamPath
}

export function MemberPill({ member, onRemove, showImage = true }) {
  const name = member.displayName || member.name || member.email || 'Member'
  const avatarPath = streamPathForPill(member.profilePhotoStreamPath)
  const isUserAvatarUrl = Boolean(
    member.profilePhotoStreamPath?.includes('/users/') &&
      member.profilePhotoStreamPath?.includes('/avatar/file')
  )
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.86 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.86 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      className="member-pill"
    >
      {showImage && member.profilePhotoStreamPath ? (
        <AuthedAlbumImage
          className="member-pill__avatar"
          streamPath={avatarPath}
          variant={isUserAvatarUrl ? 'full' : 'thumb'}
          alt=""
          width={26}
          height={26}
          style={{
            width: 26,
            height: 26,
            minWidth: 26,
            minHeight: 26,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      ) : null}
      {showImage && !member.profilePhotoStreamPath && member.photo ? (
        <img
          className="member-pill__avatar"
          src={member.photo}
          alt=""
          width={26}
          height={26}
        />
      ) : null}
      {showImage && !member.profilePhotoStreamPath && !member.photo ? (
        <span className="member-pill__avatar member-pill__avatar--letter" aria-hidden>
          {name.charAt(0).toUpperCase()}
        </span>
      ) : null}
      <span className="member-pill__name">{name}</span>
      <button
        type="button"
        className="member-pill__remove"
        aria-label={`Remove ${name}`}
        onClick={() => onRemove(member.id)}
      >
        <IoTrashOutline size={16} aria-hidden />
      </button>
    </motion.span>
  )
}
