import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// 全局重置样式
const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #050508; color: #e5e7eb; }
  input { outline: none; }
  button { cursor: pointer; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a0f; }
  ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  /* 粒子动画 */
  @keyframes particleBurst {
    0%   { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--px), var(--py)) scale(0); }
  }
  @keyframes burstLine {
    0%   { opacity: 1; transform: rotate(var(--angle, 0deg)) scaleY(0); }
    50%  { opacity: 1; transform: rotate(var(--angle, 0deg)) scaleY(1); }
    100% { opacity: 0; transform: rotate(var(--angle, 0deg)) scaleY(0.2) translateY(-30px); }
  }
  @keyframes ringExpand {
    0%   { opacity: 0.8; transform: translate(-50%, -50%) scale(0); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
    50%      { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
  }
  @keyframes revealScale {
    0%   { opacity: 0; transform: scale(0.5); }
    60%  { opacity: 1; transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmerMove {
    0%   { background-position: -200% -200%; }
    100% { background-position: 200% 200%; }
  }
  @keyframes legendaryRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes starBurst {
    0%   { opacity: 1; transform: translate(-50%, -50%) translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) translate(var(--sx), var(--sy)) scale(0.3); }
  }
  @keyframes cursorBlink {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0; }
  }
  @keyframes bubbleIn {
    0%   { opacity: 0; transform: translateY(8px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Mobile 优化 */
  @media (max-width: 480px) {
    body { font-size: 14px; -webkit-text-size-adjust: 100%; }
  }
`
document.head.appendChild(style)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
