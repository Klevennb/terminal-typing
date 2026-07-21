import type { BindingProfile } from '../domain/scenario'

interface KeyboardInput {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
}

export type NormalizedKeyboardInput =
  | { type: 'text'; text: string }
  | { type: 'submit' }
  | { type: 'backspace' }
  | { type: 'unsupported'; binding: string }
  | { type: 'incompatible'; binding: string; explanation: string }

const browserOwned = new Set(['Ctrl+L', 'Ctrl+T', 'Ctrl+W', 'Ctrl+N'])

function describeBinding(input: KeyboardInput): string {
  return [
    input.ctrlKey && 'Ctrl',
    input.altKey && 'Alt',
    input.metaKey && 'Meta',
    input.shiftKey && 'Shift',
    input.key.length === 1 ? input.key.toUpperCase() : input.key,
  ]
    .filter(Boolean)
    .join('+')
}

export function normalizeKeyboardInput(
  input: KeyboardInput,
  profile: BindingProfile,
): NormalizedKeyboardInput {
  // Compatibility can vary by profile as the curriculum grows. Keeping the
  // profile in this boundary prevents the terminal renderer from owning rules.
  void profile
  const binding = describeBinding(input)
  if (browserOwned.has(binding)) {
    return {
      type: 'incompatible',
      binding,
      explanation: `${binding} is reserved by the browser and is not remapped.`,
    }
  }
  if (input.key === 'Enter') return { type: 'submit' }
  if (input.key === 'Backspace') return { type: 'backspace' }
  if (input.key.length === 1 && !input.ctrlKey && !input.altKey && !input.metaKey) {
    return { type: 'text', text: input.key }
  }
  return { type: 'unsupported', binding }
}
