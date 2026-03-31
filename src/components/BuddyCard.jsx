import BuddySprite from './BuddySprite.jsx'
import StatBar from './StatBar.jsx'
import { RARITY_COLORS, RARITY_EMOJI } from '../buddy/data.js'

export default function BuddyCard({ buddy, name, compact = false }) {
  const rc      = RARITY_COLORS[buddy.rarity]
  const re      = RARITY_EMOJI[buddy.rarity]
  const hatDisp = buddy.hat !== 'none' ? buddy.hat : '—'

  return (
    <div style={{
      border: `1px solid ${rc}44`,
      borderRadius: 12,
      background: '#0f1117',
      padding: compact ? '16px' : '20px',
      maxWidth: 480,
      width: '100%',
      boxShadow: `0 0 24px ${rc}22`,
    }}>
      {/* 顶部：名字 + 稀有度 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: '1.1rem' }}>{re}</span>
          <span style={{ color: rc, fontWeight: 700, fontSize: '1.1rem', fontFamily: "'JetBrains Mono', monospace" }}>
            {name}
          </span>
          {buddy.shiny && (
            <span style={{ color: '#eab308', fontSize: '0.8rem', fontWeight: 700 }}>★ SHINY</span>
          )}
        </div>
        <div style={{ color: '#6b7280', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
          {buddy.rarity.toUpperCase()} · {buddy.species} · eye {buddy.eye} · hat {hatDisp}
        </div>
        {buddy.soul && (
          <div style={{
            marginTop: 8, color: '#9ca3af', fontSize: '0.8rem',
            lineHeight: 1.6, borderLeft: `2px solid ${rc}66`, paddingLeft: 10,
          }}>
            {buddy.soul}
          </div>
        )}
      </div>

      {/* 分隔线 */}
      <div style={{ borderTop: `1px solid #1f2937`, marginBottom: 12 }} />

      {/* 精灵 + 属性 */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0 }}>
          <BuddySprite buddy={buddy} size={compact ? 'sm' : 'md'} animated />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {Object.entries(buddy.stats).map(([k, v]) => (
            <StatBar key={k} name={k} value={v} />
          ))}
        </div>
      </div>
    </div>
  )
}
