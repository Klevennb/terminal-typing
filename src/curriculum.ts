import type { BindingProfile, Scenario, Shell } from './domain/scenario'

export interface Challenge {
  id: string
  revision: number
  title: string
  description: string
  scenario: Scenario
}

export interface Lesson {
  id: string
  kind: 'command' | 'efficiency'
  title: string
  description: string
  shell: Shell
  bindingProfile: BindingProfile
  challengePool: ReadonlyArray<Challenge>
}

const workspace = {
  currentDirectory: '/work',
  entries: [
    { path: '/work/notes.txt', content: 'Shell practice notes' },
    { path: '/work/scripts', content: '' },
  ],
} as const

function challenge(
  shell: Shell,
  bindingProfile: BindingProfile,
  id: string,
  title: string,
  description: string,
  command: string,
  output: string,
  aliases: ReadonlyArray<string> = [],
): Challenge {
  return {
    id: `${shell}-${id}`,
    revision: 1,
    title,
    description,
    scenario: {
      id: `${shell}-${id}`,
      prompt: description,
      shell,
      bindingProfile,
      initialWorkspace: workspace,
      supportedCommands: [command, ...aliases].map((input) => ({ input, output })),
      goal: { command },
    },
  }
}

function efficiencyLesson(shell: Shell, bindingProfile: BindingProfile, title: string, command: string): Lesson {
  const prefix = `${shell}-efficiency`
  const output = shell === 'powershell' ? 'Path\n----\n/work' : '/work'
  const base = (id: string, challengeTitle: string, description: string, additions: Partial<Scenario>, actions: NonNullable<Scenario['recommendedActions']>): Challenge => ({
    id: `${prefix}-${id}`, revision: 1, title: challengeTitle, description,
    scenario: {
      id: `${prefix}-${id}`, prompt: description, shell, bindingProfile,
      initialWorkspace: workspace, supportedCommands: [{ input: command, output }], goal: { command },
      recommendedActions: actions, ...additions,
    },
  })
  const action = (type: NonNullable<Scenario['recommendedActions']>[number]['action'], binding: string, name: string) => ({ action: type, binding, name })
  const typo = command.slice(0, -1) + command.at(-1) + command.at(-1)
  const partial = command.slice(0, Math.max(1, command.length - 3))
  return {
    id: `${prefix}-fundamentals`, kind: 'efficiency', title,
    description: 'Navigate, edit, recall, complete, and run commands with efficient keyboard actions.',
    shell, bindingProfile,
    challengePool: [
      base('navigate', 'Jump to the end', 'Move to the end of the prepared command and run it.', { initialInput: command, initialCursor: 0 }, [action('move-end', 'End', 'Move to end'), action('submit', 'Enter', 'Execute command')]),
      base('edit', 'Remove an extra character', 'Correct the prepared command without retyping it, then run it.', { initialInput: typo }, [action('backspace', 'Backspace', 'Delete previous character'), action('submit', 'Enter', 'Execute command')]),
      base('history', 'Recall the previous command', 'Recall the previous command from history and run it.', { history: [command] }, [action('history-previous', 'ArrowUp', 'Previous history entry'), action('submit', 'Enter', 'Execute command')]),
      base('complete', 'Complete the command', 'Complete the prepared command and run it.', { initialInput: partial, completions: [command] }, [action('complete', 'Tab', 'Complete command'), action('submit', 'Enter', 'Execute command')]),
      base('execute', 'Execute the prepared command', 'Run the command already prepared in the input buffer.', { initialInput: command }, [action('submit', 'Enter', 'Execute command')]),
    ],
  }
}

export const curriculum: ReadonlyArray<Lesson> = [
  {
    id: 'powershell-first-steps',
    kind: 'command',
    title: 'PowerShell first steps',
    description: 'Inspect your location, list entries, and read a text file.',
    shell: 'powershell',
    bindingProfile: 'windows-psreadline',
    challengePool: [
      challenge('powershell', 'windows-psreadline', 'print-location', 'Find your location', 'Show the current directory.', 'Get-Location', 'Path\n----\n/work', ['pwd']),
      challenge('powershell', 'windows-psreadline', 'list-entries', 'List directory entries', 'List the files and directories in the current directory.', 'Get-ChildItem', 'notes.txt\nscripts/', ['ls']),
      challenge('powershell', 'windows-psreadline', 'read-file', 'Read a text file', 'Display the contents of notes.txt.', 'Get-Content notes.txt', 'Shell practice notes', ['cat notes.txt']),
    ],
  },
  {
    id: 'bash-first-steps',
    kind: 'command',
    title: 'Bash first steps',
    description: 'Practice three everyday commands with Emacs-style bindings.',
    shell: 'bash',
    bindingProfile: 'emacs-bash',
    challengePool: [
      challenge('bash', 'emacs-bash', 'print-location', 'Find your location', 'Print the current working directory.', 'pwd', '/work'),
      challenge('bash', 'emacs-bash', 'list-entries', 'List directory entries', 'List the files and directories in the current directory.', 'ls', 'notes.txt\nscripts'),
      challenge('bash', 'emacs-bash', 'read-file', 'Read a text file', 'Print the contents of notes.txt.', 'cat notes.txt', 'Shell practice notes'),
    ],
  },
  {
    id: 'zsh-first-steps',
    kind: 'command',
    title: 'Zsh first steps',
    description: 'Practice three everyday commands with Emacs-style bindings.',
    shell: 'zsh',
    bindingProfile: 'emacs-zsh',
    challengePool: [
      challenge('zsh', 'emacs-zsh', 'print-location', 'Find your location', 'Print the current working directory.', 'pwd', '/work'),
      challenge('zsh', 'emacs-zsh', 'list-entries', 'List directory entries', 'List the files and directories in the current directory.', 'ls', 'notes.txt\nscripts'),
      challenge('zsh', 'emacs-zsh', 'read-file', 'Read a text file', 'Print the contents of notes.txt.', 'cat notes.txt', 'Shell practice notes'),
    ],
  },
  efficiencyLesson('powershell', 'windows-psreadline', 'PowerShell keyboard efficiency', 'Get-Location'),
  efficiencyLesson('bash', 'emacs-bash', 'Bash keyboard efficiency', 'pwd'),
  efficiencyLesson('zsh', 'emacs-zsh', 'Zsh keyboard efficiency', 'pwd'),
]

export function findLesson(id: string): Lesson | undefined {
  return curriculum.find((lesson) => lesson.id === id)
}

export function allChallenges(): ReadonlyArray<Challenge> {
  return curriculum.flatMap((lesson) => lesson.challengePool)
}

export function findChallenge(id: string): Challenge | undefined {
  return allChallenges().find((challenge) => challenge.id === id)
}
