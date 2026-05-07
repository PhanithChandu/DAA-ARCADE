/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Node {
  r: number;
  c: number;
}

export interface PathStep {
  visited: Set<string>;
  frontier: Set<string>;
  path: Node[];
  distances: Record<string, number>;
  currentNode: Node | null;
}

export function* dijkstraGenerator(
  grid: number[][],
  start: Node,
  end: Node
): Generator<PathStep> {
  const rows = grid.length;
  const cols = grid[0].length;
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const frontier = new Set<string>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      distances[`${r},${c}`] = Infinity;
    }
  }

  distances[`${start.r},${start.c}`] = 0;
  frontier.add(`${start.r},${start.c}`);

  while (frontier.size > 0) {
    // Find node with minimum distance in frontier
    let currentKey = "";
    let minDist = Infinity;
    for (const key of frontier) {
      if (distances[key] < minDist) {
        minDist = distances[key];
        currentKey = key;
      }
    }

    const [cr, cc] = currentKey.split(',').map(Number);
    const currentNode = { r: cr, c: cc };

    if (cr === end.r && cc === end.c) {
      // Reconstruct path
      const path: Node[] = [];
      let temp: string | null = `${end.r},${end.c}`;
      while (temp) {
        const [tr, tc] = temp.split(',').map(Number);
        path.unshift({ r: tr, c: tc });
        temp = previous[temp] || null;
      }
      yield { visited, frontier, path, distances, currentNode };
      return;
    }

    frontier.delete(currentKey);
    visited.add(currentKey);

    const neighbors = [
      { r: cr - 1, c: cc },
      { r: cr + 1, c: cc },
      { r: cr, c: cc - 1 },
      { r: cr, c: cc + 1 },
    ];

    for (const n of neighbors) {
      if (n.r >= 0 && n.r < rows && n.c >= 0 && n.c < cols && grid[n.r][n.c] !== -1) {
        const nKey = `${n.r},${n.c}`;
        if (visited.has(nKey)) continue;

        const newDist = distances[currentKey] + grid[n.r][n.c];
        if (newDist < distances[nKey]) {
          distances[nKey] = newDist;
          previous[nKey] = currentKey;
          frontier.add(nKey);
        }
      }
    }

    yield { visited, frontier, path: [], distances, currentNode };
  }
}
