import type { GemmaAdvice, GemmaConfig, RestorationConfig, RestorationResult } from '../types'

function cleanBase(value: string) { return value.trim().replace(/\/$/, '') }
function authHeaders(key: string): HeadersInit { return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } }
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 45_000) {
  const controller = new AbortController(); const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try { return await fetch(url, { ...init, signal: controller.signal }) } catch (error) { if (error instanceof DOMException && error.name === 'AbortError') throw new Error('AI 請求逾時，請檢查網路或改用本機處理。'); throw new Error('AI 請求失敗，可能是網路或 CORS 設定問題。') } finally { window.clearTimeout(timer) }
}
async function jsonResponse(response: Response) { const text = await response.text(); let body: any = {}; try { body = text ? JSON.parse(text) : {} } catch { body = { raw: text } }; if (!response.ok) { const status = response.status === 401 || response.status === 403 ? 'API Key 無效或沒有權限。' : response.status === 429 ? '服務配額或速率限制已達上限。' : `服務回傳 HTTP ${response.status}。`; throw new Error(status) }; return body }

function parseAdvice(value: unknown): GemmaAdvice {
  const source = typeof value === 'string' ? JSON.parse(value) : value as any
  const number = (v: unknown, fallback = 0) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback
  const rotation = typeof source?.rotationDeg === 'number' && Number.isFinite(source.rotationDeg) ? Math.max(-180, Math.min(180, source.rotationDeg)) : 0
  return { rotationDeg: rotation, issues: { shadow: number(source?.issues?.shadow), crease: number(source?.issues?.crease), blur: number(source?.issues?.blur), glare: number(source?.issues?.glare), curvature: number(source?.issues?.curvature) }, recommendations: { contrast: number(source?.recommendations?.contrast), denoise: number(source?.recommendations?.denoise), sharpen: number(source?.recommendations?.sharpen), shadowRemoval: number(source?.recommendations?.shadowRemoval), dewarp: number(source?.recommendations?.dewarp) }, retakeSuggested: Boolean(source?.retakeSuggested), warnings: Array.isArray(source?.warnings) ? source.warnings.filter((v: unknown): v is string => typeof v === 'string').slice(0, 8) : [] }
}

export async function analyzeWithGemma(config: GemmaConfig, image: Blob): Promise<GemmaAdvice> {
  if (!config.apiKey.trim() || !config.baseUrl.trim() || !config.model.trim()) throw new Error('請先設定 Gemma 端點、模型與 API Key。')
  const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] ?? ''); reader.onerror = () => reject(new Error('影像讀取失敗。')); reader.readAsDataURL(image) })
  const prompt = 'Analyze this document image quality. Return only JSON matching: {rotationDeg:number,issues:{shadow:number,crease:number,blur:number,glare:number,curvature:number},recommendations:{contrast:number,denoise:number,sharpen:number,shadowRemoval:number,dewarp:number},retakeSuggested:boolean,warnings:string[]}. Do not invent or transcribe document text.'
  const response = await fetchWithTimeout(`${cleanBase(config.baseUrl)}/chat/completions`, { method: 'POST', headers: authHeaders(config.apiKey), body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: `data:${image.type || 'image/jpeg'};base64,${base64}` } }] }], temperature: 0 }) })
  const body = await jsonResponse(response); const content = body?.choices?.[0]?.message?.content ?? body?.output_text ?? ''
  const jsonText = String(content).replace(/^```json\s*/i, '').replace(/```$/i, '').trim(); return parseAdvice(jsonText)
}

export async function restoreImage(config: RestorationConfig, image: Blob): Promise<RestorationResult> {
  if (!config.apiKey.trim() || !config.baseUrl.trim() || !config.model.trim()) throw new Error('尚未設定影像修復服務。')
  if (!config.consent) throw new Error('請先確認影像會上傳至你設定的影像修復服務。')
  const started = performance.now(); const form = new FormData(); form.append('model', config.model); form.append('image', image, 'paperscan-input.png')
  const response = await fetchWithTimeout(cleanBase(config.baseUrl), { method: 'POST', headers: { Authorization: `Bearer ${config.apiKey}` }, body: form }, 90_000)
  if (!response.ok) await jsonResponse(response)
  const result = await response.blob(); if (!result.type.startsWith('image/')) throw new Error('影像修復服務沒有回傳圖片。')
  return { imageBlob: result, provider: new URL(config.baseUrl).hostname, model: config.model, processingFlags: ['remote-restoration'], warnings: [], elapsedMs: Math.round(performance.now() - started) }
}
