import { describe, expect, it } from 'vitest'
import { isValidCorners, polygonArea, rotatePoint, sortCorners } from '../../src/services/image'

describe('image geometry', () => {
  it('sorts corners TL/TR/BR/BL and validates convex quadrilateral', () => {
    const corners = sortCorners([{ x: .9, y: .9 }, { x: .1, y: .1 }, { x: .9, y: .1 }, { x: .1, y: .9 }])
    expect(corners[0]).toEqual({ x: .1, y: .1 }); expect(corners[2]).toEqual({ x: .9, y: .9 }); expect(isValidCorners(corners)).toBe(true); expect(polygonArea(corners)).toBeCloseTo(.64)
  })
  it('rotates normalized points without losing bounds', () => { expect(rotatePoint({ x: .2, y: .3 }, 1)).toEqual({ x: .7, y: .2 }); expect(rotatePoint({ x: .2, y: .3 }, 2)).toEqual({ x: .8, y: .7 }) })
})
