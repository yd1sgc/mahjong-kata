import { describe, it, expect } from 'vitest';
import { analyzeMahjongHand, filterAndRecalculate } from '../src/lib/analyzer';
import { createSuitRange, createTile } from '../src/lib/tiles';

describe('analyzer', () => {
  it('K=3 (1p, 2p, 3p 各4枚), N=3 の全網羅計算が整合している', () => {
    const tiles = createSuitRange('pin', 1, 3, 4);
    const result = analyzeMahjongHand({ tiles, handSize: 3 });

    // 総組み合わせ数 C(12, 3) = 220
    expect(result.totalCombinations).toBe(220n);

    // 全パターンの組み合わせ数の合計が220であること
    const sumComb = result.shapes.reduce((acc, s) => acc + s.combinations, 0n);
    expect(sumComb).toBe(220n);

    // 全パターンの確率合計がほぼ1.0であること
    const sumProb = result.shapes.reduce((acc, s) => acc + s.probability, 0);
    expect(sumProb).toBeCloseTo(1.0, 5);

    // グループの組み合わせ合計も220であること
    const groupSumComb = result.distributionGroups.reduce(
      (acc, g) => acc + g.combinations,
      0n
    );
    expect(groupSumComb).toBe(220n);

    // [3]: C(3,1)*C(4,3) = 12
    // [2,1]: C(3,1)*C(4,2) * C(2,1)*C(4,1) = 3*6 * 2*4 = 144
    // [1,1,1]: C(4,1)^3 = 64
    const g3 = result.distributionGroups.find((g) => g.distribution.join(',') === '3');
    expect(g3?.combinations).toBe(12n);

    const g21 = result.distributionGroups.find((g) => g.distribution.join(',') === '2,1');
    expect(g21?.combinations).toBe(144n);

    const g111 = result.distributionGroups.find((g) => g.distribution.join(',') === '1,1,1');
    expect(g111?.combinations).toBe(64n);
  });

  it('枚数が不均一な場合（例: 3pが残り1枚）でも正確に計算できる', () => {
    // 1p:4, 2p:4, 3p:1, 合計9枚から3枚引く -> C(9, 3) = 84
    const tiles = [
      createTile('pin', 1, 4),
      createTile('pin', 2, 4),
      createTile('pin', 3, 1),
    ];
    const result = analyzeMahjongHand({ tiles, handSize: 3 });

    expect(result.totalCombinations).toBe(84n);

    const sumComb = result.shapes.reduce((acc, s) => acc + s.combinations, 0n);
    expect(sumComb).toBe(84n);

    const sumProb = result.shapes.reduce((acc, s) => acc + s.probability, 0);
    expect(sumProb).toBeCloseTo(1.0, 5);
  });

  it('フィルター機能（特定牌を含む、特定タグ）で正確に生存パターンを再計算できる', () => {
    const tiles = createSuitRange('pin', 1, 3, 4);
    const result = analyzeMahjongHand({ tiles, handSize: 3 });

    // 1p を含む手牌のみに絞り込む
    const filtered = filterAndRecalculate(result, {
      requiredTags: [],
      excludedTags: [],
      includeTileIds: ['1p'],
      excludeTileIds: [],
    });

    // 1p を含まない引き方は 2p, 3p (計8枚) から3枚引く C(8, 3) = 56通り
    // 1p を含む引き方は 220 - 56 = 164通り
    expect(filtered.filteredTotalCombinations).toBe(164n);

    // 生存牌姿の再計算された確率合計は 1.0 になること
    const sumProb = filtered.filteredShapes.reduce((acc, s) => acc + s.probability, 0);
    expect(sumProb).toBeCloseTo(1.0, 5);
  });
});
