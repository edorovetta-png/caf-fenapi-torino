import { describe, it, expect } from 'vitest'
import { encodeQRData, parseQRData, isValidQRData } from '@/lib/qr'

describe('encodeQRData', () => {
  it('encodes product data to JSON string', () => {
    const result = encodeQRData('PROD-001', '550e8400-e29b-41d4-a716-446655440000')
    const parsed = JSON.parse(result)
    expect(parsed).toEqual({
      app: 'magazzino-qr',
      sku: 'PROD-001',
      id: '550e8400-e29b-41d4-a716-446655440000',
    })
  })
})

describe('parseQRData', () => {
  it('parses valid QR JSON string', () => {
    const input = JSON.stringify({ app: 'magazzino-qr', sku: 'PROD-001', id: '550e8400-e29b-41d4-a716-446655440000' })
    const result = parseQRData(input)
    expect(result).toEqual({ app: 'magazzino-qr', sku: 'PROD-001', id: '550e8400-e29b-41d4-a716-446655440000' })
  })
  it('returns null for invalid JSON', () => { expect(parseQRData('not-json')).toBeNull() })
  it('returns null for wrong app identifier', () => {
    expect(parseQRData(JSON.stringify({ app: 'other-app', sku: 'X', id: 'Y' }))).toBeNull()
  })
  it('returns null for missing fields', () => {
    expect(parseQRData(JSON.stringify({ app: 'magazzino-qr' }))).toBeNull()
  })
})

describe('isValidQRData', () => {
  it('returns true for valid data', () => {
    expect(isValidQRData({ app: 'magazzino-qr', sku: 'X', id: 'Y' })).toBe(true)
  })
  it('returns false for wrong app', () => {
    expect(isValidQRData({ app: 'other', sku: 'X', id: 'Y' })).toBe(false)
  })
})
