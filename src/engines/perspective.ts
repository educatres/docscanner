import type { Corners, Point } from '../types'
import { imageFromBlob } from '../services/image'

function solve8(matrix: number[][], values: number[]) {
  const a = matrix.map((row, i) => [...row, values[i]])
  for (let col = 0; col < 8; col += 1) {
    let pivot = col
    for (let row = col + 1; row < 8; row += 1) if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row
    if (Math.abs(a[pivot][col]) < 1e-10) throw new Error('透視矩陣無法求解。')
    ;[a[col], a[pivot]] = [a[pivot], a[col]]
    const div = a[col][col]
    for (let j = col; j <= 8; j += 1) a[col][j] /= div
    for (let row = 0; row < 8; row += 1) if (row !== col) {
      const factor = a[row][col]
      for (let j = col; j <= 8; j += 1) a[row][j] -= factor * a[col][j]
    }
  }
  return a.map((row) => row[8])
}

function homography(src: Corners, dst: Corners) {
  const matrix: number[][] = []; const values: number[] = []
  src.forEach((p, i) => {
    const q = dst[i]
    matrix.push([p.x, p.y, 1, 0, 0, 0, -q.x * p.x, -q.x * p.y]); values.push(q.x)
    matrix.push([0, 0, 0, p.x, p.y, 1, -q.y * p.x, -q.y * p.y]); values.push(q.y)
  })
  return [...solve8(matrix, values), 1]
}

function inverseProject(h: number[], x: number, y: number): Point {
  const d = h[6] * x + h[7] * y + 1
  return { x: (h[0] * x + h[1] * y + h[2]) / d, y: (h[3] * x + h[4] * y + h[5]) / d }
}

export function outputSize(corners: Corners, aspect: string) {
  const width = ((Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y) + Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y)) / 2)
  const height = ((Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y) + Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y)) / 2)
  const ratio = aspect === 'A4' ? 210 / 297 : aspect === 'A5' ? 148 / 210 : aspect === 'Letter' ? 8.5 / 11 : aspect === 'receipt' ? .42 : width / Math.max(.01, height)
  const longEdge = 1600
  return ratio >= 1 ? { width: longEdge, height: Math.round(longEdge / ratio) } : { width: Math.round(longEdge * ratio), height: longEdge }
}

export function warpCanvas(source: HTMLCanvasElement, corners: Corners, aspect: string, maxLongEdge = 1800) {
  const size = outputSize(corners, aspect)
  const scale = Math.min(1, maxLongEdge / Math.max(size.width, size.height))
  const width = Math.max(1, Math.round(size.width * scale)); const height = Math.max(1, Math.round(size.height * scale))
  const destination = document.createElement('canvas'); destination.width = width; destination.height = height
  const srcPixels = source.getContext('2d', { willReadFrequently: true })!.getImageData(0, 0, source.width, source.height)
  const out = destination.getContext('2d')!.createImageData(width, height)
  const dstCorners: Corners = [{ x: 0, y: 0 }, { x: width - 1, y: 0 }, { x: width - 1, y: height - 1 }, { x: 0, y: height - 1 }]
  const normalizedSrc: Corners = corners.map((p) => ({ x: p.x * (source.width - 1), y: p.y * (source.height - 1) })) as Corners
  const h = homography(dstCorners, normalizedSrc)
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const p = inverseProject(h, x, y); const ix = Math.max(0, Math.min(source.width - 1, Math.round(p.x))); const iy = Math.max(0, Math.min(source.height - 1, Math.round(p.y)))
    const si = (iy * source.width + ix) * 4; const di = (y * width + x) * 4
    out.data[di] = srcPixels.data[si]; out.data[di + 1] = srcPixels.data[si + 1]; out.data[di + 2] = srcPixels.data[si + 2]; out.data[di + 3] = 255
  }
  destination.getContext('2d')!.putImageData(out, 0, 0)
  return destination
}

export async function correctedCanvas(blob: Blob, corners: Corners, aspect: string) {
  const image = await imageFromBlob(blob); const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; canvas.getContext('2d')!.drawImage(image, 0, 0)
  return warpCanvas(canvas, corners, aspect)
}
