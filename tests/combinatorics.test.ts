import { describe, it, expect } from 'vitest';
import { binomial, multinomialProduct } from '../src/lib/combinatorics';

describe('combinatorics', () => {
  it('二項係数 C(n, k) を正しく計算できる', () => {
    expect(binomial(4, 0)).toBe(1n);
    expect(binomial(4, 1)).toBe(4n);
    expect(binomial(4, 2)).toBe(6n);
    expect(binomial(4, 3)).toBe(4n);
    expect(binomial(4, 4)).toBe(1n);
    expect(binomial(12, 3)).toBe(220n);
    expect(binomial(16, 4)).toBe(1820n);
    expect(binomial(36, 4)).toBe(58905n);
  });

  it('境界条件で 0 を返す', () => {
    expect(binomial(4, -1)).toBe(0n);
    expect(binomial(4, 5)).toBe(0n);
  });

  it('multinomialProduct を正しく計算できる', () => {
    // 牌A(4枚)から2枚、牌B(4枚)から1枚引く -> C(4,2) * C(4,1) = 6 * 4 = 24
    expect(multinomialProduct([4, 4], [2, 1])).toBe(24n);
    // 牌A(4枚)から3枚 -> C(4,3) = 4
    expect(multinomialProduct([4, 4], [3, 0])).toBe(4n);
  });
});
