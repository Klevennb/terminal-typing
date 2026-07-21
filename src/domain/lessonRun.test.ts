import { describe, expect, it } from 'vitest'
import { curriculum } from '../curriculum'
import { createLessonRun } from './lessonRun'

describe('Lesson Run', () => {
  it('presents every pooled challenge exactly once in randomized order', () => {
    const lesson = curriculum[0]
    const run = createLessonRun(lesson, () => 0)
    const visited: string[] = []

    while (!run.isComplete()) {
      visited.push(run.currentChallenge()!.id)
      run.advance()
    }

    expect(visited).toHaveLength(lesson.challengePool.length)
    expect(new Set(visited)).toEqual(
      new Set(lesson.challengePool.map((challenge) => challenge.id)),
    )
  })

  it('retries in place and advances only when explicitly requested', () => {
    const run = createLessonRun(curriculum[0], () => 0.5)
    const first = run.currentChallenge()
    expect(run.retry()).toBe(first)
    expect(run.position().current).toBe(1)
    expect(run.advance()).not.toBe(first)
    expect(run.position().current).toBe(2)
  })
})
