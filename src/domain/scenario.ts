export type Shell = 'powershell' | 'bash' | 'zsh'
export type BindingProfile = 'windows-psreadline' | 'emacs-bash' | 'emacs-zsh'

export interface VirtualWorkspace {
  currentDirectory: string
  entries: ReadonlyArray<{ path: string; content: string }>
}

export type KeyboardAction =
  | { type: 'text'; text: string }
  | { type: 'submit'; input?: string }
  | { type: 'backspace' }
  | { type: 'delete' }
  | { type: 'move-left' }
  | { type: 'move-right' }
  | { type: 'move-start' }
  | { type: 'move-end' }
  | { type: 'history-previous' }
  | { type: 'history-next' }
  | { type: 'complete' }
  | { type: 'unsupported'; binding: string }
  | { type: 'incompatible'; binding: string; explanation: string }

export interface RecommendedAction {
  action: KeyboardAction['type']
  binding: string
  name: string
}

export interface Scenario {
  id: string
  prompt: string
  shell: Shell
  bindingProfile: BindingProfile
  initialWorkspace: VirtualWorkspace
  supportedCommands: ReadonlyArray<{ input: string; output: string }>
  goal: { command: string }
  initialInput?: string
  initialCursor?: number
  history?: ReadonlyArray<string>
  completions?: ReadonlyArray<string>
  recommendedActions?: ReadonlyArray<RecommendedAction>
}

export interface TerminalLine { kind: 'input' | 'output' | 'coaching'; text: string }
export interface EfficiencyMetrics { incorrectActions: number; excessActions: number }
export interface ScenarioState {
  status: 'active' | 'completed'
  lines: ReadonlyArray<TerminalLine>
  workspace: VirtualWorkspace
  input: string
  cursor: number
  efficiency: EfficiencyMetrics
}

export type ScenarioAction = KeyboardAction
export interface ScenarioSession { getState(): ScenarioState; dispatch(action: ScenarioAction): ScenarioState }

export function createScenarioSession(scenario: Scenario): ScenarioSession {
  const initialInput = scenario.initialInput ?? ''
  let historyIndex = scenario.history?.length ?? 0
  let validActions = 0
  let state: ScenarioState = {
    status: 'active', lines: [], workspace: structuredClone(scenario.initialWorkspace),
    input: initialInput, cursor: scenario.initialCursor ?? initialInput.length,
    efficiency: { incorrectActions: 0, excessActions: 0 },
  }

  const updateInput = (input: string, cursor: number) => { state = { ...state, input, cursor }; validActions += 1 }
  return {
    getState: () => state,
    dispatch(action) {
      if (state.status === 'completed') return state
      if (action.type === 'unsupported' || action.type === 'incompatible') {
        state = { ...state, efficiency: { ...state.efficiency, incorrectActions: state.efficiency.incorrectActions + 1 } }
        return state
      }
      if (action.type === 'text') updateInput(state.input.slice(0, state.cursor) + action.text + state.input.slice(state.cursor), state.cursor + action.text.length)
      else if (action.type === 'backspace' && state.cursor > 0) updateInput(state.input.slice(0, state.cursor - 1) + state.input.slice(state.cursor), state.cursor - 1)
      else if (action.type === 'delete' && state.cursor < state.input.length) updateInput(state.input.slice(0, state.cursor) + state.input.slice(state.cursor + 1), state.cursor)
      else if (action.type === 'move-left') updateInput(state.input, Math.max(0, state.cursor - 1))
      else if (action.type === 'move-right') updateInput(state.input, Math.min(state.input.length, state.cursor + 1))
      else if (action.type === 'move-start') updateInput(state.input, 0)
      else if (action.type === 'move-end') updateInput(state.input, state.input.length)
      else if (action.type === 'history-previous' && scenario.history?.length) {
        historyIndex = Math.max(0, historyIndex - 1); updateInput(scenario.history[historyIndex], scenario.history[historyIndex].length)
      } else if (action.type === 'history-next' && scenario.history?.length) {
        historyIndex = Math.min(scenario.history.length, historyIndex + 1)
        const input = scenario.history[historyIndex] ?? ''; updateInput(input, input.length)
      } else if (action.type === 'complete') {
        const matches = scenario.completions?.filter((item) => item.startsWith(state.input)) ?? []
        if (matches.length === 1) updateInput(matches[0], matches[0].length)
        else state = { ...state, efficiency: { ...state.efficiency, incorrectActions: state.efficiency.incorrectActions + 1 } }
      } else if (action.type === 'submit') {
        validActions += 1
        const submittedInput = action.input ?? state.input
        const command = scenario.supportedCommands.find((candidate) => candidate.input === submittedInput.trim())
        if (!command) {
          state = { ...state, input: '', cursor: 0, lines: [...state.lines, { kind: 'input', text: submittedInput }, { kind: 'coaching', text: `That command is not supported in this scenario. Try ${scenario.goal.command}.` }], efficiency: { ...state.efficiency, incorrectActions: state.efficiency.incorrectActions + 1 } }
        } else {
          const completed = command.input === scenario.goal.command
          state = { ...state, status: completed ? 'completed' : 'active', input: '', cursor: 0, lines: [...state.lines, { kind: 'input', text: submittedInput }, { kind: 'output', text: command.output }], efficiency: { ...state.efficiency, excessActions: completed ? Math.max(0, validActions - (scenario.recommendedActions?.length ?? validActions)) : state.efficiency.excessActions } }
        }
      }
      return state
    },
  }
}
