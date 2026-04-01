import { useEffect, useRef } from 'react'
import QRCodeLib from 'qrcode'

interface Props {
  data: string
  size?: number
}

export default function QRCode({ data, size = 128 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, data, {
        width: size, margin: 1, errorCorrectionLevel: 'M',
      })
    }
  }, [data, size])

  return <canvas ref={canvasRef} />
}
