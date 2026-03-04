@troll @throw
Feature: Troll Throw
  As a player
  I want my Troll to throw Rocks when it lands on one
  So that I can attack opposing Sorcerers and reposition Rocks strategically

  Background:
    Given a game is in progress
    And it is the current player's turn with moves available

  # -------------------------------------------------------------------
  # Mandatory Throw Trigger
  # -------------------------------------------------------------------

  Rule: When a Troll ends its move on a square containing a Rock it MUST throw the Rock immediately

    @critical
    Scenario: Troll landing on a Rock must throw it
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E6"
      And square "E6" contains only the Rock
      When the player moves their Troll to square "E6"
      Then the Troll should land on square "E6"
      And the player must choose a direction to throw the Rock

    @critical
    Scenario: Throwing a Rock immediately ends the player's entire turn
      Given the current player has 3 moves available and has used 0
      When the player's Troll lands on a Rock and throws it
      Then the player's turn should end immediately
      And no further moves should be available this turn

    Scenario: Throw on the first move of a 3-move turn ends the turn
      Given the current player has 3 moves available
      When the player moves their Troll onto a Rock as their first move
      And the Troll throws the Rock northward
      Then the player's turn should end with 2 unused moves forfeited

    Scenario: Throw on the second move of a 3-move turn ends the turn
      Given the current player has 3 moves available and has used 1
      When the player moves their Troll onto a Rock as their second move
      And the Troll throws the Rock northward
      Then the player's turn should end with 1 unused move forfeited

  # -------------------------------------------------------------------
  # Throw Direction
  # -------------------------------------------------------------------

  Rule: The Troll may throw the Rock in any horizontal or vertical direction

    @critical
    Scenario Outline: Troll throws Rock in a chosen cardinal direction
      Given the current player's Troll has landed on a Rock at square "E5"
      When the Troll throws the Rock in the "<direction>" direction
      Then the Rock should travel in the "<direction>" direction from "E5"

      Examples:
        | direction |
        | north     |
        | south     |
        | east      |
        | west      |

    @error
    Scenario: Troll cannot throw Rock diagonally
      Given the current player's Troll has landed on a Rock at square "E5"
      When the Troll attempts to throw the Rock diagonally
      Then the throw should be rejected with an error "can only throw in cardinal directions"

  # -------------------------------------------------------------------
  # Rock Trajectory - Empty Squares
  # -------------------------------------------------------------------

  Rule: A thrown Rock flies over empty squares

    @critical
    Scenario: Rock flies across empty squares until hitting an obstacle
      Given the current player's Troll has landed on a Rock at square "E5"
      And squares "E6", "E7", and "E8" are empty
      And the board edge is beyond "E8" in the north direction
      When the Troll throws the Rock north
      Then the Rock should fly over "E6", "E7", "E8"
      And the Rock should stop at the last valid square before the board edge

  # -------------------------------------------------------------------
  # Rock Trajectory - Obstacles (Stops Before)
  # -------------------------------------------------------------------

  Rule: A thrown Rock stops on the square before an Obstacle

    @critical
    Scenario: Rock stops before hitting the board border
      Given the current player's Troll has landed on a Rock at square "E5"
      And the board edge is at row 8 in the north direction
      And squares "E6" and "E7" are empty
      When the Troll throws the Rock north
      Then the Rock should stop on square "E7"

    @critical
    Scenario: Rock stops before hitting another Troll
      Given the current player's Troll has landed on a Rock at square "E5"
      And an opponent's Troll is on square "E8"
      And squares "E6" and "E7" are empty
      When the Troll throws the Rock north
      Then the Rock should stop on square "E7"
      And the opponent's Troll should remain on "E8" unharmed

    Scenario: Rock stops before hitting the throwing player's own Troll
      Given the current player's Troll has landed on a Rock at square "C5"
      And the current player has another Troll-like obstacle ahead
      And a friendly Troll is on square "F5"
      And squares "D5" and "E5" are empty
      When the Troll throws the Rock east
      Then the Rock should stop on square "E5"

    @critical
    Scenario: Rock stops before hitting another Rock
      Given the current player's Troll has landed on a Rock at square "E5"
      And another Rock is on square "E8"
      And squares "E6" and "E7" are empty
      When the Troll throws the Rock north
      Then the Rock should stop on square "E7"
      And the other Rock should remain on "E8"

    Scenario: Rock stops immediately if Obstacle is on the adjacent square
      Given the current player's Troll has landed on a Rock at square "E5"
      And another Rock is on square "E6"
      When the Troll throws the Rock north
      Then the Rock should not move
      And the Rock should remain at the Troll's square "E5"

  # -------------------------------------------------------------------
  # Rock Trajectory - Targets (Lands On and Kills)
  # -------------------------------------------------------------------

  Rule: A thrown Rock lands on a Sorcerer's square and kills the Sorcerer

    @critical
    Scenario: Rock kills an enemy Sorcerer by landing on it
      Given the current player's Troll has landed on a Rock at square "E5"
      And an opponent's Sorcerer is on square "E8"
      And squares "E6" and "E7" are empty
      When the Troll throws the Rock north
      Then the Rock should land on square "E8"
      And the opponent's Sorcerer should be killed
      And the Rock should remain on square "E8"

    Scenario: Rock kills the current player's own Sorcerer if in the path
      Given the current player's Troll has landed on a Rock at square "E5"
      And the current player's Sorcerer is on square "E8"
      And squares "E6" and "E7" are empty
      When the Troll throws the Rock north
      Then the Rock should land on square "E8"
      And the current player's Sorcerer should be killed

    Scenario: Rock lands on the first Sorcerer in its path
      Given the current player's Troll has landed on a Rock at square "E5"
      And Sorcerer A is on square "E7"
      And Sorcerer B is on square "E8"
      And square "E6" is empty
      When the Troll throws the Rock north
      Then the Rock should land on square "E7"
      And Sorcerer A should be killed
      And Sorcerer B should remain alive on "E8"

  # -------------------------------------------------------------------
  # Rock Trajectory - Dwarves (Flies Over)
  # -------------------------------------------------------------------

  Rule: A thrown Rock flies over Dwarves without affecting them

    @critical
    Scenario: Rock flies over a Dwarf and continues
      Given the current player's Troll has landed on a Rock at square "E5"
      And a Dwarf is on square "E6"
      And squares "E7" and "E8" are empty
      And the board edge is beyond "E8"
      When the Troll throws the Rock north
      Then the Rock should fly over the Dwarf on "E6"
      And the Dwarf should remain on "E6" unharmed
      And the Rock should continue past "E6"

    Scenario: Rock flies over multiple Dwarves
      Given the current player's Troll has landed on a Rock at square "E5"
      And Dwarves are on squares "E6" and "E7"
      And the board edge is at the end of the north direction
      When the Troll throws the Rock north
      Then the Rock should fly over both Dwarves
      And both Dwarves should remain unharmed

    Scenario: Rock flies over a Dwarf and hits an Obstacle after a gap
      Given the current player's Troll has landed on a Rock at square "E3"
      And a Dwarf is on square "E4"
      And square "E5" is empty
      And a Troll is on square "E6"
      When the Troll throws the Rock north
      Then the Rock should fly over the Dwarf on "E4"
      And the Rock should stop on square "E5"

  # -------------------------------------------------------------------
  # Throw Edge Cases
  # -------------------------------------------------------------------

  Rule: Special throw trajectory edge cases must be handled correctly

    @edge-case
    Scenario: Rock thrown into an immediately adjacent Obstacle does not move
      Given the current player's Troll has landed on a Rock at square "E5"
      And another Troll is on square "E6"
      When the Troll throws the Rock north
      Then the Rock should remain on square "E5"
      And the Troll should be on "E5" with the Rock

    @edge-case
    Scenario: Rock cannot be thrown if all four directions are immediately blocked
      Given the current player's Troll has landed on a Rock at square "E5"
      And Obstacles occupy squares "E6", "E4", "D5", and "F5"
      When the Troll throws the Rock in any direction
      Then the Rock should remain on square "E5"

    @error
    Scenario: Cannot levitate a Rock onto a Troll square to trigger an auto-throw
      Given the current player's Sorcerer is levitating a Rock
      And the Rock would land on a Troll's square via levitation
      Then the levitation should be blocked
      And no throw should be triggered
