import { getKeyboardPan, isEditableTarget } from '../../src/map/keyboard'

describe('地图键盘移动', () => {
  it('方向键和 WASD 移动视口，地图位移方向相反', () => {
    expect(getKeyboardPan('ArrowUp', false)).toEqual({ x: 0, y: 64 })
    expect(getKeyboardPan('s', false)).toEqual({ x: 0, y: -64 })
    expect(getKeyboardPan('a', false)).toEqual({ x: 64, y: 0 })
    expect(getKeyboardPan('D', false)).toEqual({ x: -64, y: 0 })
  })

  it('按住 Shift 时使用三倍步长', () => {
    expect(getKeyboardPan('ArrowRight', true)).toEqual({ x: -192, y: 0 })
  })

  it('不处理无关按键并识别编辑控件', () => {
    expect(getKeyboardPan('Enter', false)).toBeNull()
    expect(isEditableTarget(document.createElement('input'))).toBe(true)
    expect(isEditableTarget(document.createElement('textarea'))).toBe(true)
    expect(isEditableTarget(document.createElement('select'))).toBe(true)
    expect(isEditableTarget(document.createElement('button'))).toBe(false)
  })
})
