import { useEffect, useState } from 'react'
import { RARITY_COLORS } from '../buddy/data.js'

// 粒子配置：稀有度越高，粒子越多越炫
const RARITY_CONFIG = {
  common:    { count: 15,  burstCount: 0,  glowSize: 0,    ringCount: 0, shimmer: false },
  uncommon:  { count: 25,  burstCount: 6,  glowSize: 60,   ringCount: 0, shimmer: false },
  rare:      { count: 40,  burstCount: 10, glowSize: 100,  ringCount: 1, shimmer: true },
  epic:      { count: 60,  burstCount: 16, glowSize: 140,  ringCount: 2, shimmer: true },
  legendary: { count: 100, burstCount: 24, glowSize: 200,  ringCount: 3, shimmer: true },
}

function Particle({ color, delay, config, index }) {
  const angle = (index / config.count) * 360 + Math.random() * 30
  const dist = 40 + Math.random() * 120
  const size = 2 + Math.random() * 4
  const dur = 0.6 + Math.random() * 0.8

  return (
    <div style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      left: '50%',
      top: '50%',
      opacity: 0,
      boxShadow: `0 0 ${size * 2}px ${color}`,
      animation: `particleBurst ${dur}s ${delay + Math.random() * 0.3}s ease-out forwards`,
      '--px': `${Math.cos(angle * Math.PI / 180) * dist}px`,
      '--py': `${Math.sin(angle * Math.PI / 180) * dist}px`,
    }} />
  )
}

function BurstLine({ color, delay, index, total }) {
  const angle = (index / total) * 360
  const length = 20 + Math.random() * 40

  return (
    <div style={{
      position: 'absolute',
      width: 2,
      height: length,
      background: `linear-gradient(to bottom, ${color}, transparent)`,
      left: '50%',
      top: '50%',
      transformOrigin: 'top center',
      opacity: 0,
      transform: `rotate(${angle}deg)`,
      animation: `burstLine 0.6s ${delay}s ease-out forwards`,
    }} />
  )
}

function GlowRing({ color, size, delay, index }) {
  return (
    <div style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      border: `2px solid ${color}`,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%) scale(0)',
      opacity: 0,
      animation: `ringExpand 0.8s ${delay + index * 0.15}s ease-out forwards`,
    }} />
  )
}

export default function ParticleReveal({ rarity, active, children }) {
  const [showParticles, setShowParticles] = useState(false)
  const color = RARITY_COLORS[rarity]
  const config = RARITY_CONFIG[rarity]

  useEffect(() => {
    if (active) {
      setShowParticles(true)
      const t = setTimeout(() => setShowParticles(false), 2500)
      return () => clearTimeout(t)
    }
  }, [active])

  const isLegendary = rarity === 'legendary'

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 背景光晕 */}
      {active && config.glowSize > 0 && (
        <div style={{
          position: 'absolute',
          width: config.glowSize * 2,
          height: config.glowSize * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}30 0%, ${color}10 40%, transparent 70%)`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'glowPulse 1.5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Legendary 专属：旋转光环 */}
      {active && isLegendary && (
        <>
          <div style={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            border: '1px solid transparent',
            borderTopColor: color,
            borderRightColor: `${color}66`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'legendaryRotate 3s linear infinite',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: '50%',
            border: '1px solid transparent',
            borderBottomColor: `${color}88`,
            borderLeftColor: `${color}44`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'legendaryRotate 2s linear infinite reverse',
            pointerEvents: 'none',
          }} />
        </>
      )}

      {/* 粒子爆发 */}
      {showParticles && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 10 }}>
          {/* 散射粒子 */}
          {Array.from({ length: config.count }).map((_, i) => (
            <Particle key={`p-${i}`} color={color} delay={0} config={config} index={i} />
          ))}

          {/* 爆裂射线 */}
          {Array.from({ length: config.burstCount }).map((_, i) => (
            <BurstLine key={`b-${i}`} color={color} delay={0.1} index={i} total={config.burstCount} />
          ))}

          {/* 扩散环 */}
          {Array.from({ length: config.ringCount }).map((_, i) => (
            <GlowRing key={`r-${i}`} color={color} size={100 + i * 50} delay={0.2} index={i} />
          ))}

          {/* Legendary 额外金色星星粒子 */}
          {isLegendary && Array.from({ length: 20 }).map((_, i) => {
            const angle = Math.random() * 360
            const dist = 60 + Math.random() * 100
            return (
              <div key={`s-${i}`} style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                color: '#eab308',
                fontSize: `${8 + Math.random() * 8}px`,
                opacity: 0,
                animation: `starBurst 1s ${0.2 + Math.random() * 0.5}s ease-out forwards`,
                '--sx': `${Math.cos(angle * Math.PI / 180) * dist}px`,
                '--sy': `${Math.sin(angle * Math.PI / 180) * dist}px`,
                textShadow: '0 0 6px #eab308',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {['*', '+', '.'][Math.floor(Math.random() * 3)]}
              </div>
            )
          })}
        </div>
      )}

      {/* Shimmer 效果 */}
      {active && config.shimmer && (
        <div style={{
          position: 'absolute',
          inset: -4,
          borderRadius: 16,
          background: `linear-gradient(135deg, transparent 30%, ${color}15 50%, transparent 70%)`,
          backgroundSize: '200% 200%',
          animation: 'shimmerMove 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* 主内容 */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        animation: active ? 'revealScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : undefined,
      }}>
        {children}
      </div>
    </div>
  )
}
