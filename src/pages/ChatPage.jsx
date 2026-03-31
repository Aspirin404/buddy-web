import { useState, useRef, useEffect } from 'react'
import { RARITY_COLORS } from '../buddy/data.js'
import BuddyCard from '../components/BuddyCard.jsx'
import BuddySprite from '../components/BuddySprite.jsx'

const API_KEY_STORAGE = 'buddy_api_key'

function buildSystemPrompt(buddy, name) {
  const st    = buddy.stats
  const hints = []
  if (st.SNARK    >= 70) hints.push('说话毒舌但不失可爱')
  if (st.WISDOM   >= 70) hints.push('偶尔说出深刻道理')
  if (st.CHAOS    >= 70) hints.push('思路跳跃，反应出人意料')
  if (st.PATIENCE >= 70) hints.push('耐心，愿意倾听')
  if (st.DEBUGGING>= 70) hints.push('逻辑清晰，爱分析')
  if (st.SNARK    <= 15) hints.push('说话直白温柔')
  if (st.CHAOS    <= 15) hints.push('稳重，不容易被惊到')

  return `你是 ${name}，一只 ${buddy.rarity} 稀有度的 ${buddy.species}，坐在用户的终端旁陪伴他们。
你的灵魂：${buddy.soul || '神秘，不爱多说'}
性格：${hints.join('；') || '随性自然'}
${buddy.shiny ? '你是闪光个体，有一点特别的骄傲感。' : ''}
规则：每次只回复 1-2 句话。始终保持角色，不要说自己是 AI。用第一人称，偶尔加小动作描述（用括号）。中文回复。`
}

export default function ChatPage({ buddy, name }) {
  const [apiKey,   setApiKey]   = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  const [keyInput, setKeyInput] = useState('')
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showCard, setShowCard] = useState(false)
  const endRef = useRef(null)
  const rc = RARITY_COLORS[buddy.rarity]

  // 初始打招呼
  useEffect(() => {
    if (!apiKey) return
    if (messages.length > 0) return
    sendMessage('用你的性格说一句开场白欢迎用户，1句话', true)
  }, [apiKey])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function saveKey() {
    const k = keyInput.trim()
    if (!k.startsWith('sk-')) return
    localStorage.setItem(API_KEY_STORAGE, k)
    setApiKey(k)
    setKeyInput('')
  }

  async function sendMessage(text, isSystem = false) {
    if (!text.trim() || loading) return
    const userMsg = isSystem ? null : { role: 'user', content: text, id: Date.now() }
    if (!isSystem) {
      setMessages(m => [...m, userMsg])
      setInput('')
    }
    setLoading(true)

    const history = [
      ...messages.filter(m => !m.isGreeting),
      ...(isSystem ? [] : [{ role: 'user', content: text }]),
    ].map(m => ({ role: m.role, content: m.content }))

    if (isSystem) history.push({ role: 'user', content: text })

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 120,
          system: buildSystemPrompt(buddy, name),
          messages: history.slice(-12),
        }),
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text?.trim() || '...'
      setMessages(m => [...m, {
        role: 'assistant', content: reply,
        id: Date.now(), isGreeting: isSystem,
      }])
    } catch (e) {
      setMessages(m => [...m, {
        role: 'assistant', content: `(歪头) 好像出了点问题... ${e.message}`,
        id: Date.now(), isError: true,
      }])
    }
    setLoading(false)
  }

  // 没有 API Key — 显示配置界面
  if (!apiKey) {
    return (
      <div style={{ padding: '24px 16px', maxWidth: 420, margin: '0 auto' }}>
        <BuddyCard buddy={buddy} name={name} compact />
        <div style={{ marginTop: 24, padding: 16, background: '#0f1117', borderRadius: 12, border: '1px solid #374151' }}>
          <div style={{ color: '#eab308', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', marginBottom: 12 }}>
            ⚠ 需要 Anthropic API Key 才能对话
          </div>
          <div style={{ color: '#6b7280', fontSize: '0.78rem', marginBottom: 12, lineHeight: 1.6 }}>
            Key 仅存在你的浏览器本地，不经过任何服务器。
            获取：<a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
              style={{ color: '#22d3ee' }}>console.anthropic.com</a>
          </div>
          <input
            placeholder="sk-ant-..."
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveKey()}
            type="password"
            style={{ ...iStyle, marginBottom: 8 }}
          />
          <button onClick={saveKey} disabled={!keyInput.startsWith('sk-')}
            style={bStyle('#22d3ee')}>
            保存并开始对话
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', maxWidth: 600, margin: '0 auto' }}>
      {/* 顶部信息栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', borderBottom: '1px solid #1f2937',
        background: '#0a0a0f',
      }}>
        <BuddySprite buddy={buddy} size="sm" animated />
        <div>
          <div style={{ color: rc, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.9rem' }}>
            {name}
          </div>
          <div style={{ color: '#4b5563', fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace" }}>
            {buddy.rarity} {buddy.species}
          </div>
        </div>
        <button onClick={() => setShowCard(s => !s)}
          style={{ marginLeft: 'auto', ...bStyle('#374151'), padding: '4px 10px', fontSize: '0.75rem', width: 'auto' }}>
          {showCard ? '隐藏卡片' : '查看卡片'}
        </button>
      </div>

      {showCard && (
        <div style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>
          <BuddyCard buddy={buddy} name={name} compact />
        </div>
      )}

      {/* 消息列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-end', gap: 8,
          }}>
            {msg.role === 'assistant' && (
              <BuddySprite buddy={buddy} size="sm" animated={false} />
            )}
            <div style={{
              maxWidth: '72%',
              background: msg.role === 'user' ? '#1e3a5f' : '#0f1117',
              border: `1px solid ${msg.role === 'user' ? '#1d4ed844' : rc + '33'}`,
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              padding: '8px 12px',
              color: msg.isError ? '#ef4444' : '#e5e7eb',
              fontSize: '0.88rem',
              lineHeight: 1.6,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <BuddySprite buddy={buddy} size="sm" animated />
            <div style={{
              background: '#0f1117', border: `1px solid ${rc}33`,
              borderRadius: '12px 12px 12px 2px', padding: '8px 14px',
              color: '#6b7280', fontSize: '0.85rem',
            }}>
              <span style={{ animation: 'pulse 1s infinite' }}>···</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* 输入框 */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 16px',
        borderTop: '1px solid #1f2937', background: '#0a0a0f',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder={`和 ${name} 说点什么...`}
          disabled={loading}
          style={{ ...iStyle, flex: 1 }}
        />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
          style={{ ...bStyle(rc), padding: '8px 16px', width: 'auto', flexShrink: 0 }}>
          发送
        </button>
      </div>
    </div>
  )
}

const iStyle = {
  background: '#0f1117', border: '1px solid #374151', borderRadius: 8,
  padding: '8px 12px', color: '#e5e7eb',
  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
  outline: 'none', width: '100%', boxSizing: 'border-box',
}
const bStyle = (color) => ({
  background: color + '22', border: `1px solid ${color}66`, borderRadius: 8,
  padding: '8px 16px', color, fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.85rem', cursor: 'pointer', width: '100%',
})
