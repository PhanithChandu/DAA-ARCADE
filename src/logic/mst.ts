/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Edge {
  u: number;
  v: number;
  weight: number;
}

export interface MSTStep {
  mst: Edge[];
  visitedNodes: Set<number>;
  currentEdges: Edge[];
  totalWeight: number;
}

export function* primsGenerator(nodes: number, edges: Edge[]): Generator<MSTStep> {
  const adj: Record<number, { v: number; w: number }[]> = {};
  for (const { u, v, weight } of edges) {
    if (!adj[u]) adj[u] = [];
    if (!adj[v]) adj[v] = [];
    adj[u].push({ v, w: weight });
    adj[v].push({ v: u, w: weight });
  }

  const visited = new Set<number>();
  const mst: Edge[] = [];
  let totalWeight = 0;
  
  // Start from node 0
  visited.add(0);
  
  while (visited.size < nodes) {
    let minEdge: Edge | null = null;
    let candidates: Edge[] = [];

    visited.forEach(u => {
      (adj[u] || []).forEach(({ v, w }) => {
        if (!visited.has(v)) {
          candidates.push({ u, v, weight: w });
          if (!minEdge || w < minEdge.weight) {
            minEdge = { u, v, weight: w };
          }
        }
      });
    });

    yield { mst: [...mst], visitedNodes: new Set(visited), currentEdges: candidates, totalWeight };

    if (!minEdge) break;

    mst.push(minEdge);
    totalWeight += minEdge.weight;
    visited.add(minEdge.v);

    yield { mst: [...mst], visitedNodes: new Set(visited), currentEdges: [], totalWeight };
  }
}
