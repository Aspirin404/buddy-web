import { renderSprite } from '../buddy/sprites.js'
import { useEffect, useState } from 'react'

export default function BuddySprite({ buddy, size = 'md', animated = true }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!animated) return
    const id = setInterval(() => setFrame(f => f + 1), 600)
    return () => clearInterval(id)
  }, [animated])

  const lines  = renderSprite(buddy, frame)
  const fs     = size === 'lg' ? '1.1rem' : size === 'sm' ? '0.7rem' : '0.85rem'
  const color  = {
    common: '#9ca3af', uncommon: '#22c55e',
    rare: '#3b82f6',   epic: '#a855f7', legendary: '#eab308',
  }[buddy.rarity]

  return (
    <pre style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: fs,
      lineHeight: 1.4,
      color,
      margin: 0,
      padding: 0,
      userSelect: 'none',
      transition: 'color 0.3s',
    }}>
      {lines.join('\n')}
    </pre>
  )
}
