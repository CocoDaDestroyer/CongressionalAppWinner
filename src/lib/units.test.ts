import { describe, expect, it } from 'vitest'
import { cheapestFirst, normalize, toCanonical } from './units'

describe('toCanonical', () => {
  it('converts mass to grams', () => {
    expect(toCanonical(1, 'lb')).toBeCloseTo(453.59237)
    expect(toCanonical(2, 'kg')).toBe(2000)
  })

  it('converts volume to millilitres', () => {
    expect(toCanonical(1, 'gal')).toBeCloseTo(3785.411784)
  })
})

describe('normalize', () => {
  it('prefers the larger package when it is cheaper per unit', () => {
    const big = normalize(500, 32, 'oz')
    const small = normalize(250, 12, 'oz')
    expect(big.perUnit).toBeLessThan(small.perUnit)
  })

  it('reports the canonical unit of the dimension', () => {
    expect(normalize(100, 1, 'lb')).toMatchObject({ dimension: 'mass', unit: 'g' })
    expect(normalize(100, 1, 'gal')).toMatchObject({ dimension: 'volume', unit: 'ml' })
  })

  it('rejects a zero or negative size', () => {
    expect(() => normalize(100, 0, 'g')).toThrow(RangeError)
    expect(() => normalize(100, -1, 'g')).toThrow(RangeError)
  })
})

describe('cheapestFirst', () => {
  it('ranks by per-unit price, not sticker price', () => {
    const options = [
      { name: 'jar', price: normalize(250, 12, 'oz') },
      { name: 'tub', price: normalize(500, 32, 'oz') },
    ]
    expect(cheapestFirst(options, (o) => o.price).map((o) => o.name)).toEqual(['tub', 'jar'])
  })

  it('refuses to compare mass against volume', () => {
    const options = [
      { price: normalize(100, 1, 'lb') },
      { price: normalize(100, 1, 'gal') },
    ]
    expect(() => cheapestFirst(options, (o) => o.price)).toThrow(TypeError)
  })
})
