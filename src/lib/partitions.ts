/**
 * 自然数の分割（Integer Partitions）
 * 合計が n となり、各要素が maxPart 以下の降順配列をすべて生成する。
 * 例: n=4, maxPart=4 -> [[4], [3, 1], [2, 2], [2, 1, 1], [1, 1, 1, 1]]
 */
export function getPartitions(
  n: number,
  maxPart: number = n,
  maxTerms?: number
): number[][] {
  const results: number[][] = [];

  function backtrack(remaining: number, maxAllowed: number, current: number[]) {
    if (remaining === 0) {
      if (maxTerms === undefined || current.length <= maxTerms) {
        results.push([...current]);
      }
      return;
    }
    if (maxTerms !== undefined && current.length >= maxTerms) {
      return;
    }

    const upper = Math.min(remaining, maxAllowed);
    for (let part = upper; part >= 1; part--) {
      current.push(part);
      backtrack(remaining - part, part, current);
      current.pop();
    }
  }

  backtrack(n, maxPart, []);
  return results;
}
