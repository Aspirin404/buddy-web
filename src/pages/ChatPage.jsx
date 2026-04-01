import { useState, useRef, useEffect, useCallback } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { RARITY_COLORS } from '../buddy/data.js'
import BuddyCard from '../components/BuddyCard.jsx'
import BuddySprite from '../components/BuddySprite.jsx'
import TypewriterBubble from '../components/TypewriterBubble.jsx'

const SUPABASE_URL = 'https://sozctsrxqeqvubgufiuq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvemN0c3J4cWVxdnViZ3VmaXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzM1NTYsImV4cCI6MjA5MDUwOTU1Nn0.nT213DdxUxO7b1zA-6W1uElUTqyt-eSAQr74bWDzxW4'

const FALLBACK_MESSAGES = {
  authentication_error: '认证失败，请刷新页面。',
  rate_limit_error: '请求太频繁，请稍后再试。',
  invalid_request_error: '请求无效，请重试。',
  overloaded_error: '服务繁忙，请稍后再试。',
  insufficient_credits: '该网站的 AI 额度已用尽，请联系管理员。',
  permission_error: 'AI 功能已被禁用，请联系管理员。',
  api_error: '服务暂时不可用。',
}

function getUserErrorMessage(code, backendMessage) {
  if (backendMessage) return backendMessage
  return FALLBACK_MESSAGES[code] || '服务暂时不可用。'
}

function buildSystemPrompt(buddy, name) {
  const st = buddy.stats
  const hints = []
  if (st.SNARK >= 70) hints.push('说话毒舌但不失可爱')
  if (st.WISDOM >= 70) hints.push('偶尔说出深刻道理')
  if (st.CHAOS >= 70) hints.push('思路跳跃，反应出人意料')
  if (st.PATIENCE >= 70) hints.push('耐心，愿意倾听')
  if (st.DEBUGGING >= 70) hints.push('逻辑清晰，爱分析')
  if (st.SNARK <= 15) hints.push('说话直白温柔')
  if (st.CHAOS <= 15) hints.push('稳重，不容易被惊到')

  return `你是 ${name}，一只 ${buddy.rarity} 稀有度的 ${buddy.species}，坐在用户的终端旁陪伴他们。
你的灵魂：${buddy.soul || '神秘，不爱多说'}
性格：${hints.join('；') || '随性自然'}
${buddy.shiny ? '你是闪光个体，有一点特别的骄傲感。' : ''}
规则：每次只回复 1-2 句话。始终保持角色，不要说自己是 AI。用第一人称，偶尔加小动作描述（用括号）。中文回复。`
}

