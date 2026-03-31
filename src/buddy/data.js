// ── 物种 / 稀有度 / 属性 ──────────────────────────────────────────────────────

export const SALT = 'friend-2026-401'

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary']
export const RARITY_WEIGHTS = { common: 0.60, uncommon: 0.25, rare: 0.10, epic: 0.04, legendary: 0.01 }
export const RARITY_FLOOR   = { common: 5, uncommon: 15, rare: 25, epic: 35, legendary: 50 }

export const RARITY_COLORS = {
  common:    '#9ca3af',
  uncommon:  '#22c55e',
  rare:      '#3b82f6',
  epic:      '#a855f7',
  legendary: '#eab308',
}
export const RARITY_EMOJI = {
  common: '⬜', uncommon: '🟩', rare: '🟦', epic: '🟪', legendary: '🟨',
}

export const SPECIES_BY_RARITY = {
  common:    ['duck', 'goose', 'blob', 'cat', 'penguin', 'turtle'],
  uncommon:  ['octopus', 'owl', 'snail', 'rabbit'],
  rare:      ['dragon', 'ghost', 'axolotl'],
  epic:      ['capybara', 'robot', 'mushroom'],
  legendary: ['cactus', 'chonk'],
}

export const SPECIES_TRAITS = {
  duck:     '总是充满自信，虽然方向感很差',
  goose:    '傲娇，但其实在乎你',
  blob:     '软乎乎的，对一切都很好奇',
  cat:      '高冷，偶尔赏脸给你回应',
  penguin:  '做事认真，有点社恐',
  turtle:   '慢慢来，但从不放弃',
  octopus:  '同时想七件事，有点混乱',
  owl:      '博学，喜欢卖弄知识',
  snail:    '超级佛系，人生苦短慢慢来',
  rabbit:   '精力旺盛，停不下来',
  dragon:   '威风凛凛，其实有点中二',
  ghost:    '神出鬼没，偶尔吓你一跳',
  axolotl:  '无论发生什么都能再生，乐观到离谱',
  capybara: '万物皆可躺平，自带治愈光环',
  robot:    '逻辑清晰，偶尔短路',
  mushroom: '沉默是金，但说出来就是名言',
  cactus:   '扎人但护主，刺得有理由',
  chonk:    '胖乎乎，吃就完了，从不内耗',
}

export const EYES  = ['·', '✦', '×', '◉', '@', '°']
export const HATS  = ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck']
export const HATS_BY_RARITY = {
  common:    ['none', 'crown', 'tophat'],
  uncommon:  ['none', 'crown', 'tophat', 'propeller', 'halo'],
  rare:      ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard'],
  epic:      ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie'],
  legendary: ['none', 'crown', 'tophat', 'propeller', 'halo', 'wizard', 'beanie', 'tinyduck'],
}

export const STAT_NAMES = ['DEBUGGING', 'PATIENCE', 'CHAOS', 'WISDOM', 'SNARK']
