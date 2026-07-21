import { describe, expect, it } from 'vitest'
import { normalizeKeyboardInput } from './keyboard'

describe('keyboard input normalization', () => {
  it('identifies browser-owned bindings instead of remapping them', () => {
    expect(
      normalizeKeyboardInput({ key: 'l', ctrlKey: true }, 'emacs-bash'),
    ).toEqual({
      type: 'incompatible',
      binding: 'Ctrl+L',
      explanation: 'Ctrl+L is reserved by the browser and is not remapped.',
    })
  })
})
