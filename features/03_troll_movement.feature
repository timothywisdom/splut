@troll @movement
Feature: Troll Movement and Pull Back
  As a player
  I want my Troll to move one square orthogonally and optionally drag a Rock behind it
  So that I can reposition my Troll and strategically move Rocks around the board

  Background:
    Given a game is in progress
    And it is the current player's turn with moves available

  # -------------------------------------------------------------------
  # Basic Troll Movement
  # -------------------------------------------------------------------

  Rule: The Troll moves exactly one square horizontally or vertically

    @critical
    Scenario Outline: Troll moves one square in a cardinal direction
      Given the current player's Troll is on square "<from>"
      And square "<to>" is empty
      When the player moves their Troll to square "<to>"
      Then the Troll should be on square "<to>"
      And square "<from>" should be empty
      And 1 move should be consumed

      Examples:
        | from | to  |
        | E5   | E6  |
        | E5   | E4  |
        | E5   | D5  |
        | E5   | F5  |

    @error
    Scenario: Troll cannot move diagonally
      Given the current player's Troll is on square "E5"
      When the player attempts to move their Troll to square "F6"
      Then the move should be rejected with an error "diagonal movement is not allowed"
      And the Troll should remain on square "E5"

    @error
    Scenario: Troll cannot move more than one square
      Given the current player's Troll is on square "E5"
      When the player attempts to move their Troll to square "E7"
      Then the move should be rejected with an error "can only move one square at a time"

    @error
    Scenario: Troll cannot move to an occupied square
      Given the current player's Troll is on square "E5"
      And square "E6" is occupied by another piece
      When the player attempts to move their Troll to square "E6"
      Then the move should be rejected with an error "cannot move to an occupied square"

    @error
    Scenario: Troll cannot move off the board
      Given the current player's Troll is on a square at the edge of the diamond
      When the player attempts to move their Troll off the board
      Then the move should be rejected with an error "cannot move off the board"

  # -------------------------------------------------------------------
  # Pull Back (Dragging a Rock)
  # -------------------------------------------------------------------

  Rule: When moving, the Troll may optionally drag a Rock from an adjacent square onto the square it vacated

    @critical
    Scenario: Troll pulls a Rock behind it when moving forward
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E4"
      When the player moves their Troll to square "E6" with Pull Back
      Then the Troll should be on square "E6"
      And the Rock should be on square "E5"
      And square "E4" should be empty

    @critical
    Scenario: Pull Back requires the Rock to be in line with the movement direction
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E4"
      When the player moves their Troll to square "E6" with Pull Back
      Then the Pull Back should succeed
      And the Rock should move from "E4" to "E5"

    Scenario: Troll pulls Rock from the left when moving right
      Given the current player's Troll is on square "E5"
      And a Rock is on square "D5"
      When the player moves their Troll to square "F5" with Pull Back
      Then the Troll should be on square "F5"
      And the Rock should be on square "E5"

    Scenario: Troll pulls Rock from the right when moving left
      Given the current player's Troll is on square "E5"
      And a Rock is on square "F5"
      When the player moves their Troll to square "D5" with Pull Back
      Then the Troll should be on square "D5"
      And the Rock should be on square "E5"

    Scenario: Troll pulls Rock from above when moving down
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E6"
      When the player moves their Troll to square "E4" with Pull Back
      Then the Troll should be on square "E4"
      And the Rock should be on square "E5"

    Scenario: Pull Back is optional
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E4"
      When the player moves their Troll to square "E6" without Pull Back
      Then the Troll should be on square "E6"
      And the Rock should remain on square "E4"

  # -------------------------------------------------------------------
  # Pull Back Constraints
  # -------------------------------------------------------------------

  Rule: Pull Back only works with a Rock that is behind the Troll relative to its movement direction

    @error @edge-case
    Scenario: Cannot Pull Back a Rock that is not in line with movement
      Given the current player's Troll is on square "E5"
      And a Rock is on square "D5"
      When the player moves their Troll to square "E6" with Pull Back from "D5"
      Then the Pull Back should be rejected with an error "Rock must be in line with movement direction"

    @error
    Scenario: Cannot Pull Back when there is no Rock adjacent in the pull direction
      Given the current player's Troll is on square "E5"
      And no Rock is adjacent to "E5" in the direction opposite to the Troll's movement
      When the player moves their Troll to square "E6" with Pull Back
      Then the Pull Back should be rejected with an error "no Rock to pull"

    @edge-case
    Scenario: Cannot Pull Back a piece that is not a Rock
      Given the current player's Troll is on square "E5"
      And a Dwarf is on square "E4"
      And no Rock is on square "E4"
      When the player moves their Troll to square "E6" with Pull Back
      Then the Pull Back should be rejected with an error "can only pull a Rock"

    @edge-case
    Scenario: Troll can choose which adjacent Rock to pull when multiple are nearby
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E4"
      And a Rock is on square "D5"
      When the player moves their Troll to square "E6" with Pull Back
      Then only the Rock on "E4" is eligible for Pull Back
      And the Rock should move from "E4" to "E5"

  # -------------------------------------------------------------------
  # Pull Back Interaction with Troll Throw
  # -------------------------------------------------------------------

  Rule: Pull Back occurs as part of the Troll's movement step, before any throw check

    @edge-case
    Scenario: Troll cannot Pull Back a Rock onto itself to trigger a throw
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E4"
      When the player moves their Troll to square "E6" with Pull Back
      Then the Rock should move to "E5" which the Troll just vacated
      And the Troll should not be required to throw
