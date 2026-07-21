import { describe, expect, it } from 'vitest'
import { href, parseRoute } from './routes'

describe('hash routes', () => {
  it.each([
    ['#/', { page: 'landing' }],
    ['#/lessons', { page: 'lessons' }],
    ['#/lessons/bash-first-steps', { page: 'lesson', lessonId: 'bash-first-steps' }],
    ['#/lessons/bash-first-steps/run', { page: 'lesson-run', lessonId: 'bash-first-steps' }],
    ['#/challenges', { page: 'challenges' }],
    ['#/challenges/bash-read-file', { page: 'challenge', challengeId: 'bash-read-file' }],
    ['#/warm-ups', { page: 'warm-ups' }],
    ['#/warm-ups/run', { page: 'warm-up-run' }],
  ])('parses %s', (hash, expected) => {
    expect(parseRoute(hash)).toEqual(expected)
  })

  it('represents unknown paths as a recoverable not-found destination', () => {
    expect(parseRoute('#/somewhere')).toEqual({ page: 'not-found' })
    expect(href({ page: 'landing' })).toBe('#/')
  })
})
