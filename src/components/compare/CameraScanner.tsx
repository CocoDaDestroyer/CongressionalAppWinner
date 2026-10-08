/**
 * Live barcode scanning with the device camera. The decoder (@zxing/browser)
 * is loaded only when the camera opens, so it costs nothing until it is used.
 * Typing the barcode stays available as the fallback.
 */
import { useEffect, useRef, useState } from 'react'
import { CameraOff, X } from 'lucide-react'
import { Button } from '../ui/Button'

interface CameraScannerProps {
  onCode: (code: string) => void
  onClose: () => void
}

export function CameraScanner({ onCode, onClose }: CameraScannerProps) {
  const frame = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  // Held in a ref so a parent re-render never restarts the camera.
  const onCodeRef = useRef(onCode)
  useEffect(() => {
    onCodeRef.current = onCode
  })

  useEffect(() => {
    let cancelled = false
    let stop: (() => void) | undefined

    // Each run owns its <video>. React runs this effect twice in development, and a
    // shared element let the first run's cleanup blank the stream the second had opened.
    const video = document.createElement('video')
    video.className = 'aspect-[4/3] w-full object-cover'
    video.muted = true
    video.playsInline = true
    frame.current?.prepend(video)

    Promise.all([import('@zxing/browser'), import('@zxing/library')])
      .then(([{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }]) => {
        // Grocery barcodes only: fewer formats to try means faster, steadier reads.
        const hints = new Map([
          [
            DecodeHintType.POSSIBLE_FORMATS,
            [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E],
          ],
        ])
        // The back camera, not the selfie one a phone would otherwise pick first.
        return new BrowserMultiFormatReader(hints).decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          video,
          (result, _error, controls) => {
            if (!result) return
            controls.stop()
            onCodeRef.current(result.getText())
          },
        )
      })
      .then((controls) => {
        // The panel may have closed while the camera was still starting.
        if (cancelled) controls.stop()
        else stop = () => controls.stop()
      })
      .catch(() => {
        if (!cancelled) setError('The camera is unavailable. Allow camera access, or type the barcode below.')
      })

    return () => {
      cancelled = true
      stop?.()
      video.remove()
    }
  }, [])

  return (
    <section aria-label="Barcode camera" className="overflow-hidden rounded-tag border-[1.5px] border-ink bg-ink">
      {error ? (
        <p role="alert" className="flex items-center gap-2 p-4 text-sm text-paper">
          <CameraOff className="size-5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        <div ref={frame} className="relative aspect-[4/3]">
          {/* A wide rectangle, the shape of a barcode, so the shopper knows where to aim. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[10%] top-1/2 h-[30%] -translate-y-1/2 rounded-[6px] border-2 border-tag"
          />
          <p className="absolute inset-x-0 bottom-0 p-3 text-center text-sm font-semibold text-paper">
            Point the camera at the barcode
          </p>
        </div>
      )}
      <div className="flex justify-end border-t border-paper/15 p-2">
        <Button variant="ghost" size="sm" className="text-paper hover:bg-paper/10 hover:text-paper" icon={<X className="size-4" aria-hidden="true" />} onClick={onClose}>
          Close camera
        </Button>
      </div>
    </section>
  )
}
