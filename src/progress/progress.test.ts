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

  it('migrates current completions into the Warm-up capable record', () => {
    const storage = memoryStorage({
      'terminal-typing:progress:v2': JSON.stringify({
        completedChallenges: ['challenge-one'],
        completedLessons: ['lesson-one'],
      }),
    })

    expect(createProgressStore(storage).load()).toMatchObject({
      completedChallenges: ['challenge-one'],
      completedLessons: ['lesson-one'],
    })
  })

  it('retains independent Warm-up Personal Bests only from unassisted Attempts', () => {
    const store = createProgressStore(memoryStorage())
    store.recordWarmup({ wpm: 40, accuracy: 95, assisted: false }, 12, '2026-07-21T12:00:00.000Z')
    store.recordWarmup({ wpm: 38, accuracy: 98, assisted: false }, 13, '2026-07-21T12:01:00.000Z')
    store.recordWarmup({ wpm: 90, accuracy: 100, assisted: true }, 14, '2026-07-21T12:02:00.000Z')

    expect(store.load()).toMatchObject({
      warmupBestWpm: { value: 40, seed: 12 },
      warmupBestAccuracy: { value: 98, seed: 13 },
    })
  })
})
