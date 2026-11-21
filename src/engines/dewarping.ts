/** Lightweight local nonlinear dewarping: horizontal row shifts approximate book-page curvature. */
export function dewarpCanvas(source: HTMLCanvasElement, strength: number) {
  const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height
  const context = canvas.getContext('2d')!; const amount = Math.max(0, Math.min(1, strength)) * source.width * .035
  const rows = Math.max(24, Math.round(source.height / 18))
  for (let row = 0; row < rows; row += 1) {
    const y = Math.round(row * source.height / rows); const h = Math.ceil(source.height / rows) + 1; const t = row / Math.max(1, rows - 1); const shift = Math.sin(t * Math.PI) * amount
    context.drawImage(source, 0, y, source.width, h, shift, y, source.width - shift * 2, h)
  }
  return canvas
}
