import { describe, expect, it } from 'vitest'
import { createProgressStore, type KeyValueStorage } from './progress'

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

describe('learning progress', () => {
  it('migrates challenge completions from the original browser record', () => {
    const storage = memoryStorage({
      'terminal-typing:progress:v1': JSON.stringify({ completedChallenges: ['old-challenge'] }),
    })

    expect(createProgressStore(storage).load()).toEqual({
      completedChallenges: ['old-challenge'],
      completedLessons: [],
    })
  })

  it('recovers safely when browser storage contains corrupt data', () => {
    const storage = memoryStorage({ 'terminal-typing:progress:v2': '{not-json' })
    expect(createProgressStore(storage).load()).toEqual({
      completedChallenges: [],
      completedLessons: [],
    })
  })

  it('deduplicates challenge and lesson completions independently', () => {
    const store = createProgressStore(memoryStorage())
    store.completeChallenge('challenge-one')
    store.completeChallenge('challenge-one')
    store.completeLesson('lesson-one')

    expect(store.load()).toEqual({
      completedChallenges: ['challenge-one'],
      completedLessons: ['lesson-one'],
    })
  })
})
