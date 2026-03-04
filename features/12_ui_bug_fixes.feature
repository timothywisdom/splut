@ui @bug-fix
Feature: UI Bug Fixes
  As a player
  I want the game UI to function correctly
  So that I can play without visual or interaction issues

  # -------------------------------------------------------------------
  # Bug 3: Troll throw should not eliminate wrong pieces
  # -------------------------------------------------------------------

  Rule: When a Rock SPLUTs a Dwarf, only the Dwarf dies — the team is NOT eliminated

    @critical @bug-3
    Scenario: SPLUT kills only the Dwarf, not the entire team
      Given a game is in progress with multiple teams
      And the current player's Troll is on a Rock (pendingThrow is true)
      When the player throws the Rock and it SPLUTs an enemy Dwarf
      Then the enemy Dwarf should be marked as dead
      And the enemy team's Sorcerer should remain alive
      And the enemy team's Troll should remain alive
      And the enemy team should NOT be eliminated
      And the Rock should land on the Dwarf's former square

    @critical @bug-3
    Scenario: SPLUT does not affect the throwing player's pieces
      Given a game is in progress
      And the current player's Troll throws a Rock that SPLUTs a Dwarf
      Then all of the throwing player's pieces should remain alive and on the board
      And the throwing player's Troll should remain on its square
      And the throwing player's Sorcerer should remain alive
      And the throwing player's Dwarf should remain alive

    @critical @bug-3
    Scenario: Only Sorcerer death triggers team elimination
      Given a game is in progress
      And the current player's Troll throws a Rock that hits an enemy Sorcerer
      Then the enemy Sorcerer should be killed
      And the enemy team should be eliminated
      And all enemy team pieces should be removed from the board

  # -------------------------------------------------------------------
  # Bug 4: Battle log must not grow the page
  # -------------------------------------------------------------------

  Rule: The battle log must be contained in a fixed-height scrollable area

    @critical @bug-4
    Scenario: Battle log does not increase overall page height
      Given a game is in progress
      And the battle log has many entries
      Then the battle log should scroll internally
      And the game board should not move vertically as the log grows
      And the page should not have a vertical scrollbar due to the log

    @bug-4
    Scenario: Battle log auto-scrolls to latest entry
      Given a game is in progress
      When a new action is logged
      Then the battle log should scroll to show the latest entry
      And older entries should remain accessible by scrolling up

  # -------------------------------------------------------------------
  # Bug 5: Board coordinate labels
  # -------------------------------------------------------------------

  Rule: The board must display column letters and row numbers for reference

    @critical @bug-5
    Scenario: Column letters are displayed along the board edges
      Given a game is in progress
      Then column labels "A" through "I" should be visible along the top or bottom of the board
      And the labels should correspond to the correct grid columns

    @critical @bug-5
    Scenario: Row numbers are displayed along the board edges
      Given a game is in progress
      Then row labels "1" through "9" should be visible along the left or right of the board
      And the labels should correspond to the correct grid rows

    @bug-5
    Scenario: Board coordinates match battle log references
      Given a game is in progress
      And the battle log shows a move to "E5"
      Then the player should be able to locate column "E" and row "5" on the board
      And the intersection should match the piece's position on screen

  # -------------------------------------------------------------------
  # Bug 6: Board rotation removal
  # -------------------------------------------------------------------

  Rule: The board must display as a standard grid of squares, not rotated 45 degrees

    @critical @bug-6
    Scenario: Board squares appear as squares, not diamonds
      Given a game is in progress
      Then each cell on the board should appear as an axis-aligned square
      And the board should not be rotated 45 degrees

    @critical @bug-6
    Scenario: Cardinal directions are visually intuitive
      Given a game is in progress
      When the player is asked to choose a throw direction
      Then "N" (North) should point toward the top of the screen
      And "S" (South) should point toward the bottom of the screen
      And "E" (East) should point toward the right of the screen
      And "W" (West) should point toward the left of the screen

    @bug-6
    Scenario: Throw direction picker uses standard compass layout
      Given a Troll has landed on a Rock and must throw
      Then the throw direction picker should show N at the top
      And E at the right
      And S at the bottom
      And W at the left
