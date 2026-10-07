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
  const video = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  // Held in a ref so a parent re-render never restarts the camera.
  const onCodeRef = useRef(onCode)
  useEffect(() => {
    onCodeRef.current = onCode
  })

  useEffect(() => {
    let cancelled = false
    let stop: (() => void) | undefined

    import('@zxing/browser')
      .then(({ BrowserMultiFormatReader }) =>
        new BrowserMultiFormatReader().decodeFromVideoDevice(undefined, video.current!, (result, _error, controls) => {
          if (!result) return
          controls.stop()
          onCodeRef.current(result.getText())
        }),
      )
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
        <div className="relative">
          <video ref={video} className="aspect-[4/3] w-full object-cover" muted playsInline />
          {/* A sticker-shaped target, so the shopper knows where to aim. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[15%] top-1/2 h-1/3 -translate-y-1/2 rounded-[50%] border-2 border-tag"
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