function ChatBubble({ msg, buddy, rc, isNew }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end', gap: 8,
      animation: isNew ? 'bubbleIn 0.3s ease-out' : undefined,
    }}>
      {!isUser && (
        <div style={{ flexShrink: 0 }}>
          <BuddySprite buddy={buddy} size="sm" animated={false} />
        </div>
      )}
      <div style={{
        maxWidth: 'min(72%, calc(100vw - 100px))',
        background: isUser ? '#1e3a5f' : '#0f1117',
        border: `1px solid ${isUser ? '#1d4ed844' : rc + '33'}`,
        borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        padding: '8px 12px',
        color: msg.isError ? '#ef4444' : '#e5e7eb',
        fontSize: '0.88rem',
        lineHeight: 1.6,
        wordBreak: 'break-word',
      }}>
        {!isUser && isNew && !msg.isStreaming ? (
          <TypewriterBubble text={msg.content} speed={35} />
        ) : (
          <>
            {msg.content}
            {msg.isStreaming && (
              <span style={{
                display: 'inline-block',
                width: '2px', height: '1em',
                background: '#22d3ee',
                marginLeft: 2,
                verticalAlign: 'text-bottom',
                animation: 'cursorBlink 0.8s step-end infinite',
              }} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ChatPage({ buddy, name }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCard, setShowCard] = useState(false)
  const [lastNewId, setLastNewId] = useState(null)
  const endRef = useRef(null)
  const abortRef = useRef(null)
  const rc = RARITY_COLORS[buddy.rarity]
  const systemPrompt = buildSystemPrompt(buddy, name)

  // 初始打招呼
  useEffect(() => {
    if (messages.length > 0) return
    sendToAI('用你的性格说一句开场白欢迎用户，1句话', true)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendToAI(text, isSystem = false) {
    if (!text.trim() || loading) return
    abortRef.current = new AbortController()

    const userMsg = isSystem ? null : { role: 'user', content: text, id: Date.now() }
    if (!isSystem) {
      setMessages(m => [...m, userMsg])
      setLastNewId(userMsg.id)
      setInput('')
    }
    setLoading(true)
    setError(null)

    const history = [
      ...messages.filter(m => !m.isGreeting).map(m => ({ role: m.role, content: m.content })),
      ...(isSystem ? [{ role: 'user', content: text }] : [{ role: 'user', content: text }]),
    ].slice(-12)

    const assistantId = Date.now() + 1
    setMessages(m => [...m, {
      role: 'assistant', content: '', id: assistantId,
      isGreeting: isSystem, isStreaming: true,
    }])

    const blocks = new Map()
    let accumulatedText = ''

    try {
      await fetchEventSource(`${SUPABASE_URL}/functions/v1/ai-chat-ab062132157f`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: history,
          model: 'openai/gpt-5.4',
          system: systemPrompt,
        }),
        signal: abortRef.current.signal,

        async onopen(response) {
          const ct = response.headers.get('content-type')
          if (!response.ok) {
            if (ct?.includes('text/event-stream')) {
              const text = await response.text()
              const m = text.match(/data: (.+)/)
              if (m) {
                try {
                  const d = JSON.parse(m[1])
                  if (d.error?.message) throw new Error(d.error.message)
                } catch (e) {
                  if (e.message && !e.message.includes('Unexpected token')) throw e
                }
              }
            }
            if (ct?.includes('application/json')) {
              const d = await response.json()
              throw new Error(d.error?.message || `请求失败: ${response.status}`)
            }
            throw new Error(`请求失败: ${response.status}`)
          }
        },

        onmessage(event) {
          if (!event.data) return
          const data = JSON.parse(event.data)

          if (data.type === 'error') {
            const msg = getUserErrorMessage(data.error?.type || 'api_error', data.error?.message)
            setError(msg)
            setMessages(prev => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              if (last?.role === 'assistant' && last.isStreaming) {
                last.content = `(歪头) ${msg}`
                last.isStreaming = false
                last.isError = true
              }
              return updated
            })
            setLoading(false)
            return
          }

          switch (data.type) {
            case 'content_block_start':
              blocks.set(data.index, { type: data.content_block.type, content: '' })
              break
            case 'content_block_delta': {
              const block = blocks.get(data.index)
              if (block?.type === 'text') {
                block.content += data.delta.text || ''
                accumulatedText = block.content
                setMessages(prev => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  if (last?.role === 'assistant') {
                    last.content = accumulatedText
                  }
                  return [...updated]
                })
              }
              break
            }
            case 'message_stop':
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last?.role === 'assistant') {
                  last.isStreaming = false
                }
                return [...updated]
              })
              setLastNewId(assistantId)
              break
          }
        },
        onerror(err) { throw err },
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errMsg = err.message || '发送失败'
        setError(errMsg)
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant' && last.isStreaming) {
            last.content = `(歪头) ${errMsg}`
            last.isStreaming = false
            last.isError = true
          }
          return [...updated]
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 52px)', height: 'calc(100dvh - 52px)',
      maxWidth: 600, margin: '0 auto',
    }}>
      {/* 顶部信息栏 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', borderBottom: '1px solid #1f2937',
        background: '#0a0a0f', flexShrink: 0,
      }}>
        <div style={{ flexShrink: 0 }}>
          <BuddySprite buddy={buddy} size="sm" animated />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            color: rc, fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700, fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {name}
          </div>
          <div style={{
            color: '#4b5563', fontSize: '0.72rem',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {buddy.rarity} {buddy.species}
          </div>
        </div>
        <button onClick={() => setShowCard(s => !s)}
          style={{
            ...bStyle('#374151'), padding: '4px 8px',
            fontSize: '0.72rem', width: 'auto', flexShrink: 0,
          }}>
          {showCard ? '隐藏' : '卡片'}
        </button>
      </div>

      {showCard && (
        <div style={{ padding: 12, borderBottom: '1px solid #1f2937', flexShrink: 0 }}>
          <BuddyCard buddy={buddy} name={name} compact />
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div style={{
          padding: '6px 12px', background: '#7f1d1d33', borderBottom: '1px solid #7f1d1d',
          color: '#fca5a5', fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace",
          flexShrink: 0,
        }}>
          {error}
        </div>
      )}

      {/* 消息列表 */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 12px',
        display: 'flex', flexDirection: 'column', gap: 12,
        WebkitOverflowScrolling: 'touch',
      }}>
        {messages.map(msg => (
          <ChatBubble
            key={msg.id}
            msg={msg}
            buddy={buddy}
            rc={rc}
            isNew={msg.id === lastNewId && !msg.isStreaming}
          />
        ))}
        {loading && !messages.some(m => m.isStreaming) && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ flexShrink: 0 }}>
              <BuddySprite buddy={buddy} size="sm" animated />
            </div>
            <div style={{
              background: '#0f1117', border: `1px solid ${rc}33`,
              borderRadius: '12px 12px 12px 2px', padding: '8px 14px',
              color: '#6b7280', fontSize: '0.85rem',
            }}>
              <span style={{ animation: 'pulse 1s infinite' }}>...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* 输入框 */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 12px',
        borderTop: '1px solid #1f2937', background: '#0a0a0f',
        flexShrink: 0,
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendToAI(input)}
          placeholder={`和 ${name} 说点什么...`}
          disabled={loading}
          style={{ ...iStyle, flex: 1, minWidth: 0 }}
        />
        <button onClick={() => sendToAI(input)} disabled={!input.trim() || loading}
          style={{ ...bStyle(rc), padding: '8px 14px', width: 'auto', flexShrink: 0 }}>
          {'>'}
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
