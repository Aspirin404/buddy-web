import { useState } from 'react'
import { rollBuddy, saveBuddy, generateSoulOffline } from '../buddy/gacha.js'
import { RARITY_COLORS, RARITY_EMOJI } from '../buddy/data.js'
import BuddyCard from '../components/BuddyCard.jsx'

const STEPS = [
  '⠋ Rolling...', '⠙ Rolling...', '⠹ Rolling...', '⠸ Rolling...',
  '⠼ Rolling...', '⠴ Rolling...', '⠦ Rolling...',
  '✨ Almost...', '✨✨ Almost...', '✨✨✨ !!!',
]

export default function RollPage({ onHatched }) {
  const [userId, setUserId]   = useState('')
  const [name,   setName]     = useState('')
  const [phase,  setPhase]    = useState('idle')   // idle | rolling | reveal | naming | done
  const [step,   setStep]     = useState(0)
  const [buddy,  setBuddy]    = useState(null)

  async function startRoll() {
    if (!userId.trim()) return
    setPhase('rolling')
    setStep(0)
    const rolled = rollBuddy(userId.trim())
    // 播放滚动动画
    for (let i = 0; i < STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 200))
      setStep(i)
    }
    rolled.soul = generateSoulOffline(rolled, name || userId)
    setBuddy(rolled)
    await new Promise(r => setTimeout(r, 300))
    setPhase('reveal')
  }

  function confirmName() {
    const finalName = name.trim() || userId.trim()
    buddy.soul = generateSoulOffline(buddy, finalName)
    saveBuddy(buddy, finalName, userId.trim())
    onHatched()
  }

  const rc = buddy ? RARITY_COLORS[buddy.rarity] : '#22d3ee'
  const re = buddy ? RARITY_EMOJI[buddy.rarity]  : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '32px 16px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#22d3ee', fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', margin: 0 }}>
          🎰 BUDDY GACHA
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 6 }}>
          相同 ID 永远得到相同的 Buddy
        </p>
      </div>

      {phase === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
          <input
            placeholder="输入你的 ID（名字或邮箱）"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && startRoll()}
            style={inputStyle}
          />
          <button onClick={startRoll} disabled={!userId.trim()} style={btnStyle('#22d3ee')}>
            开始抽卡
          </button>
        </div>
      )}

      {phase === 'rolling' && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#22d3ee', fontSize: '1.2rem', marginBottom: 8 }}>
            {STEPS[step]}
          </div>
          <div style={{ color: '#374151', fontSize: '0.75rem' }}>seed: {userId}</div>
        </div>
      )}

      {phase === 'reveal' && buddy && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
            <span style={{ fontSize: '2rem' }}>{re}</span>
            <div style={{ color: rc, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '1.2rem', marginTop: 4 }}>
              {buddy.shiny && '★ SHINY '}{buddy.rarity.toUpperCase()} {buddy.species.toUpperCase()}
            </div>
          </div>

          <BuddyCard buddy={buddy} name={name.trim() || userId.trim()} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
            <input
              placeholder="给 Buddy 起个名字（可跳过）"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmName()}
              style={inputStyle}
              autoFocus
            />
            <button onClick={confirmName} style={btnStyle(rc)}>
              ✓ 确认，开始冒险！
            </button>
            <button onClick={() => { setPhase('idle'); setBuddy(null) }}
              style={{ ...btnStyle('#374151'), background: 'transparent', color: '#6b7280' }}>
              重新抽（换 ID）
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  background: '#0f1117',
  border: '1px solid #374151',
  borderRadius: 8,
  padding: '10px 14px',
  color: '#e5e7eb',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const btnStyle = (color) => ({
  background: color + '22',
  border: `1px solid ${color}66`,
  borderRadius: 8,
  padding: '10px 20px',
  color: color,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  width: '100%',
})
