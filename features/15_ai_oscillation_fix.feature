@ai @bug-fix
Feature: AI Anti-Oscillation and Turn Banner Display
  As a player
  I want the AI to make meaningful progress each turn rather than moving pieces back and forth
  And I want the turn banner to correctly display throw state instead of an invalid move count

  # ===================================================================
  # BUG #7: AI TROLL OSCILLATION LOOP
  # ===================================================================

  Rule: The AI must not move a piece back to a square it already occupied during the same turn

    @critical @bug-7
    Scenario: AI Troll does not oscillate between two squares in a 2-move turn
      Given a 2-player game with Top as AI and Bottom as Human
      And the AI Troll is on square "D2"
      And a Rock is on square "E1" at distance 2
      And another Rock is on square "A5" at distance 6
      And the AI player has 2 moves available
      When the AI plans its turn
      Then the AI Troll should not end up on the same square it started on
      And the planned moves should visit distinct squares

    @critical @bug-7
    Scenario: AI Troll does not oscillate between two squares in a 3-move turn
      Given a 2-player game with Top as AI and Bottom as Human
      And the AI Troll is on square "D2"
      And a Rock is on square "E1" at distance 2
      And another Rock is on square "A5" at distance 6
      And the AI player has 3 moves available
      When the AI plans its turn
      Then the AI Troll should not return to square "D2" during the turn
      And the planned moves should make net progress toward a Rock

    @critical @bug-7
    Scenario: AI visited-square tracking prevents backtracking
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E5"
      And the AI player has 3 moves available
      When the AI moves its Troll to "E6" on move 1
      Then on move 2 the AI should not move the Troll back to "E5"
      Because "E5" is in the visited squares set

    @bug-7
    Scenario: AI uses all 3 moves making net forward progress
      Given a 2-player game in starting position with Top as AI
      And the AI player has 3 moves available
      When the AI plans and executes its turn
      Then all 3 moves should target distinct squares
      And at least one piece should be closer to a Rock than at the start of the turn

  # ===================================================================
  # BUG #8: MOVE COUNTER DISPLAY DURING PENDING THROW
  # ===================================================================

  Rule: The turn banner shows "Throw!" instead of an invalid move count when a throw is pending

    @critical @bug-8
    Scenario: Turn banner shows "Throw!" when pending throw is active
      Given a game in progress
      And the current player's Troll has landed on a Rock on their last available move
      And the pending throw flag is set
      When the turn banner renders
      Then the move counter text should display "Throw!"
      And it should not display "Move 4 of 3" or any number exceeding moves allowed

    @bug-8
    Scenario: Turn banner shows capped move number when not all moves are used
      Given a game in progress
      And the current player has used 2 of 3 moves
      And no throw is pending
      When the turn banner renders
      Then the move counter text should display "Move 3 of 3"

    @bug-8
    Scenario: Turn banner shows "Throw!" when throw occurs mid-turn
      Given a game in progress
      And the current player's Troll has landed on a Rock on move 1 of 3
      And the pending throw flag is set
      When the turn banner renders
      Then the move counter text should display "Throw!"
