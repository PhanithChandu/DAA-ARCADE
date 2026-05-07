/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HuffmanNode {
  char: string | null;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  id: string;
}

export function buildHuffmanTree(frequencies: Record<string, number>): HuffmanNode {
  let nodes: HuffmanNode[] = Object.entries(frequencies).map(([char, freq]) => ({
    char,
    freq,
    left: null,
    right: null,
    id: char
  }));

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    const newNode: HuffmanNode = {
      char: null,
      freq: left.freq + right.freq,
      left,
      right,
      id: `${left.id}+${right.id}`
    };
    nodes.push(newNode);
  }

  return nodes[0];
}

export function getHuffmanCodes(node: HuffmanNode, prefix: string = '', codes: Record<string, string> = {}): Record<string, string> {
  if (node.char !== null) {
    codes[node.char] = prefix || '0';
  } else {
    if (node.left) getHuffmanCodes(node.left, prefix + '0', codes);
    if (node.right) getHuffmanCodes(node.right, prefix + '1', codes);
  }
  return codes;
}
