import { describe, expect, it } from 'vitest'
import { cosineSimilarity } from './cosine'

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1)
  })

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0)
  })

  it('returns 0 if one of the vectors is zero', () => {
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0)
  })

  it('throws if lengths differ', () => {
    expect(() => cosineSimilarity([1], [1, 2])).toThrow()
  })
})

  it('handles negative vectors correctly', () => { expect(cosineSimilarity([-1, 0], [1, 0])).toBe(-1) })
