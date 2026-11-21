import type { OcrBlock, OcrResult } from '../types'

export async function runOcr(canvas: HTMLCanvasElement, languages: string[], revision: number, onProgress?: (value: number, status: string) => void): Promise<OcrResult> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker(languages.join('+'), 1, { logger: (message) => { if (typeof message.progress === 'number') onProgress?.(message.progress, message.status ?? 'OCR 處理中') } })
  try {
    const result = await worker.recognize(canvas)
    const blocks: OcrBlock[] = (result.data as any).blocks?.flatMap((block: any) => block.paragraphs?.flatMap((paragraph: any) => paragraph.lines?.map((line: any) => ({ text: line.text, confidence: line.confidence, bbox: line.bbox })) ?? []) ?? []) ?? []
    const confidence = typeof result.data.confidence === 'number' ? result.data.confidence : blocks.reduce((sum, block) => sum + block.confidence, 0) / Math.max(1, blocks.length)
    return { language: languages, text: result.data.text.trim(), blocks, basedOnRevision: revision, confidence, createdAt: Date.now() }
  } finally { await worker.terminate() }
}
