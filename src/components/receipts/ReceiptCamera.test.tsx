// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ReceiptCamera } from './ReceiptCamera'

const stopTrack = vi.fn()
const getUserMedia = vi.fn()

beforeEach(() => {
  stopTrack.mockClear()
  getUserMedia.mockReset()
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true })
  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
})
afterEach(() => vi.restoreAllMocks())

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)))

describe('ReceiptCamera', () => {
  it('asks for the back camera and releases it on unmount', async () => {
    getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] })
    const { unmount } = render(<ReceiptCamera onCapture={() => {}} onClose={() => {}} />)
    await settle()
    expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: { ideal: 'environment' } }, audio: false })
    unmount()
    expect(stopTrack).toHaveBeenCalled()
  })

  it('explains a refused camera and offers no shutter', async () => {
    getUserMedia.mockRejectedValue(new Error('NotAllowedError'))
    render(<ReceiptCamera onCapture={() => {}} onClose={() => {}} />)
    await settle()
    expect(screen.getByRole('alert').textContent).toMatch(/choose a photo/)
    expect(screen.queryByRole('button', { name: 'Take photo' })).toBeNull()
  })

  it('closes', async () => {
    getUserMedia.mockResolvedValue({ getTracks: () => [] })
    const onClose = vi.fn()
    render(<ReceiptCamera onCapture={() => {}} onClose={onClose} />)
    await settle()
    fireEvent.click(screen.getByRole('button', { name: 'Close camera' }))
    expect(onClose).toHaveBeenCalled()
  })
})
