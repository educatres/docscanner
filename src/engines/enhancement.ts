import type { EnhancementSettings } from '../types'

function clamp(value: number) { return Math.max(0, Math.min(255, value)) }

export function enhanceCanvas(source: HTMLCanvasElement, settings: EnhancementSettings) {
  const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height
  const context = canvas.getContext('2d', { willReadFrequently: true })!; context.drawImage(source, 0, 0)
  const image = context.getImageData(0, 0, canvas.width, canvas.height); const { data, width, height } = image
  const radius = Math.max(1, Math.round(Math.min(width, height) / 120))
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4; let r = data[i], g = data[i + 1], b = data[i + 2]
    if (settings.mode === 'gray' || settings.mode === 'bw') { const gray = .299 * r + .587 * g + .114 * b; r = g = b = gray }
    const contrast = 1 + settings.contrast * 1.8; r = (r - 128) * contrast + 128 + settings.brightness * 80; g = (g - 128) * contrast + 128 + settings.brightness * 80; b = (b - 128) * contrast + 128 + settings.brightness * 80
    if (settings.whiteBalance) { const avg = (r + g + b) / 3; r += (avg - r) * settings.whiteBalance * .35; g += (avg - g) * settings.whiteBalance * .25; b += (avg - b) * settings.whiteBalance * .1 }
    data[i] = clamp(r); data[i + 1] = clamp(g); data[i + 2] = clamp(b)
  }
  if (settings.shadow > 0 || settings.denoise > 0 || settings.crease > 0) {
    const original = new Uint8ClampedArray(data)
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4; let local = 0; let samples = 0
      for (let oy = -radius; oy <= radius; oy += radius) for (let ox = -radius; ox <= radius; ox += radius) { const sx = Math.max(0, Math.min(width - 1, x + ox)); const sy = Math.max(0, Math.min(height - 1, y + oy)); const si = (sy * width + sx) * 4; local += (original[si] + original[si + 1] + original[si + 2]) / 3; samples += 1 }
      const background = local / samples; const strength = settings.shadow * .55 + settings.crease * .2
      const correction = (128 - background) * strength
      data[i] = clamp(data[i] + correction); data[i + 1] = clamp(data[i + 1] + correction); data[i + 2] = clamp(data[i + 2] + correction)
      if (settings.denoise > 0) { data[i] = data[i] * (1 - settings.denoise * .35) + original[i] * settings.denoise * .35; data[i + 1] = data[i + 1] * (1 - settings.denoise * .35) + original[i + 1] * settings.denoise * .35; data[i + 2] = data[i + 2] * (1 - settings.denoise * .35) + original[i + 2] * settings.denoise * .35 }
    }
  }
  if (settings.mode === 'bw') for (let i = 0; i < data.length; i += 4) { const gray = .299 * data[i] + .587 * data[i + 1] + .114 * data[i + 2]; const value = gray > 160 - settings.contrast * 35 ? 255 : 0; data[i] = value; data[i + 1] = value; data[i + 2] = value }
  if (settings.mode === 'smart') for (let i = 0; i < data.length; i += 4) { const gray = .299 * data[i] + .587 * data[i + 1] + .114 * data[i + 2]; const lift = Math.max(0, (gray - 128) * .12); data[i] = clamp(data[i] + lift); data[i + 1] = clamp(data[i + 1] + lift); data[i + 2] = clamp(data[i + 2] + lift) }
  context.putImageData(image, 0, 0)
  if (settings.sharpen > 0) {
    context.globalAlpha = Math.min(.8, settings.sharpen * .6); context.globalCompositeOperation = 'overlay'; context.drawImage(canvas, -1, -1); context.drawImage(canvas, 1, 1); context.globalAlpha = 1; context.globalCompositeOperation = 'source-over'
  }
  return canvas
}
