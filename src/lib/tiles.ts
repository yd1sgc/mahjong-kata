import { TileType, TileSuit } from '../types';

export const MAN_EMOJIS = ['🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏'];
export const PIN_EMOJIS = ['🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡'];
export const SOU_EMOJIS = ['🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘'];
export const HONOR_EMOJIS = ['🀀', '🀁', '🀂', '🀃', '🀆', '🀅', '🀄'];
export const HONOR_NAMES = ['東', '南', '西', '北', '白', '發', '中'];

export function createTile(
  suit: TileSuit,
  number: number,
  count: number = 4
): TileType {
  let id = '';
  let label = '';
  let emoji = '';

  if (suit === 'man') {
    id = `${number}m`;
    label = `${number}萬`;
    emoji = MAN_EMOJIS[number - 1] || '🀇';
  } else if (suit === 'pin') {
    id = `${number}p`;
    label = `${number}筒`;
    emoji = PIN_EMOJIS[number - 1] || '🀙';
  } else if (suit === 'sou') {
    id = `${number}s`;
    label = `${number}索`;
    emoji = SOU_EMOJIS[number - 1] || '🀐';
  } else {
    id = `${number}z`;
    label = HONOR_NAMES[number - 1] || `${number}字`;
    emoji = HONOR_EMOJIS[number - 1] || '🀀';
  }

  return { id, suit, number, count, label, emoji };
}

/**
 * 連続した数牌のセットを生成する（例: pin の 1〜4）
 */
export function createSuitRange(
  suit: TileSuit,
  start: number,
  end: number,
  defaultCount: number = 4
): TileType[] {
  const list: TileType[] = [];
  for (let n = start; n <= end; n++) {
    list.push(createTile(suit, n, defaultCount));
  }
  return list;
}

/**
 * 便利なプリセット定義
 */
export const TILE_PRESETS: { label: string; tiles: () => TileType[] }[] = [
  {
    label: '筒子 1〜4 (例: 1pと3pの筋分析など)',
    tiles: () => createSuitRange('pin', 1, 4),
  },
  {
    label: '筒子 1〜3 (3種)',
    tiles: () => createSuitRange('pin', 1, 3),
  },
  {
    label: '筒子 1〜5 (筋・周辺)',
    tiles: () => createSuitRange('pin', 1, 5),
  },
  {
    label: '萬子 1〜3 (3種)',
    tiles: () => createSuitRange('man', 1, 3),
  },
  {
    label: '萬子 1〜4 (4種)',
    tiles: () => createSuitRange('man', 1, 4),
  },
  {
    label: '索子 1〜4 (4種)',
    tiles: () => createSuitRange('sou', 1, 4),
  },
  {
    label: '全筒子 1〜9 (9種)',
    tiles: () => createSuitRange('pin', 1, 9),
  },
];
