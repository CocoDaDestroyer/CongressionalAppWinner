// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CameraScanner } from './CameraScanner'

type Callback = (result: { getText(): string } | undefined, error: unknown, controls: { stop(): void }) => void

const stop = vi.fn()
const constraints = vi.fn()
let deliver: Callback = () => {}
let fail = false

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: class {
    decodeFromConstraints(requested: unknown, _video: unknown, callback: Callback) {
      constraints(requested)
      if (fail) return Promise.reject(new Error('NotAllowedError'))
      deliver = callback
      return Promise.resolve({ stop })
    }
  },
}))

vi.mock('@zxing/library', () => ({
  BarcodeFormat: { EAN_13: 1, EAN_8: 2, UPC_A: 3, UPC_E: 4 },
  DecodeHintType: { POSSIBLE_FORMATS: 5 },
}))

/** Let the lazy import and the camera promise settle. */
const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)))

describe('CameraScanner', () => {
  it('hands over the first decoded barcode and stops the camera', async () => {
    fail = false
    const onCode = vi.fn()
    render(<CameraScanner onCode={onCode} onClose={() => {}} />)
    await settle()

    act(() => deliver({ getText: () => '013000006415' }, undefined, { stop }))
    expect(onCode).toHaveBeenCalledWith('013000006415')
    expect(stop).toHaveBeenCalled()
  })

  it('asks for the back camera', async () => {
    fail = false
    render(<CameraScanner onCode={() => {}} onClose={() => {}} />)
    await settle()
    expect(constraints).toHaveBeenCalledWith({ video: { facingMode: { ideal: 'environment' } } })
  })

  it('ignores frames with no barcode in them', async () => {
    fail = false
    const onCode = vi.fn()
    render(<CameraScanner onCode={onCode} onClose={() => {}} />)
    await settle()
    act(() => deliver(undefined, new Error('NotFound'), { stop }))
    expect(onCode).not.toHaveBeenCalled()
  })

  it('explains a refused camera and offers the typed fallback', async () => {
    fail = true
    render(<CameraScanner onCode={() => {}} onClose={() => {}} />)
    await settle()
    expect(screen.getByRole('alert').textContent).toMatch(/type the barcode/)
  })

  it('closes', async () => {
    fail = false
    const onClose = vi.fn()
    render(<CameraScanner onCode={() => {}} onClose={onClose} />)
    await settle()
    fireEvent.click(screen.getByRole('button', { name: 'Close camera' }))
    expect(onClose).toHaveBeenCalled()
  })
})
