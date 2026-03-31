import { useState, useEffect, useRef } from 'react'

export default function TypewriterBubble({ text, speed = 30, onComplete }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const textRef = useRef(text)

  useEffect(() => {
    // 如果文本变了（不应该发生），重置
    if (textRef.current !== text) {
      textRef.current = text
      indexRef.current = 0
      setDisplayed('')
      setDone(false)
    }

    if (done) return

    const id = setInterval(() => {
      indexRef.current++
      const next = text.slice(0, indexRef.current)
      setDisplayed(next)
      if (indexRef.current >= text.length) {
        clearInterval(id)
        setDone(true)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(id)
  }, [text, done, speed, onComplete])

  return (
    <span>
      {displayed}
      {!done && (
        <span style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          background: '#22d3ee',
          marginLeft: 2,
          verticalAlign: 'text-bottom',
          animation: 'cursorBlink 0.8s step-end infinite',
        }} />
      )}
    </span>
  )
}
