export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface LearningProgress {
  completedChallenges: string[]
  completedLessons: string[]
  warmupBestWpm?: WarmupPersonalBest
  warmupBestAccuracy?: WarmupPersonalBest
}

export interface WarmupPersonalBest {
  value: number
  seed: number
  completedAt: string
}

const currentKey = 'terminal-typing:progress:v3'
const previousKey = 'terminal-typing:progress:v2'
const legacyKey = 'terminal-typing:progress:v1'
const emptyProgress = (): LearningProgress => ({
  completedChallenges: [],
  completedLessons: [],
})

function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function personalBest(value: unknown): value is WarmupPersonalBest {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<WarmupPersonalBest>
  return typeof candidate.value === 'number' && Number.isFinite(candidate.value)
    && typeof candidate.seed === 'number' && Number.isFinite(candidate.seed)
    && typeof candidate.completedAt === 'string'
}

function parseCurrent(value: string | null): LearningProgress | undefined {
  if (!value) return undefined
  const parsed: unknown = JSON.parse(value)
  if (!parsed || typeof parsed !== 'object') return undefined
  const candidate = parsed as Partial<LearningProgress>
  if (!stringArray(candidate.completedChallenges) || !stringArray(candidate.completedLessons)) return undefined
  return {
    completedChallenges: [...new Set(candidate.completedChallenges)],
    completedLessons: [...new Set(candidate.completedLessons)],
    ...(personalBest(candidate.warmupBestWpm) && { warmupBestWpm: candidate.warmupBestWpm }),
    ...(personalBest(candidate.warmupBestAccuracy) && { warmupBestAccuracy: candidate.warmupBestAccuracy }),
  }
}

function parseLegacy(value: string | null): LearningProgress | undefined {
  if (!value) return undefined
  const parsed: unknown = JSON.parse(value)
  if (!parsed || typeof parsed !== 'object') return undefined
  const completed = (parsed as { completedChallenges?: unknown }).completedChallenges
  return stringArray(completed)
    ? { completedChallenges: [...new Set(completed)], completedLessons: [] }
    : undefined
}

export function createProgressStore(storage: KeyValueStorage) {
  function save(progress: LearningProgress) {
    storage.setItem(currentKey, JSON.stringify(progress))
  }

  function load(): LearningProgress {
    try {
      const current = parseCurrent(storage.getItem(currentKey))
      if (current) return current
    } catch {
      storage.removeItem(currentKey)
      return emptyProgress()
    }
    try {
      const previous = parseCurrent(storage.getItem(previousKey))
      if (previous) {
        save(previous)
        return previous
      }
    } catch {
      storage.removeItem(previousKey)
      return emptyProgress()
    }
    try {
      const migrated = parseLegacy(storage.getItem(legacyKey))
      if (migrated) {
        save(migrated)
        return migrated
      }
    } catch {
      storage.removeItem(legacyKey)
    }
    return emptyProgress()
  }

  function add(kind: 'completedChallenges' | 'completedLessons', id: string): LearningProgress {
    const current = load()
    const next = { ...current, [kind]: [...new Set([...current[kind], id])] }
    save(next)
    return next
  }

  return {
    load,
    completeChallenge: (id: string) => add('completedChallenges', id),
    completeLesson: (id: string) => add('completedLessons', id),
    recordWarmup(
      result: { wpm: number; accuracy: number; assisted: boolean },
      seed: number,
      completedAt: string,
    ) {
      const current = load()
      if (result.assisted) return current
      const next: LearningProgress = { ...current }
      if (!current.warmupBestWpm || result.wpm > current.warmupBestWpm.value) {
        next.warmupBestWpm = { value: result.wpm, seed, completedAt }
      }
      if (!current.warmupBestAccuracy || result.accuracy > current.warmupBestAccuracy.value) {
        next.warmupBestAccuracy = { value: result.accuracy, seed, completedAt }
      }
      save(next)
      return next
    },
  }
}
