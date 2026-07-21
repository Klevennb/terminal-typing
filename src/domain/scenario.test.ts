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
