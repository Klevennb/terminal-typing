import { describe, expect, it } from 'vitest'
import { allChallenges, curriculum } from './curriculum'
import { createScenarioSession } from './domain/scenario'

describe('bundled curriculum', () => {
  it('provides three command challenges for each initial shell', () => {
    expect(curriculum.map((lesson) => [lesson.shell, lesson.challengePool.length])).toEqual([
      ['powershell', 3], ['bash', 3], ['zsh', 3],
    ])
  })

  it('completes all nine scenarios using their recommended command', () => {
    for (const challenge of allChallenges()) {
      const originalWorkspace = structuredClone(challenge.scenario.initialWorkspace)
      const result = createScenarioSession(challenge.scenario).dispatch({
        type: 'submit', input: challenge.scenario.goal.command,
      })
      expect(result.status, challenge.id).toBe('completed')
      expect(result.workspace, challenge.id).toEqual(originalWorkspace)
    }
  })
})
