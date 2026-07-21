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

export const curriculum: ReadonlyArray<Lesson> = [
  {
    id: 'powershell-first-steps',
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
