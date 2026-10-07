import { describe, expect, it } from 'vitest'
import { toGtin14 } from './gtin'

describe('toGtin14', () => {
  it('pads a UPC-A into the GTIN-14 key space', () => {
    expect(toGtin14('013000006415')).toBe('00013000006415')
  })

  it('keeps a GTIN-14 as it is and ignores spaces and dashes', () => {
    expect(toGtin14('0001 3000-006415')).toBe('00013000006415')
  })

  it('rejects anything that is not a barcode length of digits', () => {
    expect(toGtin14('')).toBeNull()
    expect(toGtin14('12345')).toBeNull()
    expect(toGtin14('ketchup')).toBeNull()
    expect(toGtin14('123456789012345')).toBeNull()
  })
})
