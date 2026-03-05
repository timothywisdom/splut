/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import PlayerCountSelector from '@/components/lobby/PlayerCountSelector'

// Feature: Lobby UI Layout
// Rule: Player count buttons must fill their container equally

describe('Feature: Lobby UI Layout', () => {
  describe('Rule: Player count buttons must fill their container equally', () => {
    // Scenario: Player count buttons have equal width with no trailing space
    it('player count buttons should each stretch equally to fill the container (no trailing space)', () => {
      render(React.createElement(PlayerCountSelector, { value: null, onChange: () => {} }))

      const buttons = [
        screen.getByTestId('player-count-2'),
        screen.getByTestId('player-count-3'),
        screen.getByTestId('player-count-4'),
      ]

      for (const button of buttons) {
        // Each button must use flex-1 to fill available space equally
        expect(button.className).toMatch(/flex-1/)
        // Must NOT use a fixed width class (w-20, w-24, etc.) which causes trailing space
        expect(button.className).not.toMatch(/\bw-\d+\b/)
      }
    })
  })
})
