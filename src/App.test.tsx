// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('application navigation', () => {
  afterEach(cleanup)
  beforeEach(() => {
    window.location.hash = '#/'
    window.localStorage.clear()
  })

  it('offers lesson and challenge entry points without rendering a terminal', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /build real shell fluency/i })).toBeTruthy()
    expect(screen.getByText('PowerShell · Bash · Zsh')).toBeTruthy()
    expect(screen.getByText('Practice shell commands through short, focused lessons and challenges.')).toBeTruthy()
    expect(screen.getByRole('link', { name: /browse lessons/i }).getAttribute('href')).toBe('#/lessons')
    expect(screen.getByRole('link', { name: /choose a challenge/i }).getAttribute('href')).toBe('#/challenges')
    expect(screen.queryByLabelText(/simulated terminal/i)).toBeNull()
    expect(document.body.textContent).not.toMatch(/local-first|telemetry|virtual workspace|static curriculum|saved in this browser/i)
  })

  it('completes a specifically selected challenge and retains its progress', async () => {
    window.location.hash = '#/challenges/bash-print-location'
    render(<App />)

    await userEvent.type(screen.getByLabelText('Bash input buffer'), 'pwd{Enter}')

    expect(screen.getByText(/challenge complete/i)).toBeTruthy()
    expect(createStoredProgress().completedChallenges).toContain('bash-print-location')
  })

  it('recovers from an unknown curriculum destination', () => {
    window.location.hash = '#/lessons/not-a-lesson'
    render(<App />)
    expect(screen.getByRole('heading', { name: /not found/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /return home/i }).getAttribute('href')).toBe('#/')
  })

  it('advances explicitly through a complete Lesson Run and saves lesson completion', async () => {
    window.location.hash = '#/lessons/powershell-first-steps/run'
    render(<App />)

    for (let index = 0; index < 3; index += 1) {
      const card = screen.getByText('Recommended command').parentElement!
      const command = card.querySelector('code')!.textContent!
      await userEvent.type(screen.getByLabelText('PowerShell input buffer'), `${command}{Enter}`)
      await userEvent.click(screen.getByRole('button', { name: /next challenge|finish lesson/i }))
    }

    expect(screen.getByText(/you completed all 3 challenges/i)).toBeTruthy()
    expect(screen.getByText(/all challenges complete/i)).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/saved in this browser|browser storage/i)
    expect(createStoredProgress().completedLessons).toContain('powershell-first-steps')
  })

  it('uses learner-facing copy in catalogs, lesson details, and recovery pages', () => {
    for (const [hash, expected] of [
      ['#/lessons', 'Each lesson includes three challenges presented in a fresh order.'],
      ['#/challenges', 'Practice one command at a time whenever you want a quick session.'],
      ['#/lessons/bash-first-steps', 'In this lesson'],
      ['#/lessons/not-a-lesson', 'It may have moved or no longer be available.'],
    ]) {
      cleanup()
      window.location.hash = hash
      render(<App />)
      expect(screen.getByText(expected)).toBeTruthy()
      expect(document.body.textContent).not.toMatch(/challenge pool|bundled curriculum|local-first|telemetry/i)
    }
  })
})

function createStoredProgress() {
  return JSON.parse(window.localStorage.getItem('terminal-typing:progress:v2') ?? '{}') as {
    completedChallenges: string[]
    completedLessons: string[]
  }
}
