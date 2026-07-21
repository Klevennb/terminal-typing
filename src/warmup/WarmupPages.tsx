import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { href } from '../navigation/routes'
import { createProgressStore } from '../progress/progress'
import { createWarmupAttempt, generateWarmupPrompt, type WarmupAttempt, type WarmupState } from './warmup'

const store = () => createProgressStore(window.localStorage)
const newSeed = () => Date.now() >>> 0

export function WarmupsPage() {
  const progress = store().load()
  return <section className="detail-page warmup-intro" aria-labelledby="warmups-title">
    <p className="eyebrow">Warm-ups</p><h1 id="warmups-title">Get your hands ready.</h1>
    <p className="lede">Type a short mix of commands, paths, flags, URLs, and shell punctuation. Your speed and character accuracy are scored separately.</p>
    <a className="button primary" href={href({ page: 'warm-up-run' })}>Start a warm-up</a>
    <section className="personal-bests" aria-labelledby="personal-bests-title"><h2 id="personal-bests-title">Personal Bests</h2><div>
      <p><strong>{progress.warmupBestWpm?.value ?? '—'}</strong><span>Words per minute</span></p>
      <p><strong>{progress.warmupBestAccuracy ? `${progress.warmupBestAccuracy.value}%` : '—'}</strong><span>Character accuracy</span></p>
    </div></section>
  </section>
}

const freshAttempt = (seed: number) => {
  const attempt = createWarmupAttempt(generateWarmupPrompt(seed))
  return { attempt, state: attempt.getState() }
}

export function WarmupRunPage() {
  const [attempt, setAttempt] = useState<WarmupAttempt>(() => freshAttempt(newSeed()).attempt)
  const [state, setState] = useState<WarmupState>(() => attempt.getState())
  const [announcement, setAnnouncement] = useState('Ready to start Warm-up.')
  const startButton = useRef<HTMLButtonElement>(null)
  const typingArea = useRef<HTMLDivElement>(null)

  useEffect(() => { startButton.current?.focus() }, [attempt])
  useEffect(() => {
    function visibilityChanged() {
      const next = attempt.setVisibility(!document.hidden, performance.now())
      setState(next)
      if (next.status === 'paused') setAnnouncement('Warm-up paused. This Attempt is now assisted.')
      if (next.status === 'active' && next.assistReasons.includes('left-active-tab')) {
        setAnnouncement('Warm-up resumed. This Attempt is assisted.')
        typingArea.current?.focus()
      }
    }
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => document.removeEventListener('visibilitychange', visibilityChanged)
  }, [attempt])

  function start() {
    setState(attempt.start(performance.now()))
    setAnnouncement('Warm-up started.')
    requestAnimationFrame(() => typingArea.current?.focus())
  }
  function replaceAttempt(seed: number) {
    const next = freshAttempt(seed)
    setAttempt(next.attempt); setState(next.state); setAnnouncement('Ready to start Warm-up.')
  }
  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next: WarmupState | undefined
    if (event.key === 'Backspace') next = attempt.backspace()
    else if (event.key === 'Enter') next = attempt.input('\n', performance.now())
    else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) next = attempt.input(event.key, performance.now())
    if (!next) return
    event.preventDefault(); setState(next)
    const lastIndex = next.typed.length - 1
    if (lastIndex >= 0 && next.typed[lastIndex] !== next.prompt.text[lastIndex]) setAnnouncement(`Incorrect character. Expected ${spokenCharacter(next.prompt.text[lastIndex])}.`)
    if (next.status === 'completed' && next.result) {
      store().recordWarmup(next.result, next.prompt.seed, new Date().toISOString())
      setAnnouncement(`Warm-up complete. ${next.result.wpm} words per minute and ${next.result.accuracy} percent accuracy.`)
    }
  }
  function pasted(event: ClipboardEvent) {
    event.preventDefault(); setState(attempt.assist('paste'))
    setAnnouncement('Paste was not inserted. This Attempt is now assisted.')
  }

  return <section className="warmup-page" aria-labelledby="warmup-title">
    <a className="back-link" href={href({ page: 'warm-ups' })}>← Warm-ups</a>
    <p className="eyebrow">Mixed shell text · Seed {state.prompt.seed}</p>
    <h1 id="warmup-title">{state.status === 'completed' ? 'Warm-up complete' : 'Warm-up'}</h1>
    <p className="visually-hidden" role="status" aria-live="polite">{announcement}</p>
    <p className="warmup-prompt" aria-label="Warm-up prompt">{[...state.prompt.text].map((character, index) => {
      const typed = state.typed[index]
      const status = typed === undefined ? (index === state.typed.length ? 'current' : 'pending') : typed === character ? 'correct' : 'incorrect'
      return <span className={status} key={index} aria-label={status === 'incorrect' ? `incorrect ${spokenCharacter(typed)}, expected ${spokenCharacter(character)}` : undefined}>{character}</span>
    })}</p>
    {state.status === 'ready' && <button ref={startButton} className="button primary" type="button" onClick={start}>Start warm-up</button>}
    {(state.status === 'active' || state.status === 'paused') && <div ref={typingArea} className={`warmup-typing ${state.status}`} role="textbox" aria-label="Warm-up typing area" aria-multiline="true" tabIndex={0} onKeyDown={keyDown} onPaste={pasted}>{state.status === 'paused' ? 'Paused while this tab is inactive' : 'Type the highlighted passage here'}</div>}
    {state.status === 'completed' && state.result && <div className="warmup-results">
      <div><strong>{state.result.wpm}</strong><span>Words per minute</span></div><div><strong>{state.result.accuracy}%</strong><span>Character accuracy</span></div>
      {state.result.assisted && <p className="assist-message">Assisted Attempt — results were not eligible for Personal Bests.</p>}
      <div className="hero-actions"><button className="button primary" type="button" onClick={() => replaceAttempt(state.prompt.seed)}>Retry this prompt</button><button className="button secondary" type="button" onClick={() => replaceAttempt((state.prompt.seed + 1) >>> 0)}>New prompt</button></div>
    </div>}
  </section>
}

function spokenCharacter(character: string) {
  if (character === ' ') return 'space'
  if (character === '\n') return 'new line'
  return character
}
