export type Route =
  | { page: 'landing' }
  | { page: 'lessons' }
  | { page: 'lesson'; lessonId: string }
  | { page: 'lesson-run'; lessonId: string }
  | { page: 'challenges' }
  | { page: 'challenge'; challengeId: string }
  | { page: 'not-found' }

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent)
  if (parts.length === 0) return { page: 'landing' }
  if (parts.length === 1 && parts[0] === 'lessons') return { page: 'lessons' }
  if (parts.length === 2 && parts[0] === 'lessons') {
    return { page: 'lesson', lessonId: parts[1] }
  }
  if (parts.length === 3 && parts[0] === 'lessons' && parts[2] === 'run') {
    return { page: 'lesson-run', lessonId: parts[1] }
  }
  if (parts.length === 1 && parts[0] === 'challenges') return { page: 'challenges' }
  if (parts.length === 2 && parts[0] === 'challenges') {
    return { page: 'challenge', challengeId: parts[1] }
  }
  return { page: 'not-found' }
}

export function href(route: Exclude<Route, { page: 'not-found' }>): string {
  switch (route.page) {
    case 'landing': return '#/'
    case 'lessons': return '#/lessons'
    case 'lesson': return `#/lessons/${encodeURIComponent(route.lessonId)}`
    case 'lesson-run': return `#/lessons/${encodeURIComponent(route.lessonId)}/run`
    case 'challenges': return '#/challenges'
    case 'challenge': return `#/challenges/${encodeURIComponent(route.challengeId)}`
  }
}
