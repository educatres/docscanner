import { describe, expect, it } from 'vitest'
import { DEFAULT_GEMMA } from '../../src/types'
import { analyzeWithGemma } from '../../src/services/ai'

describe('AI privacy boundary', () => {
  it('does not call network when Gemma is not configured', async () => {
    await expect(analyzeWithGemma(DEFAULT_GEMMA, new Blob(['x'], { type: 'image/png' }))).rejects.toThrow('請先設定')
  })
})
