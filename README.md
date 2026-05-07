# DAA Arcade 🎮

> An interactive mini-game collection to learn **Design & Analysis of Algorithms** through visuals and hands-on play. Pick a module, tweak the inputs, and watch the algorithm work — step by step.

🔗 **Live Demo:** [daa-arcade.vercel.app](https://daa-arcade.vercel.app)
📦 **Tech:** React · TypeScript · Vite · Tailwind CSS

---

## Table of Contents

- [Overview](#overview)
- [Games & Algorithms](#games--algorithms)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Build & Preview](#build--preview)
- [Algorithms Reference](#algorithms-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

DAA Arcade turns abstract algorithm concepts into interactive, visual experiences. Each game module targets a core topic from Design & Analysis of Algorithms — graph traversal, dynamic programming, greedy methods, backtracking, and more — and visualises how the algorithm thinks its way to a solution.

No API keys. No backend. Just run it locally and start learning.

---

## Games & Algorithms

### 🗺️ Shortest Path Maze — Dijkstra's Algorithm
`src/games/Pathfinding.tsx` · `src/logic/shortestPath.ts`

Build or modify a maze with weighted terrain and watch Dijkstra's algorithm compute the optimal path from source to destination in real time. Demonstrates greedy shortest-path selection and priority queue mechanics.

---

### 🎒 Knapsack Ops — 0/1 Knapsack (Dynamic Programming)
`src/games/Knapsack.tsx` · `src/logic/knapsack.ts`

Choose items with different weights and values, set a capacity limit, and visualise the dynamic programming table being filled row by row. Understand how optimal substructure and overlapping subproblems lead to the best selection.

---

### ⚔️ Sorting Warriors — Sorting Algorithms & Complexity
`src/games/Sorting.tsx` · `src/logic/sorting.ts`

Compare sorting strategies side by side — Bubble Sort, Quick Sort, and more — as they operate on the same input array. Builds intuition for time complexity differences through direct visual comparison.

---

### 🌐 Prime Network — Minimum Spanning Tree (Prim's Algorithm)
`src/games/MST.tsx` · `src/logic/mst.ts`

Connect a set of nodes at the minimum possible total edge cost. Watch Prim's algorithm grow the spanning tree one edge at a time, illustrating greedy selection and the cut property of MSTs.

---

### 📡 Huffman Morse — Huffman Coding (Greedy)
`src/games/Huffman.tsx` · `src/logic/huffman.ts`

Enter a string and watch a Huffman tree get built from the character frequency table. Observe how the greedy merging of least-frequent nodes produces an optimal prefix-free code and compresses the input.

---

### 👑 The N-Queens Defense — Backtracking
`src/games/NQueens.tsx` · `src/logic/nqueens.ts`

Place N queens on an N×N chessboard so that no two queens threaten each other. The visualiser steps through every placement attempt and backtrack, making the search tree and constraint propagation tangible.

---

## Project Structure

```
DAA-ARCADE/
├── src/
│   ├── games/                  # React UI components — one per algorithm game
│   │   ├── Pathfinding.tsx     # Dijkstra maze game
│   │   ├── Knapsack.tsx        # 0/1 Knapsack DP game
│   │   ├── Sorting.tsx         # Sorting comparison game
│   │   ├── MST.tsx             # Prim's MST game
│   │   ├── Huffman.tsx         # Huffman coding game
│   │   └── NQueens.tsx         # N-Queens backtracking game
│   └── logic/                  # Pure algorithm implementations (no UI)
│       ├── shortestPath.ts     # Dijkstra's algorithm
│       ├── knapsack.ts         # 0/1 Knapsack dynamic programming
│       ├── sorting.ts          # Sorting algorithm suite
│       ├── mst.ts              # Prim's minimum spanning tree
│       ├── huffman.ts          # Huffman tree construction
│       └── nqueens.ts          # N-Queens backtracking solver
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

The architecture keeps algorithm logic strictly separated from the UI layer — `src/logic/` contains pure TypeScript functions with no React dependencies, making them independently testable and reusable.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React + TypeScript | Component UI and type-safe algorithm logic |
| Vite | Fast dev server and optimised production bundler |
| Tailwind CSS | Utility-first styling |
| Motion | Step-by-step algorithm animations |
| Lucide React | Icon set |

---

## Getting Started

### Prerequisites

- **Node.js** — current LTS version recommended ([nodejs.org](https://nodejs.org))

### Installation

```bash
# Clone the repository
git clone https://github.com/PhanithChandu/DAA-ARCADE.git
cd DAA-ARCADE

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> No API keys or environment variables are required. The app runs entirely client-side.

---

## Build & Preview

```bash
# Create an optimised production build
npm run build

# Serve the production build locally to verify it
npm run preview
```

The `dist/` folder contains the production-ready static output, deployable to any static host — Vercel, Netlify, GitHub Pages, etc.

---

## Algorithms Reference

| Module | Algorithm | Paradigm | Time Complexity |
|---|---|---|---|
| Shortest Path Maze | Dijkstra's | Greedy | O((V + E) log V) |
| Knapsack Ops | 0/1 Knapsack | Dynamic Programming | O(n × W) |
| Sorting Warriors | Bubble / Quick Sort | Comparison-based | O(n²) / O(n log n) avg |
| Prime Network | Prim's MST | Greedy | O(E log V) |
| Huffman Morse | Huffman Coding | Greedy | O(n log n) |
| N-Queens Defense | Backtracking | Exhaustive Search | O(n!) |

---

## Contributing

Contributions are welcome — new algorithm modules, improved visualisations, or bug fixes.

```bash
# Fork the repo and create a feature branch
git checkout -b feature/new-algorithm-game

# Commit your changes
git commit -m "feat: add Floyd-Warshall all-pairs shortest path game"

# Push and open a pull request
git push origin feature/new-algorithm-game
```

**Guidelines for new modules:**
- Add algorithm logic to `src/logic/yourAlgorithm.ts` as a pure TypeScript function — no React imports
- Add the React visualisation to `src/games/YourGame.tsx`
- Register the new game in the main menu

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<p align="center">Built with React + TypeScript · Visualising DAA one algorithm at a time</p>
