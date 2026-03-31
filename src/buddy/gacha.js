import { mulberry32, hashString, pick } from './prng.js'
import {
  SALT, RARITIES, RARITY_WEIGHTS, RARITY_FLOOR,
  SPECIES_BY_RARITY, SPECIES_TRAITS, EYES, HATS_BY_RARITY, STAT_NAMES,
} from './data.js'

function rollRarity(rng) {
  let r = rng()
  for (const rarity of RARITIES) {
    r -= RARITY_WEIGHTS[rarity]
    if (r < 0) return rarity
  }
  return 'legendary'
}

function rollStats(rng, rarity) {
  const floor = RARITY_FLOOR[rarity]
  const peak  = pick(rng, STAT_NAMES)
  let   dump  = pick(rng, STAT_NAMES)
  while (dump === peak) dump = pick(rng, STAT_NAMES)

  const stats = {}
  for (const name of STAT_NAMES) {
    if      (name === peak) stats[name] = Math.min(100, floor + 50 + Math.floor(rng() * 30))
    else if (name === dump) stats[name] = Math.max(1,   floor - 10 + Math.floor(rng() * 15))
    else                    stats[name] = floor + Math.floor(rng() * 40)
  }
  return stats
}

// 离线 Soul（无 API Key 时使用）
export function generateSoulOffline(buddy, name) {
  const st    = buddy.stats
  const trait = SPECIES_TRAITS[buddy.species] || '独特的存在'
  const top   = Object.entries(st).sort((a, b) => b[1] - a[1])[0]
  const flavor = {
    DEBUGGING: `遇到问题必须追根溯源，bug 在它面前无所遁形（${top[1]} 分）。`,
    PATIENCE:  `等待对它来说不是煎熬，而是修炼，耐心值高达 ${top[1]} 分。`,
    CHAOS:     `行事不按套路出牌，${top[1]} 分的混乱让人捉摸不透却又着迷。`,
    WISDOM:    `说话不多但句句在理，${top[1]} 分的智慧藏在静默里。`,
    SNARK:     `嘴毒心软，${top[1]} 分的毒舌背后是最真实的关心。`,
  }[top[0]] || trait
  const shiny = buddy.shiny ? '✨ 作为闪光个体，散发着与众不同的光芒。' : ''
  return `${trait}。${flavor}${shiny}`
}

// 主抽卡函数 — 相同 userId 永远得到相同 Buddy
export function rollBuddy(userId) {
  const key    = userId + SALT
  const rng    = mulberry32(hashString(key))
  const rarity = rollRarity(rng)
  return {
    species: pick(rng, SPECIES_BY_RARITY[rarity]),
    rarity,
    eye:     pick(rng, EYES),
    hat:     pick(rng, HATS_BY_RARITY[rarity]),
    shiny:   rng() < 0.01,
    stats:   rollStats(rng, rarity),
    soul:    null,
  }
}

// 持久化
const SAVE_KEY = 'buddy_save'
export function saveBuddy(buddy, name, userId) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ buddy, name, userId }))
}
export function loadBuddy() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) } catch { return null }
}
export function clearBuddy() {
  localStorage.removeItem(SAVE_KEY)
}
