const memo = new Map<string, bigint>();

/**
 * 二項係数 C(n, k) を bigint で計算する（メモ化済み）
 */
export function binomial(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  if (k === 0 || k === n) return 1n;
  // 対称性を利用して計算量を削減
  const kk = k > n - k ? n - k : k;
  const key = `${n},${kk}`;
  if (memo.has(key)) return memo.get(key)!;
  const result = binomial(n - 1, kk - 1) + binomial(n - 1, kk);
  memo.set(key, result);
  return result;
}

/**
 * 多項係数の積: ∏ C(c_i, n_i)
 * tileCounts[i] 枚ある牌から n_i 枚引く組み合わせの積
 */
export function multinomialProduct(
  tileCounts: number[],
  drawCounts: number[]
): bigint {
  let result = 1n;
  for (let i = 0; i < tileCounts.length; i++) {
    result *= binomial(tileCounts[i], drawCounts[i]);
    if (result === 0n) return 0n;
  }
  return result;
}
