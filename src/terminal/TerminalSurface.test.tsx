// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { TerminalSurface } from './TerminalSurface'

describe('TerminalSurface', () => {
  it('normalizes typed input and submission through its focused terminal contract', async () => {
    const onSubmit = vi.fn()
    function Harness() {
      const [input, setInput] = useState('')
      return (
        <TerminalSurface
          shell="powershell"
          bindingProfile="windows-psreadline"
          lines={[]}
          input={input}
          onInputChange={setInput}
          onSubmit={onSubmit}
        />
      )
    }
    render(<Harness />)

    const input = screen.getByLabelText('PowerShell input buffer')
    expect(document.activeElement).toBe(input)
    await userEvent.type(input, 'Get-ChildItem{Enter}')

    expect(onSubmit).toHaveBeenCalledWith('Get-ChildItem')
  })
})
