@movement @general
Feature: General Movement Rules
  As a player
  I want all pieces to follow consistent movement constraints
  So that the game is fair and predictable

  Background:
    Given a game is in progress
    And it is the current player's turn with moves available

  # -------------------------------------------------------------------
  # Universal Movement Constraints
  # -------------------------------------------------------------------

  Rule: All player pieces move exactly one square horizontally or vertically

    Scenario Outline: No piece can move diagonally
      Given the current player's <piece> is on square "E5"
      When the player attempts to move their <piece> to square "F6"
      Then the move should be rejected with an error "diagonal movement is not allowed"

      Examples:
        | piece    |
        | Troll    |
        | Dwarf    |
        | Sorcerer |

    Scenario Outline: No piece can move more than one square at a time
      Given the current player's <piece> is on square "E5"
      When the player attempts to move their <piece> to square "E7"
      Then the move should be rejected with an error "can only move one square at a time"

      Examples:
        | piece    |
        | Troll    |
        | Dwarf    |
        | Sorcerer |

  # -------------------------------------------------------------------
  # Occupied Square Rules
  # -------------------------------------------------------------------

  Rule: Pieces cannot move into occupied squares except where special abilities apply

    Scenario: Troll cannot move into an occupied square
      Given the current player's Troll is on square "E5"
      And square "E6" is occupied by a Sorcerer
      When the player attempts to move their Troll to square "E6"
      Then the move should be rejected with an error "cannot move to an occupied square"

    Scenario: Sorcerer cannot move into an occupied square
      Given the current player's Sorcerer is on square "E5"
      And square "E6" is occupied by a Dwarf
      When the player attempts to move their Sorcerer to square "E6"
      Then the move should be rejected with an error "cannot move to an occupied square"

    @critical
    Scenario: Troll CAN move onto a Rock square (triggers throw)
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E6"
      When the player moves their Troll to square "E6"
      Then the Troll should land on "E6"
      And a throw must be initiated

    @critical
    Scenario: Dwarf CAN move into an occupied square (triggers push)
      Given the current player's Dwarf is on square "E5"
      And a piece is on square "E6"
      And there is room to push the piece
      When the player moves their Dwarf to square "E6"
      Then the piece should be pushed
      And the Dwarf should occupy "E6"

  # -------------------------------------------------------------------
  # Board Boundary Enforcement
  # -------------------------------------------------------------------

  Rule: No piece can move off the valid board area

    Scenario: Cannot move to a square outside the diamond boundary
      Given the current player's Troll is on a square at the inner edge of the diamond
      When the player attempts to move their Troll to a square outside the diamond
      Then the move should be rejected with an error "cannot move off the board"

  # -------------------------------------------------------------------
  # Move Consumption
  # -------------------------------------------------------------------

  Rule: Each piece movement consumes exactly one move from the player's move allowance

    Scenario: Moving a piece reduces the remaining move count by 1
      Given the current player has 3 moves remaining
      When the player makes a valid move with any piece
      Then the player should have 2 moves remaining

    Scenario: Move count reaches 0 after the final move
      Given the current player has 1 move remaining
      When the player makes a valid move
      Then the player should have 0 moves remaining
      And the player's turn should end

    Scenario: Failed move does not consume a move
      Given the current player has 3 moves remaining
      When the player attempts an invalid move
      Then the player should still have 3 moves remaining
