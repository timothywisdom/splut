@dwarf @movement
Feature: Dwarf Movement and Push
  As a player
  I want my Dwarf to push all pieces in its path when it moves
  So that I can reposition the board state by chain-pushing pieces

  Background:
    Given a game is in progress
    And it is the current player's turn with moves available

  # -------------------------------------------------------------------
  # Basic Dwarf Movement
  # -------------------------------------------------------------------

  Rule: The Dwarf moves exactly one square horizontally or vertically

    @critical
    Scenario Outline: Dwarf moves one square in a cardinal direction into an empty square
      Given the current player's Dwarf is on square "<from>"
      And square "<to>" is empty
      When the player moves their Dwarf to square "<to>"
      Then the Dwarf should be on square "<to>"
      And square "<from>" should be empty
      And 1 move should be consumed

      Examples:
        | from | to  |
        | E5   | E6  |
        | E5   | E4  |
        | E5   | D5  |
        | E5   | F5  |

    @error
    Scenario: Dwarf cannot move diagonally
      Given the current player's Dwarf is on square "E5"
      When the player attempts to move their Dwarf to square "F6"
      Then the move should be rejected with an error "diagonal movement is not allowed"

    @error
    Scenario: Dwarf cannot move more than one square
      Given the current player's Dwarf is on square "E5"
      When the player attempts to move their Dwarf to square "E7"
      Then the move should be rejected with an error "can only move one square at a time"

    @error
    Scenario: Dwarf cannot move off the board
      Given the current player's Dwarf is on a square at the edge of the diamond
      When the player attempts to move their Dwarf off the board
      Then the move should be rejected with an error "cannot move off the board"

  # -------------------------------------------------------------------
  # Push Mechanic
  # -------------------------------------------------------------------

  Rule: When a Dwarf moves into an occupied square it pushes ALL pieces in its direction until they reach the board edge

    @critical
    Scenario: Dwarf pushes a single piece one square
      Given the current player's Dwarf is on square "E5"
      And a Rock is on square "E6"
      And square "E7" is empty
      When the player moves their Dwarf north to square "E6"
      Then the Dwarf should be on square "E6"
      And the Rock should be pushed to square "E7"

    @critical
    Scenario: Dwarf pushes a chain of adjacent pieces
      Given the current player's Dwarf is on square "E4"
      And a Rock is on square "E5"
      And a Troll is on square "E6"
      And square "E7" is empty
      When the player moves their Dwarf north to square "E5"
      Then the Dwarf should be on square "E5"
      And the Rock should be pushed to square "E6"
      And the Troll should be pushed to square "E7"

    Scenario: Dwarf pushes three pieces in a chain
      Given the current player's Dwarf is on square "E3"
      And pieces occupy squares "E4", "E5", and "E6" in a line
      And square "E7" is empty
      When the player moves their Dwarf north to square "E4"
      Then the Dwarf should be on square "E4"
      And the piece from "E4" should be on "E5"
      And the piece from "E5" should be on "E6"
      And the piece from "E6" should be on "E7"

  # -------------------------------------------------------------------
  # Push to Board Edge
  # -------------------------------------------------------------------

  Rule: Pieces are pushed until the chain reaches the board edge and cannot go further

    @critical @error
    Scenario: Dwarf cannot push if the last piece in the chain is at the board edge
      Given the current player's Dwarf is on square "E5"
      And a Rock is on square "E6"
      And square "E6" is at the board edge in the north direction
      When the player attempts to move their Dwarf north to square "E6"
      Then the move should be rejected with an error "cannot push pieces off the board"
      And the Dwarf should remain on "E5"
      And the Rock should remain on "E6"

    @error
    Scenario: Dwarf cannot push a chain when the last piece has no room
      Given the current player's Dwarf is on square "E4"
      And pieces occupy squares "E5", "E6", and "E7"
      And "E7" is at the board edge in the north direction
      When the player attempts to move their Dwarf north to square "E5"
      Then the move should be rejected with an error "cannot push pieces off the board"
      And all pieces should remain in their original positions

  # -------------------------------------------------------------------
  # Push Interactions with Piece Types
  # -------------------------------------------------------------------

  Rule: The Dwarf push can move any piece type including Rocks, Trolls, Sorcerers, and other Dwarves

    Scenario: Dwarf pushes a Rock
      Given the current player's Dwarf is on square "E5"
      And a Rock is on square "E6"
      And square "E7" is empty
      When the player moves their Dwarf north to square "E6"
      Then the Rock should be on square "E7"

    Scenario: Dwarf pushes an opponent's Sorcerer
      Given the current player's Dwarf is on square "E5"
      And an opponent's Sorcerer is on square "E6"
      And square "E7" is empty
      When the player moves their Dwarf north to square "E6"
      Then the opponent's Sorcerer should be on square "E7"
      And the Sorcerer should remain alive

    Scenario: Dwarf pushes an opponent's Troll
      Given the current player's Dwarf is on square "E5"
      And an opponent's Troll is on square "E6"
      And square "E7" is empty
      When the player moves their Dwarf north to square "E6"
      Then the opponent's Troll should be on square "E7"

    Scenario: Dwarf pushes another Dwarf
      Given the current player's Dwarf is on square "E5"
      And an opponent's Dwarf is on square "E6"
      And square "E7" is empty
      When the player moves their Dwarf north to square "E6"
      Then the opponent's Dwarf should be on square "E7"

    Scenario: Dwarf pushes a friendly piece
      Given the current player's Dwarf is on square "E5"
      And the current player's Troll is on square "E6"
      And square "E7" is empty
      When the player moves their Dwarf north to square "E6"
      Then the current player's Troll should be on square "E7"

  # -------------------------------------------------------------------
  # Push Mixed Chain
  # -------------------------------------------------------------------

  Rule: A push chain can contain a mix of different piece types

    Scenario: Dwarf pushes a mixed chain of Rock, Sorcerer, and Troll
      Given the current player's Dwarf is on square "E3"
      And a Rock is on square "E4"
      And a Sorcerer is on square "E5"
      And a Troll is on square "E6"
      And square "E7" is empty
      When the player moves their Dwarf north to square "E4"
      Then the Dwarf should be on square "E4"
      And the Rock should be on square "E5"
      And the Sorcerer should be on square "E6"
      And the Troll should be on square "E7"

  # -------------------------------------------------------------------
  # Push Does NOT Kill
  # -------------------------------------------------------------------

  Rule: Pushing a piece does not kill or damage it regardless of piece type

    Scenario: Pushing a Sorcerer does not kill it
      Given the current player's Dwarf is on square "E5"
      And an opponent's Sorcerer is on square "E6"
      And square "E7" is empty
      When the player moves their Dwarf north to square "E6"
      Then the opponent's Sorcerer should be alive on square "E7"

    Scenario: Pushing a Rock onto a Sorcerer does not kill the Sorcerer
      Given the current player's Dwarf is on square "E4"
      And a Rock is on square "E5"
      And a Sorcerer is on square "E6"
      And square "E7" is empty
      When the player moves their Dwarf north to square "E5"
      Then the Rock should be on square "E6"
      And the Sorcerer should be on square "E7"
      And the Sorcerer should remain alive

  # -------------------------------------------------------------------
  # Dwarf Smallness - Thrown Rocks Fly Over
  # -------------------------------------------------------------------

  Rule: Thrown Rocks fly over Dwarves because Dwarves are small

    Scenario: A thrown Rock passes over the current player's Dwarf
      Given an opponent's Troll has thrown a Rock northward from square "E3"
      And the current player's Dwarf is on square "E5"
      And square "E6" is empty
      When the Rock travels north
      Then the Rock should fly over the Dwarf on "E5" without harm

  # -------------------------------------------------------------------
  # Dwarf Blocks Levitated Rocks
  # -------------------------------------------------------------------

  Rule: Levitated Rocks are blocked by Dwarves and cannot pass through them

    @critical
    Scenario: Levitated Rock is blocked by a Dwarf
      Given an opponent's Sorcerer is levitating a Rock
      And the Sorcerer moves in a direction where a Dwarf blocks the Rock's path
      Then the levitation should be blocked
      And the Rock should not move through or onto the Dwarf's square

  # -------------------------------------------------------------------
  # Push and Rock State
  # -------------------------------------------------------------------

  Rule: Rocks pushed by a Dwarf are marked as moved for levitation cooldown purposes

    Scenario: A Rock pushed during the current turn is marked as pushed
      Given the current player's Dwarf pushes a Rock during their turn
      Then that Rock should be marked as "Pushed" for the current turn
      And the next player should not be able to Levitate that Rock

    Scenario: A Rock pushed by an opponent's Dwarf during the previous turn cannot be levitated
      Given the previous player's Dwarf pushed a Rock during their turn
      When the current player's Sorcerer attempts to Levitate that Rock
      Then the levitation should be rejected with an error "Rock was moved during the previous turn"
