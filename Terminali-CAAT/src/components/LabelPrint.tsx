import QRCode from './QRCode'
import type { Product } from '@/types'

interface Props { product: Product }

export default function LabelPrint({ product }: Props) {
  if (!product.barcode_data) return null
  return (
    <div className="label">
      <div className="label-qr"><QRCode data={product.barcode_data} size={80} /></div>
      <div className="label-text">
        <div className="label-sku">{product.sku}</div>
        <div>{product.name}</div>
      </div>
    </div>
  )
}
