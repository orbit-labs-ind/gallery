import React from 'react'
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
    <div
      className="dash-seg-scroll"
      role="tablist"
      aria-label="Album collections"
      onKeyDown={handleKeyDown}
    >
      <div className="dash-seg-scroll__inner">
        {sections.map((section, index) => {
          const isActive = index === activeIndex
          const accent = section.accent || 'coral'
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`dash-seg-chip dash-seg-chip--${accent}${isActive ? ' dash-seg-chip--active' : ''}`}
              onClick={() => onSelect(index)}
            >
              <span className="dash-seg-chip__label">{section.title}</span>
              {section.albums?.length > 0 ? (
                <span className="dash-seg-chip__count">{section.albums.length}</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
