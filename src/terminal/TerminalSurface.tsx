import type { FormEvent, KeyboardEvent } from 'react'
import type {
  BindingProfile,
  Shell,
  TerminalLine,
} from '../domain/scenario'
import { normalizeKeyboardInput } from './keyboard'

interface TerminalSurfaceProps {
  shell: Shell
  bindingProfile: BindingProfile
  lines: ReadonlyArray<TerminalLine>
  input: string
  onInputChange(input: string): void
  onSubmit(input: string): void
  onBindingMessage?(message: string): void
}

const shellNames: Record<Shell, string> = {
  powershell: 'PowerShell',
  bash: 'Bash',
  zsh: 'Zsh',
}

export function TerminalSurface({
  shell,
  bindingProfile,
  lines,
  input,
  onInputChange,
  onSubmit,
  onBindingMessage,
}: TerminalSurfaceProps) {
  const name = shellNames[shell]
  const prompt = shell === 'powershell' ? 'PS /work>' : 'learner@practice:/work$'

  function submit(event: FormEvent) {
    event.preventDefault()
    if (input.trim()) onSubmit(input)
  }

  function inspectBinding(event: KeyboardEvent<HTMLInputElement>) {
    const normalized = normalizeKeyboardInput(event, bindingProfile)
    if (normalized.type === 'incompatible') {
      onBindingMessage?.(normalized.explanation)
    } else if (normalized.type === 'unsupported') {
      onBindingMessage?.(`${normalized.binding} is not supported in this scenario.`)
    }
  }

  return (
    <section className="terminal-surface" aria-label={`${name} simulated terminal`}>
      <div className="terminal-toolbar" aria-hidden="true">
        <span />
        <span />
        <span />
        <strong>{name}</strong>
      </div>
      <div className="terminal-transcript" role="log" aria-live="polite">
        {lines.map((line, index) => (
          <div className={`terminal-line ${line.kind}`} key={`${index}-${line.text}`}>
            {line.kind === 'input' && <span aria-hidden="true">{prompt} </span>}
            {line.text}
          </div>
        ))}
      </div>
      <form onSubmit={submit}>
        <label htmlFor="shell-input" className="visually-hidden">
          {name} input buffer
        </label>
        <span className="prompt" aria-hidden="true">{prompt}</span>
        <input
          id="shell-input"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={inspectBinding}
        />
      </form>
    </section>
  )
}
