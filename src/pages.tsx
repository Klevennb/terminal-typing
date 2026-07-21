import { useState } from 'react'
import {
  allChallenges,
  curriculum,
  type Challenge,
  type Lesson,
} from './curriculum'
import { createLessonRun } from './domain/lessonRun'
import { createScenarioSession, type ScenarioState } from './domain/scenario'
import { href } from './navigation/routes'
import { createProgressStore } from './progress/progress'
import { TerminalSurface } from './terminal/TerminalSurface'

const store = () => createProgressStore(window.localStorage)
const shellName = (shell: Lesson['shell']) =>
  shell === 'powershell' ? 'PowerShell' : shell === 'bash' ? 'Bash' : 'Zsh'

function ProgressMark({ complete }: { complete: boolean }) {
  return complete ? <span className="progress-mark">Completed</span> : null
}

export function LandingPage() {
  return (
    <>
      <section className="intro landing" aria-labelledby="page-title">
        <p className="eyebrow">PowerShell · Bash · Zsh</p>
        <h1 id="page-title">Build real shell fluency.</h1>
        <p>Practice shell commands through short, focused lessons and challenges.</p>
        <div className="hero-actions">
          <a className="button primary" href={href({ page: 'lessons' })}>Browse lessons</a>
          <a className="button secondary" href={href({ page: 'challenges' })}>Choose a challenge</a>
        </div>
      </section>
      <section className="feature-grid" aria-label="How practice works">
        <article><span>01</span><h2>Choose a shell</h2><p>Start with PowerShell, Bash, or Zsh.</p></article>
        <article><span>02</span><h2>Learn by doing</h2><p>Type each command and get immediate feedback.</p></article>
        <article><span>03</span><h2>Build your skills</h2><p>Complete a lesson or practice one challenge at a time.</p></article>
      </section>
    </>
  )
}

export function LessonCatalogPage() {
  const progress = store().load()
  return (
    <CatalogHeader eyebrow="Lessons" title="Choose a lesson" description="Each lesson includes three challenges presented in a fresh order." >
      <div className="card-grid">
        {curriculum.map((lesson) => (
          <a className="catalog-card" href={href({ page: 'lesson', lessonId: lesson.id })} key={lesson.id}>
            <div><span className="shell-tag">{shellName(lesson.shell)}</span><ProgressMark complete={progress.completedLessons.includes(lesson.id)} /></div>
            <h2>{lesson.title}</h2><p>{lesson.description}</p>
            <strong>{lesson.challengePool.length} challenges <span aria-hidden="true">→</span></strong>
          </a>
        ))}
      </div>
    </CatalogHeader>
  )
}

