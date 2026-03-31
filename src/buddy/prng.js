// Mulberry32 PRNG — 与 Python 版完全一致的确定性随机数生成器
export function mulberry32(seed) {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 简单 32-bit hash（djb2 变体，与 Python SHA-256 不同但同样确定性）
export function hashString(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0
  }
  return h
}

export function pick(rng, arr) {
  return arr[Math.min(Math.floor(rng() * arr.length), arr.length - 1)]
}
