/**
 * Barcodes come off packages as UPC-A (12 digits), EAN-13, EAN-8 or GTIN-14.
 * The catalog keys on GTIN-14, so every form is zero-padded into that one key
 * space -- the same rule the `packages.gtin` column enforces.
 */
const LENGTHS = new Set([8, 12, 13, 14])

/** The GTIN-14 for a typed or scanned code, or null when it is not one. */
export function toGtin14(input: string): string | null {
  const digits = input.replace(/[\s-]/g, '')
  if (!/^\d+$/.test(digits) || !LENGTHS.has(digits.length)) return null
  return digits.padStart(14, '0')
}
