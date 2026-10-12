import { describe, it, expect } from 'vitest';
import { getPartitions } from '../src/lib/partitions';

describe('partitions', () => {
  it('n=4 の自然数分割を降順で正しく生成する', () => {
    const partitions = getPartitions(4);
    expect(partitions).toEqual([
      [4],
      [3, 1],
      [2, 2],
      [2, 1, 1],
      [1, 1, 1, 1],
    ]);
  });

  it('maxPart の制約が機能する (maxPart=2)', () => {
    const partitions = getPartitions(4, 2);
    expect(partitions).toEqual([
      [2, 2],
      [2, 1, 1],
      [1, 1, 1, 1],
    ]);
  });
});
