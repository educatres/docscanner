import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import notoSansTcUrl from '@fontsource/noto-sans-tc/files/noto-sans-tc-chinese-traditional-400-normal.woff2?url'
import type { OcrResult } from '../types'
import { canvasToBlob } from '../services/image'

export async function canvasBlob(canvas: HTMLCanvasElement, type: 'image/jpeg' | 'image/png', quality: number) { return canvasToBlob(canvas, type, quality) }

export async function createPdf(pages: Array<{ canvas: HTMLCanvasElement; ocr?: OcrResult }>, quality = .9) {
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit)
  let font = await pdf.embedFont(StandardFonts.Helvetica)
  try { const fontBytes = await fetch(notoSansTcUrl).then((response) => response.arrayBuffer()); font = await pdf.embedFont(fontBytes) } catch { /* Keep ASCII Helvetica fallback when the bundled font cannot load. */ }
  for (const page of pages) {
    const blob = await canvasToBlob(page.canvas, 'image/jpeg', quality); const bytes = new Uint8Array(await blob.arrayBuffer()); const image = await pdf.embedJpg(bytes); const pdfPage = pdf.addPage([page.canvas.width, page.canvas.height]); pdfPage.drawImage(image, { x: 0, y: 0, width: page.canvas.width, height: page.canvas.height })
    if (page.ocr?.text) {
      const lines = page.ocr.text.split(/\r?\n/).filter(Boolean); const lineHeight = Math.max(10, page.canvas.height / 80)
      lines.slice(0, 200).forEach((line, index) => pdfPage.drawText(line.slice(0, 500), { x: 1, y: page.canvas.height - lineHeight * (index + 1), size: Math.max(6, lineHeight * .6), font, color: rgb(1, 1, 1), opacity: .01 }))
    }
  }
  const bytes = await pdf.save()
  return new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], { type: 'application/pdf' })
}

export function downloadBlob(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000) }
