/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Item {
  id: number;
  weight: number;
  value: number;
  name: string;
}

export function solveKnapsack(items: Item[], capacity: number): { table: number[][]; selected: number[] } {
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (item.weight <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - item.weight] + item.value);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  const selected: number[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(items[i - 1].id);
      w -= items[i - 1].weight;
    }
  }

  return { table: dp, selected };
}

export function solveFractionalKnapsack(items: Item[], capacity: number): { totalValue: number; fractions: Record<number, number> } {
  const sorted = [...items].sort((a, b) => b.value / b.weight - a.value / a.weight);
  let remaining = capacity;
  let totalValue = 0;
  const fractions: Record<number, number> = {};

  for (const item of sorted) {
    if (remaining <= 0) break;
    if (item.weight <= remaining) {
      fractions[item.id] = 1;
      totalValue += item.value;
      remaining -= item.weight;
    } else {
      fractions[item.id] = remaining / item.weight;
      totalValue += item.value * fractions[item.id];
      remaining = 0;
    }
  }

  return { totalValue, fractions };
}
