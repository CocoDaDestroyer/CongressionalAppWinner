/**
 * A live camera for photographing a paper receipt: the back camera, a tall
 * frame to line the receipt up in, and a shutter. The shot is downscaled
 * before it leaves this component.
 */
import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, X } from 'lucide-react'
import { receiptDataUrl } from '../../lib/photo'
import { Button } from '../ui/Button'

interface ReceiptCameraProps {
  onCapture: (dataUrl: string) => void
  onClose: () => void
}

export function ReceiptCamera({ onCapture, onClose }: ReceiptCameraProps) {
  const video = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let stream: MediaStream | undefined

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then(async (opened) => {
        // The panel may have closed while the camera was still starting.
        if (cancelled) return opened.getTracks().forEach((t) => t.stop())
        stream = opened
        const el = video.current!
        el.srcObject = opened
        await el.play()
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setError('The camera is unavailable. Allow camera access, or choose a photo instead.')
      })

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function shoot() {
    const el = video.current
    if (!el || !el.videoWidth) return
    try {
      onCapture(receiptDataUrl(el, el.videoWidth, el.videoHeight))
    } catch {
      setError('Could not take the photo. Try again, or choose a photo instead.')
    }
  }

  return (
    <section aria-label="Receipt camera" className="overflow-hidden rounded-tag border-[1.5px] border-ink bg-ink">
      {error ? (
        <p role="alert" className="flex items-center gap-2 p-4 text-sm text-paper">
          <CameraOff className="size-5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        <div className="relative">
          <video ref={video} className="aspect-[3/4] max-h-[28rem] w-full object-cover" muted playsInline />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-[6%] inset-x-[14%] rounded-[6px] border-2 border-tag"
          />
          <p className="absolute inset-x-0 top-0 bg-ink/60 p-2 text-center text-sm font-semibold text-paper">
            Line the receipt up inside the frame
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-paper/15 p-2">
        <Button variant="ghost" size="sm" className="text-paper hover:bg-paper/10 hover:text-paper" icon={<X className="size-4" aria-hidden="true" />} onClick={onClose}>
          Close camera
        </Button>
        {!error && (
          <button
            type="button"
            disabled={!ready}
            onClick={shoot}
            className="inline-flex h-9 items-center gap-1.5 rounded-control bg-paper px-4 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Camera className="size-4" aria-hidden="true" />
            Take photo
          </button>
        )}
      </div>
    </section>
  )
}
