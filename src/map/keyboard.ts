import { useEffect, type RefObject } from 'react'

import type { X4MapApi } from '../types/window'

export interface PanDelta {
  x: number
  y: number
}

const KEYBOARD_PAN_SPEED = 480
const MAX_FRAME_TIME = 50

export function getKeyboardPan(
  key: string,
  shiftKey: boolean,
  baseStep = 64,
): PanDelta | null {
  const step = baseStep * (shiftKey ? 3 : 1)
  switch (key.toLowerCase()) {
    case 'arrowup':
    case 'w':
      return { x: 0, y: step }
    case 'arrowdown':
    case 's':
      return { x: 0, y: -step }
    case 'arrowleft':
    case 'a':
      return { x: step, y: 0 }
    case 'arrowright':
    case 'd':
      return { x: -step, y: 0 }
    default:
      return null
  }
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

export function useMapKeyboard(
  rootRef: RefObject<HTMLElement | null>,
  apiRef: RefObject<X4MapApi | null>,
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const pressedKeys = new Set<string>()
    let animationFrame = 0
    let previousTime: number | null = null
    let shiftPressed = false

    const stopMoving = () => {
      pressedKeys.clear()
      previousTime = null
      if (animationFrame) cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }

    const move = (time: number) => {
      if (pressedKeys.size === 0) {
        stopMoving()
        return
      }

      if (previousTime !== null) {
        let x = 0
        let y = 0
        for (const key of pressedKeys) {
          const direction = getKeyboardPan(key, false, 1)
          if (!direction) continue
          x += direction.x
          y += direction.y
        }

        const magnitude = Math.hypot(x, y)
        if (magnitude > 0) {
          const elapsed = Math.min(time - previousTime, MAX_FRAME_TIME) / 1000
          const distance = KEYBOARD_PAN_SPEED * elapsed * (shiftPressed ? 3 : 1)
          apiRef.current?.panBy((x / magnitude) * distance, (y / magnitude) * distance)
        }
      }

      previousTime = time
      animationFrame = requestAnimationFrame(move)
    }

    const startMoving = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(move)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return
      shiftPressed = event.shiftKey
      const delta = getKeyboardPan(event.key, event.shiftKey)
      if (!delta) return
      event.preventDefault()
      pressedKeys.add(event.key.toLowerCase())
      startMoving()
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key.toLowerCase())
      shiftPressed = event.shiftKey
      if (pressedKeys.size === 0) stopMoving()
    }

    root.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', stopMoving)
    return () => {
      root.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', stopMoving)
      stopMoving()
    }
  }, [apiRef, rootRef])
}
