/**
 * Orphan-free card grids. Use on a `grid sm:grid-cols-2 lg:grid-cols-6` container and add `bentoSpan(i, n)` to each item.
 * lg: rows of 3; a remainder of 1 becomes a 2x2 block, a remainder of 2 becomes two wide cards (never one lone card).
 * sm: an odd last card spans both columns.
 */
export const BENTO_GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-6'

export function bentoSpan(i: number, n: number): string {
  const r = n % 3
  const tail = n === 1 ? 1 : r === 1 ? 4 : r === 2 ? 2 : 0
  const wide = n === 1 || i >= n - tail
  const lg = n === 1 ? 'lg:col-span-6' : wide ? 'lg:col-span-3' : 'lg:col-span-2'
  return `${lg} sm:max-lg:[&:last-child:nth-child(odd)]:col-span-2`
}
