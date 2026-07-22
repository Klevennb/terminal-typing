import { useEffect, useRef, type KeyboardEvent } from 'react'
import type { BindingProfile, KeyboardAction, Shell, TerminalLine } from '../domain/scenario'
import { normalizeKeyboardInput } from './keyboard'

interface TerminalSurfaceProps {
  shell: Shell; bindingProfile: BindingProfile; lines: ReadonlyArray<TerminalLine>
  input: string; cursor?: number; onAction?(action: KeyboardAction): void
  onInputChange?(input: string): void; onSubmit?(input: string): void; onBindingMessage?(message: string): void
}
const shellNames: Record<Shell, string> = { powershell: 'PowerShell', bash: 'Bash', zsh: 'Zsh' }

export function TerminalSurface({ shell, bindingProfile, lines, input, cursor = input.length, onAction, onInputChange, onSubmit, onBindingMessage }: TerminalSurfaceProps) {
  const field = useRef<HTMLInputElement>(null)
  const name = shellNames[shell]
  const prompt = shell === 'powershell' ? 'PS /work>' : 'learner@practice:/work$'
  useEffect(() => { field.current?.setSelectionRange(cursor, cursor) }, [cursor, input])

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!onAction) return
    const action = normalizeKeyboardInput(event, bindingProfile)
    event.preventDefault()
    onAction(action)
    if (action.type === 'incompatible') onBindingMessage?.(action.explanation)
    else if (action.type === 'unsupported') onBindingMessage?.(`${action.binding} is not supported in this scenario.`)
    else onBindingMessage?.('')
  }

  return <section className="terminal-surface" aria-label={`${name} simulated terminal`}>
    <div className="terminal-toolbar" aria-hidden="true"><span /><span /><span /><strong>{name}</strong></div>
    <div className="terminal-transcript" role="log" aria-live="polite">{lines.map((line, index) => <div className={`terminal-line ${line.kind}`} key={`${index}-${line.text}`}>{line.kind === 'input' && <span aria-hidden="true">{prompt} </span>}{line.text}</div>)}</div>
    <form onSubmit={(event) => { event.preventDefault(); if (!onAction && input.trim()) onSubmit?.(input) }}>
      <label htmlFor="shell-input" className="visually-hidden">{name} input buffer</label><span className="prompt" aria-hidden="true">{prompt}</span>
      <input ref={field} id="shell-input" autoFocus autoComplete="off" spellCheck={false} value={input} onChange={(event) => onInputChange?.(event.target.value)} onKeyDown={keyDown} />
    </form>
  </section>
}
