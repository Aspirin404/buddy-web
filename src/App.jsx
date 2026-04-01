import { useState, useCallback } from 'react'
import { loadBuddy, clearBuddy } from './buddy/gacha.js'
import RollPage from './pages/RollPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import BuddyCard from './components/BuddyCard.jsx'

const NAV = [
  { icon: '>', label: '抽卡' },
  { icon: '$', label: '对话' },
  { icon: '#', label: '卡片' },
]

export default function App() {
  const [tab,   setTab]   = useState(0)
  const [saved, setSaved] = useState(() => loadBuddy())
  const [chatKey, setChatKey] = useState(0)

  // Force ChatPage remount when switching to chat tab
  const goToChat = useCallback((t) => {
    if (t === 1) setChatKey(k => k + 1)
    setTab(t)
  }, [])

  function onHatched() {
    setSaved(loadBuddy())
    setTab(1)
  }

  function onReset() {
    if (!confirm('确定要重新抽一只 Buddy 吗？')) return
    clearBuddy()
    setSaved(null)
    setTab(0)
  }

  const hasBuddy = !!saved

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      background: '#050508',
      color: '#e5e7eb',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1f2937',
        background: '#0a0a0f',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52,
        position: 'sticky', top: 0, zIndex: 100,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: '#22d3ee', fontWeight: 700,
          fontSize: 'clamp(0.8rem, 3vw, 1rem)',
          letterSpacing: 1,
          whiteSpace: 'nowrap',
        }}>
          {'</>'} BUDDY
        </div>

        {/* Tab 导航 */}
        <div style={{ display: 'flex', gap: 2 }}>
          {NAV.map(({ icon, label }, i) => {
            const disabled = !hasBuddy && i > 0
            return (
              <button
                key={i}
                onClick={() => !disabled && goToChat(i)}
                style={{
                  background: tab === i ? '#22d3ee22' : 'transparent',
                  border: tab === i ? '1px solid #22d3ee44' : '1px solid transparent',
                  borderRadius: 6,
                  padding: '4px 8px',
                  color: disabled ? '#374151' : tab === i ? '#22d3ee' : '#6b7280',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(0.68rem, 2vw, 0.78rem)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {icon} {label}
              </button>
            )
          })}
        </div>

        {hasBuddy ? (
          <button onClick={onReset} style={{
            background: 'transparent', border: 'none',
            color: '#4b5563', fontSize: '0.72rem', cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            padding: '4px 6px',
            whiteSpace: 'nowrap',
          }}>
            重置
          </button>
        ) : (
          <div style={{ width: 36 }} />
        )}
      </div>

      {/* 页面内容 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 0 && (
          hasBuddy
            ? <AlreadyHatched saved={saved} onReset={onReset} onChat={() => setTab(1)} />
            : <RollPage onHatched={onHatched} />
        )}
        {tab === 1 && hasBuddy && (
          <ChatPage key={chatKey} buddy={saved.buddy} name={saved.name} />
        )}
        {tab === 2 && hasBuddy && (
          <div style={{
            padding: '24px 16px',
            display: 'flex', justifyContent: 'center',
          }}>
            <BuddyCard buddy={saved.buddy} name={saved.name} />
          </div>
        )}
      </div>
    </div>
  )
}

function AlreadyHatched({ saved, onReset, onChat }) {
  const { buddy, name } = saved
  return (
    <div style={{
      padding: '24px 16px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 16,
    }}>
      <div style={{
        color: '#6b7280',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.8rem',
      }}>
        你已经有 Buddy 了！
      </div>
      <BuddyCard buddy={buddy} name={name} />
      <div style={{
        display: 'flex', gap: 8,
        width: '100%', maxWidth: 480,
        padding: '0 4px',
      }}>
        <button onClick={onChat} style={{
          flex: 1, background: '#22d3ee22', border: '1px solid #22d3ee44',
          borderRadius: 8, padding: '10px', color: '#22d3ee',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', cursor: 'pointer',
        }}>
          {'>'} 开始对话
        </button>
        <button onClick={onReset} style={{
          background: '#1f2937', border: '1px solid #374151',
          borderRadius: 8, padding: '10px 16px', color: '#6b7280',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', cursor: 'pointer',
        }}>
          重新抽
        </button>
      </div>
    </div>
  )
}
