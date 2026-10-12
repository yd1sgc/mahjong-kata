import {
  TileType,
  HandShape,
  DistributionGroup,
  AnalysisParams,
  AnalysisResult,
  FilterCriteria,
} from '../types';
import { binomial, multinomialProduct } from './combinatorics';
import { analyzeHandFeatures } from './mahjong';

/**
 * およその出現頻度文字列（「〇回に1回」形式）を算出する
 */
export function formatFrequency(prob: number): string {
  if (prob <= 0) return 'なし (0%)';
  if (prob >= 1) return '確実 (1回に1回)';
  const times = 1 / prob;
  if (times < 1.05) return 'ほぼ毎回';
  if (times < 10) return `${times.toFixed(1)}回に1回`;
  if (times < 100) return `${Math.round(times)}回に1回`;
  return `${Math.round(times).toLocaleString()}回に1回`;
}

/**
 * 自然数分割から分かりやすいパターン名を生成する
 * 例: [2, 1, 1] -> "対子1 + 孤立2"
 *     [3, 1] -> "刻子1 + 孤立1"
 *     [4] -> "槓子(同一4枚)"
 *     [1, 1, 1, 1] -> "すべて異なる牌(孤立4)"
 *     [2, 2] -> "対子2"
 */
export function getDistributionPatternName(dist: number[]): string {
  const counts: { [num: number]: number } = {};
  for (const n of dist) {
    counts[n] = (counts[n] || 0) + 1;
  }

  const parts: string[] = [];
  if (counts[4]) parts.push(`槓子(4枚)×${counts[4]}`);
  if (counts[3]) parts.push(`刻子(3枚)×${counts[3]}`);
  if (counts[2]) parts.push(`対子(2枚)×${counts[2]}`);
  if (counts[1]) parts.push(`単牌(1枚)×${counts[1]}`);

  return parts.length > 0 ? parts.join(' + ') : '空';
}

/**
 * 指定した牌と手牌枚数から、作成可能なすべての手牌パターンを網羅して分析する
 */
export function analyzeMahjongHand(params: AnalysisParams): AnalysisResult {
  const { tiles, handSize } = params;
  const tileCounts = tiles.map((t) => t.count);
  const totalTilesInWall = tileCounts.reduce((acc, c) => acc + c, 0);

  // 全組み合わせ総数 C(全牌数, N)
  const totalCombinations = binomial(totalTilesInWall, handSize);

  if (totalCombinations === 0n || handSize <= 0) {
    return {
      params,
      totalCombinations: 0n,
      totalShapesCount: 0,
      shapes: [],
      distributionGroups: [],
      allTags: [],
    };
  }

  // 牌の引く枚数ベクトルの全列挙
  const rawShapes: { drawCounts: number[]; combinations: bigint }[] = [];

  function generateDraws(index: number, remainingToDraw: number, current: number[]) {
    if (index === tiles.length) {
      if (remainingToDraw === 0) {
        const comb = multinomialProduct(tileCounts, current);
        if (comb > 0n) {
          rawShapes.push({ drawCounts: [...current], combinations: comb });
        }
      }
      return;
    }

    const maxCanDraw = Math.min(tileCounts[index], remainingToDraw);
    // 残りの牌の最大可能枚数で枝刈り
    let remainingMaxTiles = 0;
    for (let j = index; j < tiles.length; j++) {
      remainingMaxTiles += tileCounts[j];
    }
    if (remainingMaxTiles < remainingToDraw) return;

    for (let draw = maxCanDraw; draw >= 0; draw--) {
      current.push(draw);
      generateDraws(index + 1, remainingToDraw - draw, current);
      current.pop();
    }
  }

  generateDraws(0, handSize, []);

  const allTagsSet = new Set<string>();
  const totalCombFloat = Number(totalCombinations);

  // 各牌姿の詳細情報（HandShape）を構築
  const shapes: HandShape[] = rawShapes.map((item) => {
    const { drawCounts, combinations } = item;

    // 手牌文字列と絵文字文字列の作成
    const tileParts: string[] = [];
    const emojiParts: string[] = [];
    for (let i = 0; i < tiles.length; i++) {
      for (let c = 0; c < drawCounts[i]; c++) {
        tileParts.push(tiles[i].label);
        emojiParts.push(tiles[i].emoji);
      }
    }

    const tileString = tileParts.join(' ');
    const emojiString = emojiParts.join('');

    // 自然数分割（引いた枚数の0を除いた降順配列）
    const distribution = drawCounts.filter((c) => c > 0).sort((a, b) => b - a);

    // 麻雀的特徴の抽出
    const features = analyzeHandFeatures(tiles, drawCounts);
    for (const t of features.tags) {
      allTagsSet.add(t);
    }

    const prob = totalCombFloat > 0 ? Number(combinations) / totalCombFloat : 0;
    const frequency = formatFrequency(prob);

    const id = tiles
      .map((t, i) => `${t.id}:${drawCounts[i]}`)
      .filter((_, i) => drawCounts[i] > 0)
      .join(',');

    return {
      id,
      drawCounts,
      distribution,
      tileString,
      emojiString,
      combinations,
      probability: prob,
      frequency,
      tags: features.tags,
      componentsSummary: features.summary,
    };
  });

  // 組み合わせ数の降順にソート
  shapes.sort((a, b) => (b.combinations > a.combinations ? 1 : b.combinations < a.combinations ? -1 : 0));

  // 自然数分割ごとのグルーピング集計
  const groupMap = new Map<string, { distribution: number[]; combinations: bigint; shapes: HandShape[] }>();

  for (const shape of shapes) {
    const key = shape.distribution.join('-');
    let group = groupMap.get(key);
    if (!group) {
      group = {
        distribution: shape.distribution,
        combinations: 0n,
        shapes: [],
      };
      groupMap.set(key, group);
    }
    group.combinations += shape.combinations;
    group.shapes.push(shape);
  }

  const distributionGroups: DistributionGroup[] = Array.from(groupMap.values()).map((g) => {
    const prob = totalCombFloat > 0 ? Number(g.combinations) / totalCombFloat : 0;
    return {
      distribution: g.distribution,
      patternName: getDistributionPatternName(g.distribution),
      combinations: g.combinations,
      probability: prob,
      frequency: formatFrequency(prob),
      shapes: g.shapes,
    };
  });

  // グループも組み合わせ数降順にソート
  distributionGroups.sort((a, b) =>
    b.combinations > a.combinations ? 1 : b.combinations < a.combinations ? -1 : 0
  );

  return {
    params,
    totalCombinations,
    totalShapesCount: shapes.length,
    shapes,
    distributionGroups,
    allTags: Array.from(allTagsSet).sort(),
  };
}

