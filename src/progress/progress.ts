export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface LearningProgress {
  completedChallenges: string[]
  completedLessons: string[]
}

const currentKey = 'terminal-typing:progress:v2'
const legacyKey = 'terminal-typing:progress:v1'
const emptyProgress = (): LearningProgress => ({
  completedChallenges: [],
  completedLessons: [],
})

function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
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

  function add(kind: keyof LearningProgress, id: string): LearningProgress {
    const current = load()
    const next = { ...current, [kind]: [...new Set([...current[kind], id])] }
    save(next)
    return next
  }

  return {
    load,
    completeChallenge: (id: string) => add('completedChallenges', id),
    completeLesson: (id: string) => add('completedLessons', id),
  }
}
