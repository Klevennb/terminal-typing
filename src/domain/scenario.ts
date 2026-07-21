export type Shell = 'powershell' | 'bash' | 'zsh'
export type BindingProfile =
  | 'windows-psreadline'
  | 'emacs-bash'
  | 'emacs-zsh'

export interface VirtualWorkspace {
  currentDirectory: string
  entries: ReadonlyArray<{ path: string; content: string }>
}

export interface Scenario {
  id: string
  prompt: string
  shell: Shell
  bindingProfile: BindingProfile
  initialWorkspace: VirtualWorkspace
  supportedCommands: ReadonlyArray<{ input: string; output: string }>
  goal: { command: string }
}

export interface TerminalLine {
  kind: 'input' | 'output' | 'coaching'
  text: string
}

export interface ScenarioState {
  status: 'active' | 'completed'
  lines: ReadonlyArray<TerminalLine>
  workspace: VirtualWorkspace
}

export type ScenarioAction = { type: 'submit'; input: string }

export interface ScenarioSession {
  getState(): ScenarioState
  dispatch(action: ScenarioAction): ScenarioState
}

export function createScenarioSession(scenario: Scenario): ScenarioSession {
  let state: ScenarioState = {
    status: 'active',
    lines: [],
    workspace: structuredClone(scenario.initialWorkspace),
  }

  return {
    getState: () => state,
    dispatch(action) {
      const command = scenario.supportedCommands.find(
        (candidate) => candidate.input === action.input.trim(),
      )

      if (!command) {
        state = {
          ...state,
          lines: [
            ...state.lines,
            { kind: 'input', text: action.input },
            {
              kind: 'coaching',
              text: `That command is not supported in this scenario. Try ${scenario.goal.command}.`,
            },
          ],
        }
        return state
      }

      state = {
        ...state,
        status:
          command.input === scenario.goal.command ? 'completed' : state.status,
        lines: [
          ...state.lines,
          { kind: 'input', text: action.input },
          { kind: 'output', text: command.output },
        ],
      }
      return state
    },
  }
}
