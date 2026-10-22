// Fingerprint engine: 64-bit hashes, popcount Hamming distance, LSH banding,
// connected components + greedy label-propagation community detection.
// Mirrors the planned native "constellation_core" semantics in TypeScript.

export type U64 = bigint;

/** FNV-1a 64-bit over a string — deterministic cross-run fingerprinting. */
export function fnv1a64(input: string): string {
  let h = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < input.length; i++) {
    h ^= BigInt(input.charCodeAt(i));
    h = (h * prime) & 0xffffffffffffffffn;
  }
  return h.toString(16).padStart(16, "0");
}

/** Flip `bits` lowest-distinct bits of a hex hash — simulates perceptual near-duplicates. */
export function perturbHash(hex: string, bits: number, seed: number): string {
  let h = BigInt("0x" + hex);
  let rng = seed;
  for (let i = 0; i < bits; i++) {
    rng = (rng * 6364136223846793005n + 1442695040888963407n) & 0xffffffffffffffffn;
    const pos = (rng >> 33n) % 64n;
    h ^= 1n << pos;
  }
  return h.toString(16).padStart(16, "0");
}

const B64 = 0xffffffffffffffffn;

export function popcount64(x: bigint): number {
  // SWAR popcount on 64-bit
  x = (x & 0x5555555555555555n) + ((x >> 1n) & 0x5555555555555555n);
  x = (x & 0x3333333333333333n) + ((x >> 2n) & 0x3333333333333333n);
  x = (x + (x >> 4n)) & 0x0f0f0f0f0f0f0f0fn;
  return Number((x * 0x0101010101010101n & B64) >> 56n);
}

/** Hamming distance between two 16-hex-digit hashes. */
export function hammingDistance(a: string, b: string): number {
  if (a.length !== 16 || b.length !== 16) throw new Error("hash must be 16 hex digits");
  return popcount64((BigInt("0x" + a) ^ BigInt("0x" + b)) & B64);
}

const MAX_MATCH_DISTANCE = 8;

// ---- LSH: 4 bands x 16 bits ----
export const LSH_BANDS = 4;

export function lshBands(hex: string): string[] {
  const h = BigInt("0x" + hex);
  const bands: string[] = [];
  for (let b = 0; b < LSH_BANDS; b++) {
    bands.push(((h >> BigInt(b * 16)) & 0xffffn).toString(16).padStart(4, "0"));
  }
  return bands;
}

/** Build a band->bucket index for near-duplicate lookup. */
export function buildLshIndex<T extends { hash: string; id: string }>(items: T[]) {
  const index = new Map<string, string[]>();
  for (const item of items) {
    const bands = lshBands(item.hash);
    for (const band of bands) {
      const bucket = index.get(band);
      if (bucket) bucket.push(item.id);
      else index.set(band, [item.id]);
    }
  }
  return index;
}

/** Find near-duplicate ids for a query hash via the band index, then verify by popcount. */
export function lshQuery<T extends { hash: string; id: string }>(
  index: Map<string, string[]>,
  items: Map<string, T>,
  queryHash: string,
  maxDistance = MAX_MATCH_DISTANCE,
): { id: string; distance: number }[] {
  const candidates = new Set<string>();
  for (const band of lshBands(queryHash)) {
    for (const id of index.get(band) ?? []) candidates.add(id);
  }
  const out: { id: string; distance: number }[] = [];
  for (const id of candidates) {
    const item = items.get(id);
    if (!item) continue;
    const d = hammingDistance(queryHash, item.hash);
    if (d <= maxDistance) out.push({ id, distance: d });
  }
  return out.sort((x, y) => x.distance - y.distance);
}

/** Connected components over an undirected edge list of string ids. */
export function connectedComponents(
  nodes: string[],
  edges: { a: string; b: string }[],
): string[][] {
  const parent = new Map<string, string>();
  for (const n of nodes) parent.set(n, n);
  const find = (x: string): string => {
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    while (parent.get(x) !== root) {
      const next = parent.get(x)!;
      parent.set(x, root);
      x = next;
    }
    return root;
  };
  for (const e of edges) {
    const ra = find(e.a);
    const rb = find(e.b);
    if (ra !== rb) parent.set(ra, rb);
  }
  const groups = new Map<string, string[]>();
  for (const n of nodes) {
    const root = find(n);
    const g = groups.get(root);
    if (g) g.push(n);
    else groups.set(root, [n]);
  }
  return [...groups.values()];
}

/**
 * Label propagation community detection over the weighted graph — a
 * lightweight stand-in for Louvain on the small prototype graph.
 */
export function detectCommunities(
  nodes: string[],
  edges: { a: string; b: string; weight?: number }[],
): Map<string, string> {
  const adj = new Map<string, Map<string, number>>();
  for (const n of nodes) adj.set(n, new Map());
  for (const e of edges) {
    const w = e.weight ?? 1;
    adj.get(e.a)!.set(e.b, (adj.get(e.a)!.get(e.b) ?? 0) + w);
    adj.get(e.b)!.set(e.a, (adj.get(e.b)!.get(e.a) ?? 0) + w);
  }
  const label = new Map<string, string>();
  nodes.forEach((n, i) => label.set(n, n));
  for (let iter = 0; iter < 12; iter++) {
    let changed = false;
    for (const n of nodes) {
      const counts = new Map<string, number>();
      for (const [nb, w] of adj.get(n)!) {
        const l = label.get(nb)!;
        counts.set(l, (counts.get(l) ?? 0) + w);
      }
      if (counts.size === 0) continue;
      let best = "";
      let bestCount = -1;
      for (const [l, c] of counts) {
        if (c > bestCount || (c === bestCount && l < best)) {
          best = l;
          bestCount = c;
        }
      }
      if (best && best !== label.get(n)) {
        label.set(n, best);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return label;
}
