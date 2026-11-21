import type { Corners, Point } from '../types'

export function imageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('無法解碼圖片，請改用 JPG、PNG 或 WebP。')) }
    image.src = url
  })
}

export function canvasFromImage(image: HTMLImageElement, maxLongEdge = 1600) {
  const scale = Math.min(1, maxLongEdge / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('圖片編碼失敗。')), type, quality))
}

export function sortCorners(points: Point[]): Corners {
  const center = points.reduce((p, point) => ({ x: p.x + point.x / points.length, y: p.y + point.y / points.length }), { x: 0, y: 0 })
  const ordered = [...points].sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x))
  const topLeft = ordered.reduce((best, p) => p.x + p.y < best.x + best.y ? p : best, ordered[0])
  const start = ordered.indexOf(topLeft)
  const rotated = [...ordered.slice(start), ...ordered.slice(0, start)]
  if (rotated[1].x < rotated[3].x) [rotated[1], rotated[3]] = [rotated[3], rotated[1]]
  return rotated as Corners
}

export function polygonArea(points: Point[]) {
  return Math.abs(points.reduce((sum, point, index) => { const next = points[(index + 1) % points.length]; return sum + point.x * next.y - next.x * point.y }, 0) / 2)
}

export function isValidCorners(corners: Corners) {
  const area = polygonArea(corners)
  if (area < 0.02) return false
  for (let i = 0; i < 4; i += 1) {
    const a = corners[i], b = corners[(i + 1) % 4], c = corners[(i + 2) % 4]
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)
    if (cross <= 0) return false
  }
  return true
}

export function rotatePoint(point: Point, turns: number): Point {
  const n = ((turns % 4) + 4) % 4
  if (n === 1) return { x: 1 - point.y, y: point.x }
  if (n === 2) return { x: 1 - point.x, y: 1 - point.y }
  if (n === 3) return { x: point.y, y: 1 - point.x }
  return point
}
