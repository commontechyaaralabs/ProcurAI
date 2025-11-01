export function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function bucketize(n: number, buckets: number[]) {
  // returns index of first bucket boundary >= n
  for (let i = 0; i < buckets.length; i++) if (n <= buckets[i]) return i;
  return buckets.length; // overflow bucket
}

