import React from 'react'
import { motion } from 'framer-motion'
import { IoTrashOutline } from 'react-icons/io5'
import './MemberPill.css'

export function MemberPill({ member, onRemove }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.86 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.86 }}
      transition={{ type: 'spring', stiffness: 520, damping: 34 }}
      className="member-pill"
    >
      <img
        className="member-pill__avatar"
        src={member.photo}
        alt=""
        width={26}
        height={26}
      />
      <span className="member-pill__name">{member.name}</span>
      <button
        type="button"
        className="member-pill__remove"
        aria-label={`Remove ${member.name}`}
        onClick={() => onRemove(member.id)}
      >
        <IoTrashOutline size={16} aria-hidden />
      </button>
    </motion.span>
  )
}