/**
 * フィルター条件を満たす牌姿のみを抽出し、生存した牌姿の確率を再計算する
 */
export function filterAndRecalculate(
  result: AnalysisResult,
  criteria: FilterCriteria
): {
  filteredShapes: HandShape[];
  filteredTotalCombinations: bigint;
  filteredGroups: DistributionGroup[];
} {
  const { shapes, params } = result;

  const filteredShapes = shapes.filter((shape) => {
    // 必須タグチェック
    for (const tag of criteria.requiredTags) {
      if (!shape.tags.includes(tag)) return false;
    }
    // 除外タグチェック
    for (const tag of criteria.excludedTags) {
      if (shape.tags.includes(tag)) return false;
    }

    // 必須牌IDチェック
    for (const tileId of criteria.includeTileIds) {
      const idx = params.tiles.findIndex((t) => t.id === tileId);
      if (idx === -1 || shape.drawCounts[idx] === 0) return false;
    }

    // 除外牌IDチェック
    for (const tileId of criteria.excludeTileIds) {
      const idx = params.tiles.findIndex((t) => t.id === tileId);
      if (idx !== -1 && shape.drawCounts[idx] > 0) return false;
    }

    // 正確な牌枚数指定チェック
    if (criteria.exactTileCounts) {
      for (const [tileId, count] of Object.entries(criteria.exactTileCounts)) {
        const idx = params.tiles.findIndex((t) => t.id === tileId);
        if (idx === -1 || shape.drawCounts[idx] !== count) return false;
      }
    }

    return true;
  });

  // 生存したパターンの合計組み合わせ数
  const filteredTotalCombinations = filteredShapes.reduce((acc, s) => acc + s.combinations, 0n);
  const totalCombFloat = Number(filteredTotalCombinations);

  // 生存した牌姿の確率を「フィルター後の生存全体に対する割合」として再計算
  const recalculatedShapes: HandShape[] = filteredShapes.map((shape) => {
    const prob = totalCombFloat > 0 ? Number(shape.combinations) / totalCombFloat : 0;
    return {
      ...shape,
      probability: prob,
      frequency: formatFrequency(prob),
    };
  });

  // グループも再集計
  const groupMap = new Map<string, { distribution: number[]; combinations: bigint; shapes: HandShape[] }>();
  for (const shape of recalculatedShapes) {
    const key = shape.distribution.join('-');
    let group = groupMap.get(key);
    if (!group) {
      group = {
        distribution: shape.distribution,
        combinations: 0n,
        shapes: [],
      };
      groupMap.set(key, group);
    }
    group.combinations += shape.combinations;
    group.shapes.push(shape);
  }

  const filteredGroups: DistributionGroup[] = Array.from(groupMap.values()).map((g) => {
    const prob = totalCombFloat > 0 ? Number(g.combinations) / totalCombFloat : 0;
    return {
      distribution: g.distribution,
      patternName: getDistributionPatternName(g.distribution),
      combinations: g.combinations,
      probability: prob,
      frequency: formatFrequency(prob),
      shapes: g.shapes,
    };
  });

  filteredGroups.sort((a, b) =>
    b.combinations > a.combinations ? 1 : b.combinations < a.combinations ? -1 : 0
  );

  return {
    filteredShapes: recalculatedShapes,
    filteredTotalCombinations,
    filteredGroups,
  };
}
