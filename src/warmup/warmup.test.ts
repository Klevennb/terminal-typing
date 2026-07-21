import { describe, expect, it } from 'vitest'
import { createWarmupAttempt, generateWarmupPrompt } from './warmup'

describe('Warm-up prompts', () => {
  it('reproducibly assembles a mixed shell prompt within the target length', () => {
    const first = generateWarmupPrompt(42)
    const repeated = generateWarmupPrompt(42)
    const different = generateWarmupPrompt(43)

    expect(first).toEqual(repeated)
    expect(different.text).not.toBe(first.text)
    expect(first.text.length).toBeGreaterThanOrEqual(180)
    expect(first.text.length).toBeLessThanOrEqual(240)
    expect(first.text.includes('/') || first.text.includes('\\')).toBe(true)
    expect(first.text).toMatch(/--?\w/)
  })
})

describe('Warm-up Attempt', () => {
  it('starts explicitly and reports WPM and character accuracy on completion', () => {
    const attempt = createWarmupAttempt({ seed: 7, text: 'abc' })

    expect(attempt.getState().status).toBe('ready')
    attempt.start(1_000)
    attempt.input('a', 2_000)
    attempt.input('x', 3_000)
    attempt.backspace()
    attempt.input('b', 4_000)
    const completed = attempt.input('c', 7_000)

    expect(completed.status).toBe('completed')
    expect(completed.result).toMatchObject({
      elapsedMs: 6_000,
      wpm: 6,
      accuracy: 75,
      assisted: false,
    })
  })

  it('pauses while hidden and marks the Attempt assisted', () => {
    const attempt = createWarmupAttempt({ seed: 7, text: 'ab' })
    attempt.start(1_000)
    attempt.input('a', 2_000)
    attempt.setVisibility(false, 3_000)
    attempt.setVisibility(true, 8_000)
    const completed = attempt.input('b', 10_000)

    expect(completed.result).toMatchObject({ elapsedMs: 4_000, assisted: true })
    expect(completed.assistReasons).toContain('left-active-tab')
  })

  it('records paste as an Assist without inserting clipboard text', () => {
    const attempt = createWarmupAttempt({ seed: 7, text: 'a' })
    attempt.start(0)
    const assisted = attempt.assist('paste')
    expect(assisted.typed).toBe('')
    expect(assisted.assistReasons).toEqual(['paste'])
  })
})
