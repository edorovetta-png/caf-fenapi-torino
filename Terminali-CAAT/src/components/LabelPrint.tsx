import QRCode from './QRCode'
import type { Product, ProductLot } from '@/types'

interface Props {
  product: Product
  lot?: ProductLot
}

export default function LabelPrint({ product, lot }: Props) {
  const qrData = lot?.qr_data || product.barcode_data
  if (!qrData) return null

  const formattedExpiry = lot?.expiry_date
    ? new Date(lot.expiry_date).toLocaleDateString('it-IT')
    : null

  return (
    <div className="label">
      <div className="label-qr"><QRCode data={qrData} size={80} /></div>
      <div className="label-text">
        <div className="label-sku">{product.sku}</div>
        <div>{product.name}</div>
        {lot && (
          <>
            <div>Lotto: {lot.lot_number}</div>
            {formattedExpiry && <div>Scad: {formattedExpiry}</div>}
          </>
        )}
      </div>
    </div>
  )
}
