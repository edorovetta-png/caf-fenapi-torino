import type { QRCodeData } from '@/types'

export function encodeQRData(sku: string, id: string): string {
  return JSON.stringify({ app: 'magazzino-qr' as const, sku, id })
}

export function isValidQRData(data: unknown): data is QRCodeData {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return obj.app === 'magazzino-qr' && typeof obj.sku === 'string' && typeof obj.id === 'string'
}

export function parseQRData(raw: string): QRCodeData | null {
  try {
    const parsed = JSON.parse(raw)
    return isValidQRData(parsed) ? parsed : null
  } catch { return null }
}