export function ChallengeCatalogPage() {
  const progress = store().load()
  return (
    <CatalogHeader eyebrow="Practice" title="Choose a challenge" description="Practice one command at a time whenever you want a quick session.">
      <div className="challenge-groups">
        {curriculum.map((lesson) => (
          <section key={lesson.id} aria-labelledby={`${lesson.id}-title`}>
            <h2 id={`${lesson.id}-title`}>{lesson.title}</h2>
            <div className="challenge-list">
              {lesson.challengePool.map((challenge, index) => (
                <a href={href({ page: 'challenge', challengeId: challenge.id })} key={challenge.id}>
                  <span className="challenge-number">{String(index + 1).padStart(2, '0')}</span>
                  <span><strong>{challenge.title}</strong><small>{challenge.description}</small></span>
                  <ProgressMark complete={progress.completedChallenges.includes(challenge.id)} />
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </CatalogHeader>
  )
}

function CatalogHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="catalog-page" aria-labelledby="catalog-title"><p className="eyebrow">{eyebrow}</p><h1 id="catalog-title">{title}</h1><p className="lede">{description}</p>{children}</section>
}

export function LessonDetailPage({ lesson }: { lesson: Lesson }) {
  const progress = store().load()
  return (
    <section className="detail-page" aria-labelledby="lesson-title">
      <a className="back-link" href={href({ page: 'lessons' })}>← All lessons</a>
      <p className="eyebrow">{shellName(lesson.shell)} · Command lesson</p>
      <h1 id="lesson-title">{lesson.title}</h1><p className="lede">{lesson.description}</p>
      <a className="button primary" href={href({ page: 'lesson-run', lessonId: lesson.id })}>Start lesson</a>
      <div className="lesson-outline"><h2>In this lesson</h2>
        <ol>{lesson.challengePool.map((challenge) => <li key={challenge.id}><span>{challenge.title}<small>{challenge.description}</small></span><ProgressMark complete={progress.completedChallenges.includes(challenge.id)} /></li>)}</ol>
      </div>
    </section>
  )
}

function Practice({ challenge, onComplete, attempt }: { challenge: Challenge; onComplete(): void; attempt: number }) {
  const [session] = useState(() => createScenarioSession(challenge.scenario))
  const [state, setState] = useState<ScenarioState>(() => session.getState())
  const [input, setInput] = useState('')
  const [bindingMessage, setBindingMessage] = useState('')

  function submit(command: string) {
    const next = session.dispatch({ type: 'submit', input: command })
    setState(next); setInput(''); setBindingMessage('')
    if (next.status === 'completed') onComplete()
  }

  return (
    <div className="practice" data-attempt={attempt}>
      <div className="lesson-copy"><p className="eyebrow">{shellName(challenge.scenario.shell)} · Challenge</p><h1>{challenge.title}</h1><p>{challenge.description}</p>
        <div className="challenge-card"><span>Recommended command</span><code>{challenge.scenario.goal.command}</code><p>Type the command, then press Enter.</p></div>
        {bindingMessage && <p className="binding-message" role="status">{bindingMessage}</p>}
      </div>
      <TerminalSurface shell={challenge.scenario.shell} bindingProfile={challenge.scenario.bindingProfile} lines={state.lines} input={input} onInputChange={setInput} onSubmit={submit} onBindingMessage={setBindingMessage} />
    </div>
  )
}

export function ChallengePage({ challenge }: { challenge: Challenge }) {
  const [complete, setComplete] = useState(false)
  const [attempt, setAttempt] = useState(0)
  function completed() { store().completeChallenge(challenge.id); setComplete(true) }
  function retry() { setComplete(false); setAttempt((value) => value + 1) }
  return <section className="practice-page"><a className="back-link" href={href({ page: 'challenges' })}>← All challenges</a><Practice key={attempt} challenge={challenge} onComplete={completed} attempt={attempt} />{complete && <CompletionActions message="Challenge complete" primary="Retry challenge" onPrimary={retry} backHref={href({ page: 'challenges' })} backLabel="Back to challenges" />}</section>
}

export function LessonRunPage({ lesson }: { lesson: Lesson }) {
  const [run, setRun] = useState(() => createLessonRun(lesson))
  const [challenge, setChallenge] = useState(() => run.currentChallenge())
  const [challengeComplete, setChallengeComplete] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const position = run.position()

  function completed() { if (challenge) store().completeChallenge(challenge.id); setChallengeComplete(true) }
  function next() { const upcoming = run.advance(); setChallenge(upcoming); setChallengeComplete(false); setAttempt((value) => value + 1); if (!upcoming) store().completeLesson(lesson.id) }
  function retry() { run.retry(); setChallengeComplete(false); setAttempt((value) => value + 1) }
  function practiceAgain() { const nextRun = createLessonRun(lesson); setRun(nextRun); setChallenge(nextRun.currentChallenge()); setChallengeComplete(false); setAttempt((value) => value + 1) }

  if (!challenge) return <section className="summary-page"><p className="eyebrow">Lesson complete</p><h1>{lesson.title}</h1><p>You completed all {position.total} challenges in this lesson.</p><CompletionActions message="All challenges complete" primary="Practice again" onPrimary={practiceAgain} backHref={href({ page: 'lesson', lessonId: lesson.id })} backLabel="Back to lesson" /></section>
  return <section className="practice-page"><div className="run-bar"><a className="back-link" href={href({ page: 'lesson', lessonId: lesson.id })}>← Leave run</a><span>Challenge {position.current} of {position.total}</span></div><Practice key={`${challenge.id}-${attempt}`} challenge={challenge} onComplete={completed} attempt={attempt} />{challengeComplete && <CompletionActions message="Challenge complete" primary={position.current === position.total ? 'Finish lesson' : 'Next challenge'} onPrimary={next} secondary="Retry challenge" onSecondary={retry} />}</section>
}

function CompletionActions({ message, primary, onPrimary, secondary, onSecondary, backHref, backLabel }: { message: string; primary: string; onPrimary(): void; secondary?: string; onSecondary?(): void; backHref?: string; backLabel?: string }) {
  return <div className="completion-panel" role="status"><strong>✓ {message}</strong><div><button className="button primary" type="button" onClick={onPrimary}>{primary}</button>{secondary && <button className="button secondary" type="button" onClick={onSecondary}>{secondary}</button>}{backHref && <a className="button secondary" href={backHref}>{backLabel}</a>}</div></div>
}

export function NotFoundPage() {
  return <section className="not-found"><p className="eyebrow">404</p><h1>That practice page was not found.</h1><p>It may have moved or no longer be available.</p><a className="button primary" href={href({ page: 'landing' })}>Return home</a></section>
}

// Assert authored IDs remain globally unique at module load, close to their boundary.
if (new Set(allChallenges().map((item) => item.id)).size !== allChallenges().length) {
  throw new Error('Challenge IDs must be unique across the curriculum.')
}
