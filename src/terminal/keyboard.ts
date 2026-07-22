import type { BindingProfile, KeyboardAction } from '../domain/scenario'

interface KeyboardInput { key: string; ctrlKey?: boolean; altKey?: boolean; metaKey?: boolean; shiftKey?: boolean }
export type NormalizedKeyboardInput = KeyboardAction
const browserOwned = new Set(['Ctrl+L', 'Ctrl+T', 'Ctrl+W', 'Ctrl+N'])
function describeBinding(input: KeyboardInput): string {
  return [input.ctrlKey && 'Ctrl', input.altKey && 'Alt', input.metaKey && 'Meta', input.shiftKey && 'Shift', input.key.length === 1 ? input.key.toUpperCase() : input.key].filter(Boolean).join('+')
}
export function normalizeKeyboardInput(input: KeyboardInput, profile: BindingProfile): NormalizedKeyboardInput {
  const binding = describeBinding(input)
  if (browserOwned.has(binding)) return { type: 'incompatible', binding, explanation: `${binding} is reserved by the browser and is not remapped.` }
  if (input.key === 'Enter') return { type: 'submit' }
  if (input.key === 'Backspace') return { type: 'backspace' }
  if (input.key === 'Delete') return { type: 'delete' }
  if (input.key === 'ArrowLeft') return { type: 'move-left' }
  if (input.key === 'ArrowRight') return { type: 'move-right' }
  if (input.key === 'Home' || (input.ctrlKey && input.key.toLowerCase() === 'a')) return { type: 'move-start' }
  if (input.key === 'End' || (input.ctrlKey && input.key.toLowerCase() === 'e')) return { type: 'move-end' }
  if (input.key === 'ArrowUp') return { type: 'history-previous' }
  if (input.key === 'ArrowDown') return { type: 'history-next' }
  if (input.key === 'Tab') return { type: 'complete' }
  if (input.key.length === 1 && !input.ctrlKey && !input.altKey && !input.metaKey) return { type: 'text', text: input.key }
  void profile
  return { type: 'unsupported', binding }
}
