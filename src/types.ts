export type Point = { x: number; y: number }
export type Corners = [Point, Point, Point, Point]
export type Aspect = 'auto' | 'A4' | 'A5' | 'Letter' | 'receipt' | 'free'
export type FilterMode = 'color' | 'gray' | 'bw' | 'smart'
export type CameraFacing = 'environment' | 'user'

export interface GeometrySettings {
  rotationDeg: number
  keystoneX: number
  keystoneY: number
  dewarpEnabled: boolean
  dewarpStrength: number
}

export interface EnhancementSettings {
  mode: FilterMode
  shadow: number
  crease: number
  contrast: number
  denoise: number
  sharpen: number
  brightness: number
  whiteBalance: number
}

export interface OcrBlock { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }
export interface OcrResult { language: string[]; text: string; blocks: OcrBlock[]; basedOnRevision: number; confidence: number; createdAt: number }

export interface Page {
  id: string
  originalBlob: Blob
  originalWidth: number
  originalHeight: number
  corners: Corners
  confidence: number
  detectionNote?: string
  outputAspect: Aspect
  geometry: GeometrySettings
  enhancement: EnhancementSettings
  revision: number
  ocr?: OcrResult
  /** Optional remote restoration result; originalBlob is never replaced. */
  restoredBlob?: Blob
}

export interface ScanProject {
  id: string
  title: string
  pages: Page[]
  createdAt: number
  updatedAt: number
}

export interface GemmaConfig { baseUrl: string; model: string; apiKey: string; rememberKey: boolean }
export interface GemmaAdvice {
  rotationDeg: number
  issues: { shadow: number; crease: number; blur: number; glare: number; curvature: number }
  recommendations: { contrast: number; denoise: number; sharpen: number; shadowRemoval: number; dewarp: number }
  retakeSuggested: boolean
  warnings: string[]
}

export interface RestorationConfig { baseUrl: string; model: string; apiKey: string; rememberKey: boolean; consent: boolean }
export interface RestorationResult { imageBlob: Blob; provider: string; model: string; processingFlags: string[]; warnings: string[]; elapsedMs: number }

export interface AppSettings { gemma: Omit<GemmaConfig, 'apiKey'>; restoration: Omit<RestorationConfig, 'apiKey' | 'consent'>; quality: 'preview' | 'high' }

export const DEFAULT_GEOMETRY: GeometrySettings = { rotationDeg: 0, keystoneX: 0, keystoneY: 0, dewarpEnabled: false, dewarpStrength: 0.35 }
export const DEFAULT_ENHANCEMENT: EnhancementSettings = { mode: 'color', shadow: 0, crease: 0, contrast: 0, denoise: 0, sharpen: 0, brightness: 0, whiteBalance: 0 }
export const DEFAULT_GEMMA: GemmaConfig = { baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: '', apiKey: '', rememberKey: false }
export const DEFAULT_RESTORATION: RestorationConfig = { baseUrl: '', model: '', apiKey: '', rememberKey: false, consent: false }
