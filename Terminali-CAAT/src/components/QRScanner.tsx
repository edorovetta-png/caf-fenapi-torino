import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface Props {
  onScan: (data: string) => void
  active: boolean
}

export default function QRScanner({ onScan, active }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return
    const scanner = new Html5Qrcode(containerRef.current.id)
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        if (navigator.vibrate) navigator.vibrate(100)
        onScan(decodedText)
      },
      () => {},
    ).catch(console.error)

    return () => { scanner.stop().catch(() => {}) }
  }, [active, onScan])

  return <div id="qr-scanner" ref={containerRef} className="w-full max-w-sm mx-auto rounded-lg overflow-hidden" />
}
