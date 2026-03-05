Feature: Undo Move

  As a player, I want to undo my moves so that I can correct mistakes
  and explore different strategies without restarting the game.

  Background:
    Given a standard game is in progress

  # ------------------------------------------------------------------
  # Basic undo
  # ------------------------------------------------------------------

  Rule: Undo restores the previous board state

    Scenario: Undo a single move restores previous piece positions
      Given a player moves their Troll from E4 to E5
      When the player presses Undo
      Then the Troll is back on E4
      And the game state matches the state before the move

    Scenario: Undo restores the action log to its previous length
      Given a player makes a move that adds entries to the battle log
      When the player presses Undo
      Then the battle log entries added by that move are removed

  # ------------------------------------------------------------------
  # Multiple sequential undos
  # ------------------------------------------------------------------

  Rule: Multiple undos rewind through full game history

    Scenario: Three sequential undos rewind three moves
      Given a player makes three moves
      When the player presses Undo three times
      Then the board matches the state before any of those moves

  # ------------------------------------------------------------------
  # Turn boundary
  # ------------------------------------------------------------------

  Rule: Undo across turn boundaries restores the previous player's turn

    Scenario: Undo after turn passes restores previous player's state
      Given Player A finishes their turn and Player B starts
      When Player B presses Undo (before making any moves)
      Then it is Player A's turn again with their last move undone

  # ------------------------------------------------------------------
  # Pending throw / pull-back
  # ------------------------------------------------------------------

  Rule: Undo during pending throw restores pre-throw state

    Scenario: Undo after choosing a throw direction restores pending throw
      Given a Troll landed on a Rock and chose to throw North
      When the player presses Undo
      Then the game reverts to the pending throw state before the direction was chosen

  Rule: Undo during pending pull-back cancels the prompt

    Scenario: Undo while pull-back prompt is showing cancels it
      Given a pull-back confirmation prompt is displayed
      When the player presses Undo
      Then the pull-back prompt is dismissed
      And the board is restored to the state before the Troll move

  # ------------------------------------------------------------------
  # UI state clearing
  # ------------------------------------------------------------------

  Rule: Undo clears transient UI state

    Scenario: Undo clears piece selection and highlights
      Given a piece is selected with valid move highlights shown
      When the player presses Undo
      Then no piece is selected and no squares are highlighted

  # ------------------------------------------------------------------
  # Availability guards
  # ------------------------------------------------------------------

  Rule: Undo is not available at game start

    Scenario: No undo available when no moves have been made
      Given a new game has just started
      Then the Undo button is not visible

  Rule: Undo is not available after game over

    Scenario: Undo disabled when game is over
      Given the game has ended with a winner
      Then the Undo button is not visible

  Rule: Undo is not available during AI turn

    Scenario: Undo disabled while AI is executing
      Given it is an AI player's turn and the AI is thinking
      Then the Undo button is not visible

  # ------------------------------------------------------------------
  # AI atomic undo
  # ------------------------------------------------------------------

  Rule: AI turns undo atomically

    Scenario: Undoing after an AI turn reverts the entire AI turn in one step
      Given an AI player completed a full turn with multiple moves
      When the human player presses Undo
      Then the entire AI turn is reverted in a single undo step
      And it is the AI player's turn again (with the state before AI planned)

  # ------------------------------------------------------------------
  # History lifecycle
  # ------------------------------------------------------------------

  Rule: History is cleared on new game

    Scenario: Starting a new game clears all undo history
      Given a game has undo history from previous moves
      When a new game is started
      Then there is no undo history available
