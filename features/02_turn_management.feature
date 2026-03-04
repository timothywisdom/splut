@turns
Feature: Turn Management
  As a player
  I want turns to follow the correct order and move count rules
  So that the game progresses fairly according to the SPLUT! rules

  # -------------------------------------------------------------------
  # Turn Order Determination
  # -------------------------------------------------------------------

  Rule: Turn order proceeds clockwise starting from the determined first player

    @critical
    Scenario: 4-player game starts with the fourth challenger
      Given a 4-player game with seating order Green, Red, Yellow, Blue
      And Blue is the fourth challenger
      When the game begins
      Then Blue should take the first turn

    @critical
    Scenario: 3-player game starts with the player to the right of the third challenger
      Given a 3-player game with players at Top, Bottom, and Left
      And Left is the third challenger
      When the game begins
      Then the player to the right of Left should take the first turn

    @critical
    Scenario: Turns proceed clockwise after the first player
      Given a 4-player game where Blue takes the first turn
      When Blue finishes their turn
      Then the next turn should belong to the player seated to Blue's left

    Scenario: Turn order cycles back to the first player after all players have taken a turn
      Given a 4-player game in progress
      And all 4 players have each taken one turn
      When the fourth player finishes their turn
      Then the first player should take the next turn

  # -------------------------------------------------------------------
  # 2-Player Turn Order
  # -------------------------------------------------------------------

  Rule: In a 2-player game turns alternate between the two players

    Scenario: 2-player game alternates turns
      Given a 2-player game with Top and Bottom
      And Top takes the first turn
      When Top finishes their turn
      Then Bottom should take the next turn

    Scenario: 2-player turn alternation continues indefinitely
      Given a 2-player game with Top going first
      When Top completes their first turn
      And Bottom completes their first turn
      Then Top should take the third turn

  # -------------------------------------------------------------------
  # Move Counts
  # -------------------------------------------------------------------

  Rule: The first player gets 1 move, the second player gets 2 moves, and all subsequent turns get 3 moves

    @critical
    Scenario: First player's first turn allows exactly 1 move
      Given a new game has started
      When it is the first player's turn
      Then the first player should have exactly 1 move available

    @critical
    Scenario: Second player's first turn allows exactly 2 moves
      Given the first player has completed their first turn
      When it is the second player's turn
      Then the second player should have exactly 2 moves available

    @critical
    Scenario: Third turn and beyond allow exactly 3 moves
      Given the first and second players have completed their first turns
      When it is the third player's turn
      Then the third player should have exactly 3 moves available

    Scenario: First player's second turn allows 3 moves
      Given a 2-player game where both players have completed their first turns
      When it is the first player's second turn
      Then the first player should have exactly 3 moves available

    Scenario Outline: Move count progression across the first round of a 4-player game
      Given a 4-player game in the first round
      When it is player <turn_number>'s turn
      Then the player should have exactly <move_count> moves available

      Examples:
        | turn_number | move_count |
        | 1           | 1          |
        | 2           | 2          |
        | 3           | 3          |
        | 4           | 3          |

  # -------------------------------------------------------------------
  # Mandatory Moves
  # -------------------------------------------------------------------

  Rule: All moves in a turn are mandatory and must be used

    @critical
    Scenario: Player must use all 3 moves in a standard turn
      Given it is a player's turn with 3 moves available
      When the player has made 2 moves
      Then the player must make 1 more move before ending their turn

    Scenario: Player cannot end turn with unused moves
      Given it is a player's turn with 3 moves available
      And the player has made only 1 move
      When the player attempts to end their turn
      Then the game should reject the action with an error "all moves must be used"

    Scenario: Turn ends automatically after all moves are used
      Given it is a player's turn with 3 moves available
      When the player makes their 3rd move
      Then the player's turn should end
      And the next player's turn should begin

    Scenario: First player's turn ends after 1 move
      Given it is the first player's first turn with 1 move
      When the first player makes their move
      Then the first player's turn should end

    Scenario: Second player's turn ends after 2 moves
      Given it is the second player's first turn with 2 moves
      When the second player makes their 2nd move
      Then the second player's turn should end

  # -------------------------------------------------------------------
  # Move Distribution Among Pieces
  # -------------------------------------------------------------------

  Rule: Moves may be freely distributed among the player's three pieces

    @critical
    Scenario: Player can use all 3 moves on a single piece
      Given it is a player's turn with 3 moves available
      When the player moves their Troll 3 times
      Then all 3 moves should be consumed
      And the turn should end

    Scenario: Player can distribute moves across different pieces
      Given it is a player's turn with 3 moves available
      When the player moves their Sorcerer once
      And the player moves their Dwarf once
      And the player moves their Troll once
      Then all 3 moves should be consumed
      And the turn should end

    Scenario: Player can move one piece twice and another once
      Given it is a player's turn with 3 moves available
      When the player moves their Troll twice
      And the player moves their Dwarf once
      Then all 3 moves should be consumed
      And the turn should end

  # -------------------------------------------------------------------
  # Piece Control
  # -------------------------------------------------------------------

  Rule: A player may only move their own pieces

    @error
    Scenario: Player cannot move an opponent's piece
      Given it is the Green player's turn
      When the Green player attempts to move the Red Troll
      Then the game should reject the action with an error "cannot move opponent's piece"

    @error
    Scenario: Player cannot move a Rock directly
      Given it is the Green player's turn
      When the Green player attempts to move a Rock
      Then the game should reject the action with an error "Rocks cannot be moved directly"

  # -------------------------------------------------------------------
  # Turn Interruption by Throw
  # -------------------------------------------------------------------

  Rule: A Troll throw immediately ends the current player's entire turn

    @critical
    Scenario: Troll throw on first move ends a 3-move turn
      Given it is a player's turn with 3 moves available
      When the player moves their Troll onto a Rock on the first move
      And the Troll throws the Rock
      Then the player's turn should end immediately
      And no further moves should be available this turn

    Scenario: Troll throw on second move ends the turn with 1 unused move
      Given it is a player's turn with 3 moves available
      And the player has made 1 move
      When the player moves their Troll onto a Rock on the second move
      And the Troll throws the Rock
      Then the player's turn should end immediately

  # -------------------------------------------------------------------
  # Eliminated Player Turn Skipping
  # -------------------------------------------------------------------

  Rule: Eliminated players are skipped in the turn order

    Scenario: Turn skips an eliminated player
      Given a 4-player game with turn order Green, Red, Yellow, Blue
      And Red's Sorcerer has been killed and Red's team has been eliminated
      When Green finishes their turn
      Then Yellow should take the next turn
      And Red should be skipped

    Scenario: Turn skips multiple eliminated players
      Given a 4-player game with turn order Green, Red, Yellow, Blue
      And Red and Yellow have been eliminated
      When Green finishes their turn
      Then Blue should take the next turn
