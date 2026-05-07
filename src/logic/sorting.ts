/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  pivots: number[];
  sortedIndices: Set<number>;
}

export function* bubbleSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const n = array.length;
  const sortedIndices = new Set<number>();

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      yield { array: [...array], comparing: [j, j + 1], swapping: [], pivots: [], sortedIndices: new Set(sortedIndices) };
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        yield { array: [...array], comparing: [], swapping: [j, j + 1], pivots: [], sortedIndices: new Set(sortedIndices) };
      }
    }
    sortedIndices.add(n - i - 1);
  }
  yield { array: [...array], comparing: [], swapping: [], pivots: [], sortedIndices };
}

export function* quickSort(arr: number[]): Generator<SortStep> {
  const array = [...arr];
  const sortedIndices = new Set<number>();

  function* sort(low: number, high: number): Generator<SortStep> {
    if (low < high) {
      const pIdx = yield* partition(low, high);
      sortedIndices.add(pIdx);
      yield* sort(low, pIdx - 1);
      yield* sort(pIdx + 1, high);
    } else if (low === high) {
      sortedIndices.add(low);
      yield { array: [...array], comparing: [], swapping: [], pivots: [], sortedIndices: new Set(sortedIndices) };
    }
  }

  function* partition(low: number, high: number): Generator<SortStep, number> {
    const pivot = array[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      yield { array: [...array], comparing: [j, high], swapping: [], pivots: [high], sortedIndices: new Set(sortedIndices) };
      if (array[j] < pivot) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        yield { array: [...array], comparing: [], swapping: [i, j], pivots: [high], sortedIndices: new Set(sortedIndices) };
      }
    }
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    yield { array: [...array], comparing: [], swapping: [i + 1, high], pivots: [high], sortedIndices: new Set(sortedIndices) };
    return i + 1;
  }

  yield* sort(0, array.length - 1);
  yield { array: [...array], comparing: [], swapping: [], pivots: [], sortedIndices };
}
