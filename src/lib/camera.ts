/** Whether this browser can offer a camera at all (it also needs https or localhost). */
export const canUseCamera = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function'
