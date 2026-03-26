import React from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import './AlbumCategorySegment.css'

export function AlbumCategorySegment({ sections, activeIndex, onSelect }) {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      onSelect(Math.min(sections.length - 1, activeIndex + 1))
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onSelect(Math.max(0, activeIndex - 1))
    }
  }

  return (
    <LayoutGroup id="dash-album-category-segment">
      <div
        className="dash-segment"
        role="tablist"
        aria-label="Album category"
        onKeyDown={handleKeyDown}
      >
        {sections.map((section, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className="dash-segment__option"
              onClick={() => onSelect(index)}
            >
              {isActive && (
                <motion.span
                  layoutId="dash-album-category-pill"
                  className="dash-segment__pill"
                  transition={{
                    type: 'spring',
                    stiffness: 520,
                    damping: 38,
                    mass: 0.85,
                  }}
                />
              )}
              <span className="dash-segment__label">{section.title}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
