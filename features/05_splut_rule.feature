@splut @critical
Feature: SPLUT! Rule - Dwarf Crushed by Thrown Rock
  As a player
  I want the SPLUT! rule to be enforced when a thrown Rock flies over a Dwarf
  and the next square is an Obstacle
  So that Dwarves can be eliminated by clever Rock throws

  Background:
    Given a game is in progress
    And it is the current player's turn with moves available

  # -------------------------------------------------------------------
  # Core SPLUT! Mechanic
  # -------------------------------------------------------------------

  Rule: When a thrown Rock flies over a Dwarf and the immediately next square is an Obstacle the Rock lands on the Dwarf killing it

    @critical
    Scenario: SPLUT! - Rock crushes Dwarf when next square is board border
      Given the current player's Troll has landed on a Rock at square "E5"
      And a Dwarf is on square "E7"
      And the board edge is immediately after "E7" in the north direction
      When the Troll throws the Rock north
      Then the Rock should land on square "E7"
      And the Dwarf on "E7" should be killed by SPLUT!
      And the Rock should remain on square "E7"

    @critical
    Scenario: SPLUT! - Rock crushes Dwarf when next square has a Troll
      Given the current player's Troll has landed on a Rock at square "E3"
      And a Dwarf is on square "E6"
      And an opponent's Troll is on square "E7"
      And squares "E4" and "E5" are empty
      When the Troll throws the Rock north
      Then the Rock should fly over squares "E4" and "E5"
      And the Rock should land on square "E6"
      And the Dwarf on "E6" should be killed by SPLUT!
      And the opponent's Troll on "E7" should remain unharmed

    @critical
    Scenario: SPLUT! - Rock crushes Dwarf when next square has another Rock
      Given the current player's Troll has landed on a Rock at square "E3"
      And a Dwarf is on square "E6"
      And another Rock is on square "E7"
      And squares "E4" and "E5" are empty
      When the Troll throws the Rock north
      Then the Rock should land on square "E6"
      And the Dwarf on "E6" should be killed by SPLUT!
      And the other Rock should remain on "E7"

  # -------------------------------------------------------------------
  # SPLUT! Does NOT Trigger
  # -------------------------------------------------------------------

  Rule: SPLUT! does not trigger if the square after the Dwarf is empty or contains a non-Obstacle piece

    @critical
    Scenario: No SPLUT! - Rock flies over Dwarf when next square is empty
      Given the current player's Troll has landed on a Rock at square "E3"
      And a Dwarf is on square "E5"
      And square "E6" is empty
      When the Troll throws the Rock north
      Then the Rock should fly over the Dwarf on "E5"
      And the Dwarf on "E5" should remain alive and unharmed
      And the Rock should continue past "E5"

    Scenario: No SPLUT! - Rock flies over Dwarf when next square has a Sorcerer
      Given the current player's Troll has landed on a Rock at square "E3"
      And a Dwarf is on square "E5"
      And a Sorcerer is on square "E6"
      And square "E4" is empty
      When the Troll throws the Rock north
      Then the Rock should fly over the Dwarf on "E5"
      And the Rock should land on square "E6"
      And the Sorcerer on "E6" should be killed
      And the Dwarf on "E5" should remain alive and unharmed

    Scenario: No SPLUT! - Rock flies over Dwarf when next square has another Dwarf
      Given the current player's Troll has landed on a Rock at square "E3"
      And a Dwarf is on square "E5"
      And another Dwarf is on square "E6"
      And square "E4" is empty
      When the Troll throws the Rock north
      Then the Rock should fly over both Dwarves
      And both Dwarves should remain alive and unharmed

  # -------------------------------------------------------------------
  # Multiple Dwarves in Path
  # -------------------------------------------------------------------

  Rule: SPLUT! only affects the Dwarf immediately before the Obstacle

    @edge-case
    Scenario: Only the last Dwarf before the Obstacle is killed by SPLUT!
      Given the current player's Troll has landed on a Rock at square "E3"
      And a Dwarf is on square "E5"
      And another Dwarf is on square "E6"
      And a Troll is on square "E7"
      And square "E4" is empty
      When the Troll throws the Rock north
      Then the Rock should fly over the Dwarf on "E5"
      And the Rock should land on square "E6"
      And the Dwarf on "E6" should be killed by SPLUT!
      And the Dwarf on "E5" should remain alive and unharmed

    @edge-case
    Scenario: Three Dwarves in a row before an Obstacle - only the last is killed
      Given the current player's Troll has landed on a Rock at square "E2"
      And Dwarves are on squares "E4", "E5", and "E6"
      And a Rock is on square "E7"
      And square "E3" is empty
      When the Troll throws the Rock north
      Then the Rock should fly over the Dwarves on "E4" and "E5"
      And the Rock should land on square "E6"
      And the Dwarf on "E6" should be killed by SPLUT!
      And the Dwarves on "E4" and "E5" should remain alive

  # -------------------------------------------------------------------
  # SPLUT! with Team Elimination
  # -------------------------------------------------------------------

  Rule: SPLUT! killing a Dwarf does not directly eliminate a team

    Scenario: SPLUT! kills a Dwarf but the team's Sorcerer survives
      Given the current player's Troll has landed on a Rock
      And an opponent's Dwarf is in the Rock's throw path
      And the square after the opponent's Dwarf is an Obstacle
      When the Troll throws the Rock and triggers SPLUT!
      Then the opponent's Dwarf should be removed from the board
      But the opponent's Sorcerer and Troll should remain in play
      And the opponent's team should NOT be eliminated

    Scenario: SPLUT! kills a Dwarf whose team is already down to Sorcerer and Troll
      Given an opponent has only a Sorcerer and a Dwarf remaining
      And the current player's Troll has landed on a Rock
      And the opponent's Dwarf is in the throw path with an Obstacle behind it
      When the Troll throws the Rock and triggers SPLUT!
      Then the opponent's Dwarf should be removed from the board
      But the opponent's Sorcerer should remain alive
      And the opponent should still be in the game

  # -------------------------------------------------------------------
  # SPLUT! Preserves All Other Pieces (Bug 3 regression)
  # -------------------------------------------------------------------

  Rule: After a SPLUT! throw, the throwing Troll and all other pieces must remain on the board

    @critical @regression @bug-3
    Scenario: Throwing Troll remains on the board after SPLUT!
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E5" (Troll has landed on it, pendingThrow = true)
      And an opponent's Dwarf is on square "E8"
      And the board edge is immediately after "E8" in the north direction
      When the Troll throws the Rock north triggering SPLUT! on the Dwarf
      Then the throwing Troll should remain on square "E5"
      And the Troll should still exist in the pieces map
      And the Troll's square should be occupied in squareOccupancy

    @critical @regression @bug-3
    Scenario: Throwing Troll's squareOccupancy is preserved after Rock moves away
      Given the current player's Troll and a Rock are co-located on square "E5"
      And pendingThrow is true
      When the Troll throws the Rock in any direction and the Rock lands elsewhere
      Then squareOccupancy for "E5" should map to the Troll's piece ID
      And the Rock should have its own occupancy at its landing square

    @critical @regression @bug-3
    Scenario: All throwing team's pieces survive a SPLUT! throw
      Given the current player has a Troll on "E5", Sorcerer on "D8", Dwarf on "F8"
      And a Rock is on "E5" (pendingThrow = true)
      And an opponent's Dwarf is on "E8" with the board edge behind it
      When the Troll throws the Rock north triggering SPLUT!
      Then the current player's Troll should be alive on "E5"
      And the current player's Sorcerer should be alive on "D8"
      And the current player's Dwarf should be alive on "F8"
      And only the opponent's Dwarf should be dead

    @critical @regression @bug-3
    Scenario: Non-SPLUT throw also preserves Troll occupancy
      Given the current player's Troll and a Rock are co-located on square "E5"
      And square "E6" and "E7" are empty
      And a Rock is on square "E8" (obstacle)
      And pendingThrow is true
      When the Troll throws the Rock north (Rock stops at "E7", obstacle hit)
      Then the Troll should remain on "E5" in squareOccupancy
      And the thrown Rock should be at "E7" in squareOccupancy

    @critical @regression @bug-3
    Scenario: Sorcerer-kill throw preserves Troll occupancy
      Given the current player's Troll and a Rock are co-located on square "E5"
      And an opponent's Sorcerer is on square "E8"
      And squares "E6" and "E7" are empty
      And pendingThrow is true
      When the Troll throws the Rock north (Rock lands on Sorcerer, kills it)
      Then the Troll should remain on "E5" in squareOccupancy
      And the opponent's team should be eliminated
      But the throwing Troll should still be alive and tracked

  # -------------------------------------------------------------------
  # SPLUT! Combined with Sorcerer Kill
  # -------------------------------------------------------------------

  Rule: A single throw can only resolve one collision at a time following trajectory order

    @edge-case
    Scenario: SPLUT! kills Dwarf and Rock stays - does not continue to a Sorcerer behind the Obstacle
      Given the current player's Troll has landed on a Rock at square "E3"
      And a Dwarf is on square "E6"
      And a Troll (Obstacle) is on square "E7"
      And a Sorcerer is on square "E8"
      And squares "E4" and "E5" are empty
      When the Troll throws the Rock north
      Then the Rock should land on square "E6" killing the Dwarf by SPLUT!
      And the Sorcerer on "E8" should remain alive
      And the Rock should stay on "E6"
