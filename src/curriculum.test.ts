import { describe, expect, it } from 'vitest'
import { allChallenges, curriculum } from './curriculum'
import { createScenarioSession } from './domain/scenario'

describe('bundled curriculum', () => {
  it('provides command and mixed-fundamentals efficiency lessons for each initial shell', () => {
    expect(curriculum.map((lesson) => [lesson.shell, lesson.kind, lesson.challengePool.length])).toEqual([
      ['powershell', 'command', 3], ['bash', 'command', 3], ['zsh', 'command', 3],
      ['powershell', 'efficiency', 5], ['bash', 'efficiency', 5], ['zsh', 'efficiency', 5],
    ])
  })

  it('completes all nine scenarios using their recommended command', () => {
    for (const challenge of allChallenges().filter((item) => !item.scenario.recommendedActions)) {
      const originalWorkspace = structuredClone(challenge.scenario.initialWorkspace)
      const result = createScenarioSession(challenge.scenario).dispatch({
        type: 'submit', input: challenge.scenario.goal.command,
      })
      expect(result.status, challenge.id).toBe('completed')
      expect(result.workspace, challenge.id).toEqual(originalWorkspace)
    }
  })
})
