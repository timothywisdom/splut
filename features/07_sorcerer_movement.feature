@sorcerer @movement @levitate
Feature: Sorcerer Movement and Levitate
  As a player
  I want my Sorcerer to move and optionally levitate a Rock alongside it
  So that I can reposition Rocks without using my Troll

  Background:
    Given a game is in progress
    And it is the current player's turn with moves available

  # -------------------------------------------------------------------
  # Basic Sorcerer Movement
  # -------------------------------------------------------------------

  Rule: The Sorcerer moves exactly one square horizontally or vertically

    @critical
    Scenario Outline: Sorcerer moves one square in a cardinal direction
      Given the current player's Sorcerer is on square "<from>"
      And square "<to>" is empty
      When the player moves their Sorcerer to square "<to>"
      Then the Sorcerer should be on square "<to>"
      And square "<from>" should be empty
      And 1 move should be consumed

      Examples:
        | from | to  |
        | E5   | E6  |
        | E5   | E4  |
        | E5   | D5  |
        | E5   | F5  |

    @error
    Scenario: Sorcerer cannot move diagonally
      Given the current player's Sorcerer is on square "E5"
      When the player attempts to move their Sorcerer to square "F6"
      Then the move should be rejected with an error "diagonal movement is not allowed"

    @error
    Scenario: Sorcerer cannot move to an occupied square
      Given the current player's Sorcerer is on square "E5"
      And square "E6" is occupied by a piece
      When the player attempts to move their Sorcerer to square "E6"
      Then the move should be rejected with an error "cannot move to an occupied square"

    @error
    Scenario: Sorcerer cannot move off the board
      Given the current player's Sorcerer is on a square at the edge of the diamond
      When the player attempts to move their Sorcerer off the board
      Then the move should be rejected with an error "cannot move off the board"

  # -------------------------------------------------------------------
  # Levitate - Basic Mechanic
  # -------------------------------------------------------------------

  Rule: The Sorcerer can optionally levitate one Rock that mirrors every move the Sorcerer makes

    @critical
    Scenario: Sorcerer levitates a Rock - Rock mirrors the movement
      Given the current player's Sorcerer is on square "E5"
      And a Rock is on square "D4"
      And the Rock on "D4" is eligible for levitation
      And square "E6" is empty
      And square "D5" is empty
      When the player moves their Sorcerer north to "E6" while levitating the Rock on "D4"
      Then the Sorcerer should be on square "E6"
      And the Rock should move from "D4" to "D5"

    @critical
    Scenario: Levitated Rock moves in the same direction as the Sorcerer
      Given the current player's Sorcerer is on square "E5"
      And a Rock is on square "F6"
      And the Rock on "F6" is eligible for levitation
      And square "E6" is empty
      And square "F7" is empty
      When the player moves their Sorcerer north to "E6" while levitating the Rock on "F6"
      Then the Sorcerer should be on "E6"
      And the Rock should be on "F7"

    Scenario: Sorcerer moves east while levitating a Rock - Rock moves east too
      Given the current player's Sorcerer is on square "E5"
      And a Rock is on square "E7"
      And the Rock on "E7" is eligible for levitation
      And square "F5" is empty
      And square "F7" is empty
      When the player moves their Sorcerer east to "F5" while levitating the Rock on "E7"
      Then the Sorcerer should be on "F5"
      And the Rock should be on "F7"

  # -------------------------------------------------------------------
  # Levitate - One Rock Per Turn
  # -------------------------------------------------------------------

  Rule: A Sorcerer can only levitate one Rock per turn

    @critical
    Scenario: Sorcerer cannot switch to levitating a different Rock mid-turn
      Given the current player's Sorcerer is levitating Rock A during this turn
      When the player attempts to levitate Rock B on the next move of the same turn
      Then the levitation should be rejected with an error "can only levitate one Rock per turn"

    Scenario: Sorcerer can levitate the same Rock across multiple moves in a turn
      Given the current player's Sorcerer is on square "E5" levitating a Rock on "D4"
      And the player moves their Sorcerer north to "E6" with levitation (Rock moves to "D5")
      When the player moves their Sorcerer north to "E7" with levitation
      Then the Rock should move from "D5" to "D6"
      And the levitation should be allowed

  # -------------------------------------------------------------------
  # Levitate - Continuity Within a Turn
  # -------------------------------------------------------------------

  Rule: Once you start levitating you can continue on subsequent steps but once you stop you cannot resume

    @critical
    Scenario: Sorcerer continues levitating across consecutive moves
      Given the current player's Sorcerer begins levitating a Rock on move 1
      When the Sorcerer moves again on move 2 while levitating the same Rock
      And the Sorcerer moves again on move 3 while levitating the same Rock
      Then all three levitation moves should succeed

    @critical
    Scenario: Sorcerer stops levitating by moving another piece - cannot resume
      Given the current player's Sorcerer levitated a Rock on move 1
      And the player moves their Troll on move 2
      When the player attempts to resume levitating the Rock with the Sorcerer on move 3
      Then the levitation should be rejected with an error "cannot resume levitation after interruption"

    @critical
    Scenario: Sorcerer stops levitating by moving without the Rock - cannot resume
      Given the current player's Sorcerer levitated a Rock on move 1
      And the player moves the Sorcerer on move 2 without levitating
      When the player attempts to resume levitating the Rock with the Sorcerer on move 3
      Then the levitation should be rejected with an error "cannot resume levitation after interruption"

    Scenario: Sorcerer starts levitating on move 2 after a non-levitation move 1
      Given the current player moved their Troll on move 1
      When the player moves their Sorcerer on move 2 while levitating an eligible Rock
      Then the levitation should succeed

    Scenario: Sorcerer starts levitating on move 3
      Given the current player moved their Troll on moves 1 and 2
      When the player moves their Sorcerer on move 3 while levitating an eligible Rock
      Then the levitation should succeed

  # -------------------------------------------------------------------
  # Levitate - Cooldown From Previous Turn
  # -------------------------------------------------------------------

  Rule: Cannot levitate a Rock that was moved during the previous player's turn

    @critical
    Scenario: Cannot levitate a Rock that was Thrown during the previous turn
      Given the previous player's Troll threw a Rock during their turn
      When the current player's Sorcerer attempts to levitate that Rock
      Then the levitation should be rejected with an error "Rock was moved during the previous turn"

    @critical
    Scenario: Cannot levitate a Rock that was Levitated during the previous turn
      Given the previous player's Sorcerer levitated a Rock during their turn
      When the current player's Sorcerer attempts to levitate that Rock
      Then the levitation should be rejected with an error "Rock was moved during the previous turn"

    @critical
    Scenario: Cannot levitate a Rock that was Pushed during the previous turn
      Given the previous player's Dwarf pushed a Rock during their turn
      When the current player's Sorcerer attempts to levitate that Rock
      Then the levitation should be rejected with an error "Rock was moved during the previous turn"

    @critical
    Scenario: Cannot levitate a Rock that was Pulled during the previous turn
      Given the previous player's Troll pulled a Rock during their turn
      When the current player's Sorcerer attempts to levitate that Rock
      Then the levitation should be rejected with an error "Rock was moved during the previous turn"

    Scenario: Can levitate a Rock that was NOT moved during the previous turn
      Given no player moved a specific Rock during the previous turn
      When the current player's Sorcerer attempts to levitate that Rock
      Then the levitation should be allowed

    @edge-case
    Scenario: Can levitate a Rock that was moved two turns ago but not last turn
      Given Rock A was thrown two turns ago
      And Rock A was not moved during the previous turn
      When the current player's Sorcerer attempts to levitate Rock A
      Then the levitation should be allowed

  # -------------------------------------------------------------------
  # Levitate - Can Use Rocks Moved During YOUR Turn
  # -------------------------------------------------------------------

  Rule: A Sorcerer CAN levitate a Rock that was Pushed or Pulled during the current player's own turn

    @critical
    Scenario: Can levitate a Rock that was Pushed by own Dwarf earlier this turn
      Given the current player's Dwarf pushed a Rock on move 1 of this turn
      When the current player's Sorcerer attempts to levitate that Rock on move 2
      Then the levitation should be allowed

    @critical
    Scenario: Can levitate a Rock that was Pulled by own Troll earlier this turn
      Given the current player's Troll pulled a Rock on move 1 of this turn
      When the current player's Sorcerer attempts to levitate that Rock on move 2
      Then the levitation should be allowed

  # -------------------------------------------------------------------
  # Levitate - Obstacles Block Levitated Rocks
  # -------------------------------------------------------------------

  Rule: Obstacles, Targets (Sorcerers), and Dwarves all block levitated Rocks

    @critical
    Scenario: Levitated Rock is blocked by the board border
      Given the current player's Sorcerer is on square "E5" levitating a Rock on "D7"
      And the board edge is immediately north of "D7"
      When the player moves their Sorcerer north to "E6"
      Then the levitation should be blocked because the Rock cannot move off the board
      And the Sorcerer should not be able to move north while levitating this Rock

    @critical
    Scenario: Levitated Rock is blocked by a Troll
      Given the current player's Sorcerer is on square "E5" levitating a Rock on "D5"
      And a Troll is on square "D6"
      When the player moves their Sorcerer north to "E6" while levitating
      Then the levitation should be blocked because a Troll is on the Rock's destination
      And the Sorcerer should not be able to move north while levitating this Rock

    @critical
    Scenario: Levitated Rock is blocked by another Rock
      Given the current player's Sorcerer is on square "E5" levitating a Rock on "D5"
      And another Rock is on square "D6"
      When the player moves their Sorcerer north to "E6" while levitating
      Then the levitation should be blocked because another Rock is on the destination
      And the Sorcerer should not be able to move north while levitating this Rock

    @critical
    Scenario: Levitated Rock is blocked by a Dwarf
      Given the current player's Sorcerer is on square "E5" levitating a Rock on "D5"
      And a Dwarf is on square "D6"
      When the player moves their Sorcerer north to "E6" while levitating
      Then the levitation should be blocked because a Dwarf is on the Rock's destination
      And the Sorcerer should not be able to move north while levitating this Rock

    Scenario: Levitated Rock is blocked by a Sorcerer
      Given the current player's Sorcerer is on square "E5" levitating a Rock on "D5"
      And an opponent's Sorcerer is on square "D6"
      When the player moves their Sorcerer north to "E6" while levitating
      Then the levitation should be blocked because a Sorcerer is on the Rock's destination
      And the Sorcerer should not be able to move north while levitating this Rock

  # -------------------------------------------------------------------
  # Levitate - Cannot Kill Sorcerer
  # -------------------------------------------------------------------

  Rule: A Sorcerer cannot kill an enemy Sorcerer by levitating a Rock onto them

    @critical
    Scenario: Levitating a Rock onto an enemy Sorcerer is blocked
      Given the current player's Sorcerer is on square "E5" levitating a Rock on "D5"
      And an opponent's Sorcerer is on square "D6"
      When the player moves their Sorcerer north to "E6" while levitating
      Then the levitation should be blocked
      And the opponent's Sorcerer should remain alive

  # -------------------------------------------------------------------
  # Levitate - Sorcerer Can Still Move Without Levitating
  # -------------------------------------------------------------------

  Rule: If levitation is blocked the Sorcerer can choose to move without levitating

    Scenario: Sorcerer moves without levitation when Rock destination is blocked
      Given the current player's Sorcerer is on square "E5"
      And a Rock is on "D5" eligible for levitation
      And a Troll blocks the Rock's northward destination on "D6"
      And square "E6" is empty
      When the player moves their Sorcerer north to "E6" without levitating
      Then the Sorcerer should be on "E6"
      And the Rock should remain on "D5"

  # -------------------------------------------------------------------
  # Levitate - Cannot Levitate Rock Onto Troll to Trigger Throw
  # -------------------------------------------------------------------

  Rule: Rocks cannot be levitated onto a Troll square to auto-trigger a throw

    @critical @edge-case
    Scenario: Levitation is prevented from placing Rock on any Troll's square
      Given the current player's Sorcerer is on square "E5" levitating a Rock on "D5"
      And the current player's Troll is on square "D6"
      When the player moves their Sorcerer north to "E6" while levitating
      Then the levitation should be blocked
      And no throw should be triggered

  # -------------------------------------------------------------------
  # Levitate - Edge Cases
  # -------------------------------------------------------------------

  Rule: Various edge conditions around levitation must be handled

    @edge-case
    Scenario: Sorcerer levitates a Rock into a valid position then Rock destination becomes blocked on next step
      Given the current player's Sorcerer is on "E5" levitating a Rock from "D5" to "D6" on move 1
      And a piece blocks the Rock's path for the next move direction
      When the player attempts to continue levitating on move 2
      Then the levitation should be blocked for that move direction
      But the Sorcerer can choose a different direction or stop levitating

    @edge-case
    Scenario: Sorcerer cannot begin levitating a Rock that is not on the board
      Given only 3 Rocks are on the board after a team elimination
      When the current player's Sorcerer attempts to levitate a nonexistent Rock
      Then the action should be rejected

    @edge-case
    Scenario: Sorcerer can levitate a Rock that is far away on the board
      Given the current player's Sorcerer is on square "B5"
      And a Rock is on square "H5"
      And the Rock on "H5" is eligible for levitation
      And square "B6" and "H6" are both empty
      When the player moves their Sorcerer north to "B6" while levitating the Rock on "H5"
      Then the Sorcerer should be on "B6"
      And the Rock should be on "H6"
