import { TileType } from '../types';

export interface MahjongDecomposition {
  kotsu: string[];       // 刻子 (例: ["1p1p1p"])
  kanzi: string[];       // 槓子 (例: ["2p2p2p2p"])
  shuntsu: string[];     // 順子 (例: ["1p2p3p"])
  toitsu: string[];      // 対子 (例: ["3p3p"])
  ryanmen: string[];     // 両面 (例: ["2p3p"])
  penchan: string[];     // ペンチャン (例: ["1p2p", "8p9p"])
  kanchan: string[];     // カンチャン (例: ["1p3p"])
  isolated: string[];    // 孤立牌 (例: ["4p"])
}

export interface AnalysisFeatures {
  tags: string[];
  summary: string;
  decomposition: MahjongDecomposition;
}

/**
 * 手牌の牌構成を麻雀的に解析し、タグと要約を算出する
 */
export function analyzeHandFeatures(
  tiles: TileType[],
  drawCounts: number[]
): AnalysisFeatures {
  const tags: Set<string> = new Set();

  // 牌数カウントマップ
  const countsMap = new Map<string, number>();
  for (let i = 0; i < tiles.length; i++) {
    if (drawCounts[i] > 0) {
      countsMap.set(tiles[i].id, drawCounts[i]);
    }
  }

  // 1. 同一牌の枚数による判定（刻子・対子・槓子）
  let kotsuCount = 0;
  let toitsuCount = 0;
  let kanziCount = 0;
  const kotsuList: string[] = [];
  const kanziList: string[] = [];
  const toitsuList: string[] = [];

  for (let i = 0; i < tiles.length; i++) {
    const c = drawCounts[i];
    const t = tiles[i];
    if (c === 4) {
      kanziCount++;
      kanziList.push(`${t.id}x4`);
    } else if (c === 3) {
      kotsuCount++;
      kotsuList.push(`${t.id}x3`);
    } else if (c === 2) {
      toitsuCount++;
      toitsuList.push(`${t.id}x2`);
    }
  }

  if (kanziCount > 0) {
    tags.add('槓子(4枚)あり');
  }
  if (kotsuCount > 0 || kanziCount > 0) {
    tags.add('刻子あり');
  } else {
    tags.add('刻子なし');
  }

  if (toitsuCount > 0) {
    tags.add('対子あり');
    if (toitsuCount >= 2) tags.add('対子2組以上');
  } else {
    tags.add('対子なし');
  }

  // 2. 順子・塔子の判定（同色数牌の連続性）
  const shuntsuList: string[] = [];
  const ryanmenList: string[] = [];
  const penchanList: string[] = [];
  const kanchanList: string[] = [];

  // 数牌のグループごとにチェック
  const suitGroups: { [suit: string]: { number: number; tile: TileType; count: number }[] } = {};
  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i];
    const c = drawCounts[i];
    if (t.suit !== 'honor' && c > 0) {
      if (!suitGroups[t.suit]) suitGroups[t.suit] = [];
      suitGroups[t.suit].push({ number: t.number, tile: t, count: c });
    }
  }

  for (const suit of Object.keys(suitGroups)) {
    const group = suitGroups[suit];
    // 番号昇順ソート
    group.sort((a, b) => a.number - b.number);

    // 順子 (n, n+1, n+2) の存在確認
    for (let i = 0; i < group.length; i++) {
      const n1 = group[i];
      const n2 = group.find((x) => x.number === n1.number + 1);
      const n3 = group.find((x) => x.number === n1.number + 2);
      if (n2 && n3) {
        shuntsuList.push(`${n1.number}${n2.number}${n3.number}${suit[0]}`);
      }
    }

    // 塔子の存在確認
    for (let i = 0; i < group.length; i++) {
      const n1 = group[i];
      // 連続2枚 (n, n+1)
      const n2 = group.find((x) => x.number === n1.number + 1);
      if (n2) {
        if (n1.number === 1 || n2.number === 9) {
          penchanList.push(`${n1.number}${n2.number}${suit[0]}`);
        } else {
          ryanmenList.push(`${n1.number}${n2.number}${suit[0]}`);
        }
      }
      // 嵌張 1間あき (n, n+2)
      const n3 = group.find((x) => x.number === n1.number + 2);
      if (n3) {
        kanchanList.push(`${n1.number}${n3.number}${suit[0]}`);
      }
    }
  }

  if (shuntsuList.length > 0) {
    tags.add('順子あり');
  } else {
    tags.add('順子なし');
  }

  if (ryanmenList.length > 0) {
    tags.add('両面あり');
  }
  if (penchanList.length > 0) {
    tags.add('ペンチャンあり');
  }
  if (kanchanList.length > 0) {
    tags.add('カンチャンあり');
  }

  // 3. 孤立牌の算出（順子・塔子・対子・刻子いずれにも関与しない牌）
  const isolatedList: string[] = [];
  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i];
    const c = drawCounts[i];
    if (c === 1) {
      if (t.suit === 'honor') {
        isolatedList.push(t.id);
      } else {
        // 前後1〜2に他の牌があるか
        const hasAdjacent = tiles.some(
          (other, idx) =>
            drawCounts[idx] > 0 &&
            other.suit === t.suit &&
            (Math.abs(other.number - t.number) === 1 || Math.abs(other.number - t.number) === 2)
        );
        if (!hasAdjacent) {
          isolatedList.push(t.id);
        }
      }
    }
  }

  if (isolatedList.length > 0) {
    tags.add('完全孤立牌あり');
  } else {
    tags.add('孤立牌なし');
  }

  // 4. 要約文字列の作成
  const summaryParts: string[] = [];
  if (kanziList.length > 0) summaryParts.push(`槓子[${kanziList.join(',')}]`);
  if (kotsuList.length > 0) summaryParts.push(`刻子[${kotsuList.join(',')}]`);
  if (shuntsuList.length > 0) summaryParts.push(`順子[${shuntsuList.join(',')}]`);
  if (toitsuList.length > 0) summaryParts.push(`対子[${toitsuList.join(',')}]`);
  if (ryanmenList.length > 0) summaryParts.push(`両面[${ryanmenList.join(',')}]`);
  if (penchanList.length > 0) summaryParts.push(`辺張[${penchanList.join(',')}]`);
  if (kanchanList.length > 0) summaryParts.push(`嵌張[${kanchanList.join(',')}]`);
  if (isolatedList.length > 0) summaryParts.push(`孤立[${isolatedList.join(',')}]`);

  const summary = summaryParts.length > 0 ? summaryParts.join(' + ') : '単独構成';

  return {
    tags: Array.from(tags),
    summary,
    decomposition: {
      kotsu: kotsuList,
      kanzi: kanziList,
      shuntsu: shuntsuList,
      toitsu: toitsuList,
      ryanmen: ryanmenList,
      penchan: penchanList,
      kanchan: kanchanList,
      isolated: isolatedList,
    },
  };
}
