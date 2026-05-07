/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SolverStep {
  board: number[]; // row index -> col index
  currentRow: number;
  currentCol: number;
  isSafe: boolean;
  isPlaced: boolean;
  isBacktracking: boolean;
}

export function isSafe(board: number[], row: number, col: number): boolean {
  for (let i = 0; i < board.length; i++) {
    if (i === row) continue;
    const placedCol = board[i];
    if (placedCol === -1) continue;

    // Same column
    if (placedCol === col) return false;
    
    // Diagonals
    const rowDiff = Math.abs(row - i);
    const colDiff = Math.abs(col - placedCol);
    if (rowDiff === colDiff) return false;
  }
  return true;
}

export function* solveNQueensGenerator(n: number): Generator<SolverStep> {
  const board = Array(n).fill(-1);

  function* backtrack(row: number): Generator<SolverStep, boolean> {
    if (row === n) return true;

    for (let col = 0; col < n; col++) {
      // Step: Testing a cell
      yield {
        board: [...board],
        currentRow: row,
        currentCol: col,
        isSafe: isSafe(board, row, col),
        isPlaced: false,
        isBacktracking: false,
      };

      if (isSafe(board, row, col)) {
        board[row] = col;
        
        // Step: Placed queen
        yield {
          board: [...board],
          currentRow: row,
          currentCol: col,
          isSafe: true,
          isPlaced: true,
          isBacktracking: false,
        };

        if (yield* backtrack(row + 1)) return true;

        // Step: Backtracking from this path
        const oldCol = board[row];
        board[row] = -1;
        yield {
          board: [...board],
          currentRow: row,
          currentCol: oldCol,
          isSafe: false,
          isPlaced: false,
          isBacktracking: true,
        };
      }
    }
    return false;
  }

  yield* backtrack(0);
}

// Simple recursive solver to check if user's placement is valid so far
export function solveOne(n: number, currentBoard: number[]): number[] | null {
  const board = [...currentBoard];
  const startRow = board.findIndex(v => v === -1);
  if (startRow === -1) return board;

  function solve(row: number): boolean {
    if (row === n) return true;
    
    for (let col = 0; col < n; col++) {
      if (isSafe(board, row, col)) {
        board[row] = col;
        if (solve(row + 1)) return true;
        board[row] = -1;
      }
    }
    return false;
  }

  if (solve(startRow)) return board;
  return null;
}
