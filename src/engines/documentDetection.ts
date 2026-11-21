import type { Corners, Point } from '../types'
import { isValidCorners, polygonArea, sortCorners } from '../services/image'

export interface DetectionResult { corners: Corners; confidence: number; method: string; candidates: Array<{ corners: Corners; score: number }> }

function convexHull(points: Point[]) {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
  const cross = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const lower: Point[] = []
  for (const p of sorted) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p) }
  const upper: Point[] = []
  for (const p of [...sorted].reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p) }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

function fallbackCorners(width: number, height: number): Corners {
  const margin = 0.04
  return [{ x: margin, y: margin }, { x: 1 - margin, y: margin }, { x: 1 - margin, y: 1 - margin }, { x: margin, y: 1 - margin }]
}

/** Combination detector: luminance edge sampling + convex hull, with a safe manual rectangle fallback. */
export function detectDocument(canvas: HTMLCanvasElement): DetectionResult {
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return { corners: fallbackCorners(canvas.width, canvas.height), confidence: 0.12, method: 'manual fallback', candidates: [] }
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height)
  const stride = Math.max(2, Math.round(Math.max(width, height) / 520))
  const samples: Array<{ p: Point; edge: number }> = []
  const luminance = (x: number, y: number) => { const i = (y * width + x) * 4; return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2] }
  let mean = 0; let count = 0
  for (let y = stride; y < height - stride; y += stride) for (let x = stride; x < width - stride; x += stride) { mean += luminance(x, y); count += 1 }
  mean /= Math.max(1, count)
  const threshold = Math.max(18, Math.min(75, mean * 0.17))
  for (let y = stride; y < height - stride; y += stride) for (let x = stride; x < width - stride; x += stride) {
    const gx = Math.abs(luminance(x + stride, y) - luminance(x - stride, y))
    const gy = Math.abs(luminance(x, y + stride) - luminance(x, y - stride))
    const edge = gx + gy
    if (edge > threshold) samples.push({ p: { x: x / width, y: y / height }, edge })
  }
  const candidates: Array<{ corners: Corners; score: number }> = []
  const hull = convexHull(samples.map((sample) => sample.p))
  if (hull.length >= 4) {
    const extremes = [
      hull.reduce((a, p) => p.x + p.y < a.x + a.y ? p : a, hull[0]),
      hull.reduce((a, p) => p.x - p.y > a.x - a.y ? p : a, hull[0]),
      hull.reduce((a, p) => p.x + p.y > a.x + a.y ? p : a, hull[0]),
      hull.reduce((a, p) => p.y - p.x > a.y - a.x ? p : a, hull[0]),
    ]
    const corners = sortCorners(extremes)
    if (isValidCorners(corners)) {
      const area = polygonArea(corners)
      const borderPenalty = corners.reduce((sum, p) => sum + (p.x < 0.025 || p.x > .975 || p.y < .025 || p.y > .975 ? .04 : 0), 0)
      candidates.push({ corners, score: Math.max(0.16, Math.min(0.96, area * 1.8 - borderPenalty + Math.min(.3, samples.length / 3000))) })
    }
  }
  const fallback = fallbackCorners(width, height)
  candidates.push({ corners: fallback, score: 0.18 })
  candidates.sort((a, b) => b.score - a.score)
  const best = candidates[0]
  return { corners: best.corners, confidence: best.score, method: best.score > .5 ? '亮度邊緣與凸包' : '中央矩形候選，請確認四角', candidates: candidates.slice(0, 3) }
}
