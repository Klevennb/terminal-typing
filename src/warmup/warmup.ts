export interface WarmupPrompt {
  seed: number
  text: string
}

export type WarmupAssistReason = 'paste' | 'left-active-tab'

export interface WarmupResult {
  elapsedMs: number
  wpm: number
  accuracy: number
  assisted: boolean
}

export interface WarmupState {
  status: 'ready' | 'active' | 'paused' | 'completed'
  prompt: WarmupPrompt
  typed: string
  assistReasons: ReadonlyArray<WarmupAssistReason>
  result?: WarmupResult
}

export interface WarmupAttempt {
  getState(): WarmupState
  start(now: number): WarmupState
  input(character: string, now: number): WarmupState
  backspace(): WarmupState
  assist(reason: 'paste'): WarmupState
  setVisibility(visible: boolean, now: number): WarmupState
}

const corpus = [
  'Get-ChildItem -Path .\\src -Recurse',
  'Get-Content .\\notes.txt | Select-Object -First 5',
  '$env:NODE_ENV = "development"',
  'git status --short',
  'npm run test -- --watch=false',
  'cd ~/projects/terminal-typing',
  'find ./src -type f -name "*.tsx"',
  'printf "%s\\n" "$PATH"',
  'curl --fail https://example.com/health',
  'ls -la ./scripts && pwd',
  'cat ./docs/adr/0002-use-scenario-driven-shell-simulation.md',
  'export APP_MODE=practice',
] as const

function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0
    return state / 0x1_0000_0000
  }
}

export function generateWarmupPrompt(seed: number): WarmupPrompt {
  const random = seededRandom(seed)
  const lines: string[] = []
  while (lines.join('\n').length < 180) {
    lines.push(corpus[Math.floor(random() * corpus.length)])
  }
  return { seed, text: lines.join('\n') }
}

export function createWarmupAttempt(prompt: WarmupPrompt): WarmupAttempt {
  let state: WarmupState = {
    status: 'ready',
    prompt,
    typed: '',
    assistReasons: [],
  }
  let startedAt = 0
  let pausedAt: number | undefined
  let pausedMs = 0
  let correctKeystrokes = 0
  let characterKeystrokes = 0

  function update(patch: Partial<WarmupState>) {
    state = { ...state, ...patch }
    return state
  }

  function addAssist(reason: WarmupAssistReason) {
    if (!state.assistReasons.includes(reason)) {
      update({ assistReasons: [...state.assistReasons, reason] })
    }
  }

  return {
    getState: () => state,
    start(now) {
      if (state.status !== 'ready') return state
      startedAt = now
      return update({ status: 'active' })
    },
    input(character, now) {
      if (state.status !== 'active' || character.length !== 1) return state
      characterKeystrokes += 1
      if (character === prompt.text[state.typed.length]) correctKeystrokes += 1
      const typed = state.typed + character
      if (typed !== prompt.text) return update({ typed })

      const elapsedMs = Math.max(1, now - startedAt - pausedMs)
      return update({
        typed,
        status: 'completed',
        result: {
          elapsedMs,
          wpm: Math.round((prompt.text.length / 5) / (elapsedMs / 60_000)),
          accuracy: Math.round((correctKeystrokes / characterKeystrokes) * 100),
          assisted: state.assistReasons.length > 0,
        },
      })
    },
    backspace() {
      if (state.status !== 'active' || !state.typed) return state
      return update({ typed: state.typed.slice(0, -1) })
    },
    assist(reason) {
      addAssist(reason)
      return state
    },
    setVisibility(visible, now) {
      if (!visible && state.status === 'active') {
        addAssist('left-active-tab')
        pausedAt = now
        return update({ status: 'paused' })
      }
      if (visible && state.status === 'paused' && pausedAt !== undefined) {
        pausedMs += Math.max(0, now - pausedAt)
        pausedAt = undefined
        return update({ status: 'active' })
      }
      return state
    },
  }
}
