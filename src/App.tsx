import { useEffect, useRef } from 'react'
import './App.css'
import { findChallenge, findLesson } from './curriculum'
import { href, type Route } from './navigation/routes'
import { useRoute } from './navigation/useRoute'
import {
  ChallengeCatalogPage,
  ChallengePage,
  LandingPage,
  LessonCatalogPage,
  LessonDetailPage,
  LessonRunPage,
  NotFoundPage,
} from './pages'
import { WarmupRunPage, WarmupsPage } from './warmup/WarmupPages'

const titles: Record<Route['page'], string> = {
  landing: 'Terminal Typing',
  lessons: 'Lessons · Terminal Typing',
  lesson: 'Lesson · Terminal Typing',
  'lesson-run': 'Lesson Run · Terminal Typing',
  challenges: 'Challenges · Terminal Typing',
  challenge: 'Challenge · Terminal Typing',
  'warm-ups': 'Warm-ups · Terminal Typing',
  'warm-up-run': 'Warm-up · Terminal Typing',
  'not-found': 'Not found · Terminal Typing',
}

function Page({ route }: { route: Route }) {
  if (route.page === 'landing') return <LandingPage />
  if (route.page === 'lessons') return <LessonCatalogPage />
  if (route.page === 'challenges') return <ChallengeCatalogPage />
  if (route.page === 'lesson') {
    const lesson = findLesson(route.lessonId)
    return lesson ? <LessonDetailPage lesson={lesson} /> : <NotFoundPage />
  }
  if (route.page === 'lesson-run') {
    const lesson = findLesson(route.lessonId)
    return lesson ? <LessonRunPage key={lesson.id} lesson={lesson} /> : <NotFoundPage />
  }
  if (route.page === 'challenge') {
    const challenge = findChallenge(route.challengeId)
    return challenge ? <ChallengePage key={challenge.id} challenge={challenge} /> : <NotFoundPage />
  }
  if (route.page === 'warm-ups') return <WarmupsPage />
  if (route.page === 'warm-up-run') return <WarmupRunPage />
  return <NotFoundPage />
}

function App() {
  const route = useRoute()
  const content = useRef<HTMLElement>(null)

  useEffect(() => {
    document.title = titles[route.page]
    if (route.page !== 'warm-up-run') content.current?.focus()
  }, [route])

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href={href({ page: 'landing' })} aria-label="Terminal Typing home">
          <span aria-hidden="true">&gt;_</span> terminal typing
        </a>
        <nav aria-label="Primary navigation">
          <a href={href({ page: 'lessons' })}>Lessons</a>
          <a href={href({ page: 'challenges' })}>Challenges</a>
          <a href={href({ page: 'warm-ups' })}>Warm-ups</a>
        </nav>
      </header>
      <main ref={content} tabIndex={-1}>
        <Page route={route} />
      </main>
    </div>
  )
}

export default App
