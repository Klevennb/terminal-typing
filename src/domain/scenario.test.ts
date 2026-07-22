import { describe, expect, it } from 'vitest'
import { createScenarioSession, type Scenario } from './scenario'

const scenario: Scenario = {
  id: 'list-files',
  prompt: 'List the files in the current directory.',
  shell: 'powershell',
  bindingProfile: 'windows-psreadline',
  initialWorkspace: {
    currentDirectory: '/work',
    entries: [{ path: '/work/notes.txt', content: 'practice' }],
  },
  supportedCommands: [{ input: 'Get-ChildItem', output: 'notes.txt' }],
  goal: { command: 'Get-ChildItem' },
}

describe('scenario session', () => {
  it('completes an efficiency scenario by navigating the owned input buffer', () => {
    const session = createScenarioSession({ ...scenario, initialInput: 'Get-ChildItem', initialCursor: 0, recommendedActions: [
      { action: 'move-end', binding: 'End', name: 'Move to end' },
      { action: 'submit', binding: 'Enter', name: 'Execute command' },
    ] })

    expect(session.dispatch({ type: 'move-end' }).cursor).toBe(13)
    const result = session.dispatch({ type: 'submit' })

    expect(result.status).toBe('completed')
    expect(result.efficiency).toEqual({ incorrectActions: 0, excessActions: 0 })
  })

  it('counts alternate valid and unsupported actions without letting unsupported input mutate the buffer', () => {
    const session = createScenarioSession({ ...scenario, initialInput: 'Get-ChildItem', recommendedActions: [
      { action: 'submit', binding: 'Enter', name: 'Execute command' },
    ] })
    const before = session.getState()
    const unsupported = session.dispatch({ type: 'unsupported', binding: 'Ctrl+X' })
    expect(unsupported.input).toBe(before.input)
    session.dispatch({ type: 'move-start' })
    session.dispatch({ type: 'move-end' })
    const result = session.dispatch({ type: 'submit' })
    expect(result.efficiency).toEqual({ incorrectActions: 1, excessActions: 2 })
  })

  it('completes a scenario through its supported command without touching a real filesystem', () => {
    const session = createScenarioSession(scenario)

    const result = session.dispatch({ type: 'submit', input: 'Get-ChildItem' })

    expect(result.status).toBe('completed')
    expect(result.lines.at(-1)).toMatchObject({ kind: 'output', text: 'notes.txt' })
    expect(result.workspace.entries).toEqual(scenario.initialWorkspace.entries)
  })

  it('explains unsupported commands without pretending to execute them', () => {
    const session = createScenarioSession(scenario)

    const result = session.dispatch({ type: 'submit', input: 'Remove-Item *' })

    expect(result.status).toBe('active')
    expect(result.lines).toEqual([
      { kind: 'input', text: 'Remove-Item *' },
      {
        kind: 'coaching',
        text: 'That command is not supported in this scenario. Try Get-ChildItem.',
      },
    ])
    expect(result.workspace).toEqual(scenario.initialWorkspace)
  })
})
