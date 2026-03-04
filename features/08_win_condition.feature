@win-condition
Feature: Win Condition and Team Elimination
  As a player
  I want the game to correctly detect when a Sorcerer is killed and eliminate the entire team
  So that the game ends when only one Sorcerer remains

  # -------------------------------------------------------------------
  # Sorcerer Death Triggers Team Elimination
  # -------------------------------------------------------------------

  Rule: When a Sorcerer is killed the entire team is removed from the board

    @critical
    Scenario: Killing a Sorcerer removes all three team pieces
      Given a game with Green and Red teams
      And the Red team has a Sorcerer on "E7", a Troll on "D6", and a Dwarf on "F6"
      When the Green Troll throws a Rock that lands on the Red Sorcerer at "E7"
      Then the Red Sorcerer should be removed from the board
      And the Red Troll should be removed from the board
      And the Red Dwarf should be removed from the board

    @critical
    Scenario: Rock stays on the square where the Sorcerer was killed
      Given the Red Sorcerer is on square "E7"
      When a thrown Rock kills the Red Sorcerer on "E7"
      Then the Rock should remain on square "E7"

    Scenario: Team elimination when Dwarf was already killed by SPLUT!
      Given the Red team has only a Sorcerer and Troll remaining (Dwarf was previously killed)
      When a thrown Rock kills the Red Sorcerer
      Then the Red Sorcerer should be removed from the board
      And the Red Troll should be removed from the board

    Scenario: Team elimination when only the Sorcerer remains
      Given the Red team has only a Sorcerer remaining (Dwarf was previously killed by SPLUT!)
      When a thrown Rock kills the Red Sorcerer
      Then the Red Sorcerer should be removed from the board

  # -------------------------------------------------------------------
  # Win Detection
  # -------------------------------------------------------------------

  Rule: The last Sorcerer standing wins the game

    @critical
    Scenario: Game ends when only one Sorcerer remains in a 2-player game
      Given a 2-player game with Green and Red
      And Green's Sorcerer is the only Sorcerer on the board
      When Red's Sorcerer is killed
      Then the game should end
      And Green should be declared the winner

    @critical
    Scenario: Game ends when only one Sorcerer remains in a 4-player game
      Given a 4-player game with Green, Red, Yellow, and Blue
      And Red, Yellow, and Blue Sorcerers have all been killed
      When the last opposing Sorcerer is killed
      Then the game should end
      And the surviving player should be declared the winner

    Scenario: Game does not end when 2 or more Sorcerers remain
      Given a 4-player game with Green, Red, Yellow, and Blue
      When the Red Sorcerer is killed
      Then the game should continue
      And Green, Yellow, and Blue should still be playing

    Scenario: Game does not end when exactly 2 Sorcerers remain
      Given a 4-player game where Red and Yellow have been eliminated
      And Green and Blue Sorcerers are still alive
      When the current turn ends
      Then the game should continue with Green and Blue players

  # -------------------------------------------------------------------
  # Elimination During Turn
  # -------------------------------------------------------------------

  Rule: Team elimination happens immediately when the Sorcerer is killed

    @critical
    Scenario: Eliminated team's pieces are removed immediately after the throw
      Given the Green Troll throws a Rock that kills the Red Sorcerer
      Then all Red pieces should be removed before the next player's turn begins

    Scenario: Self-elimination - killing your own Sorcerer with a throw
      Given the Green Troll throws a Rock northward
      And the Green Sorcerer is in the Rock's path
      When the Rock hits the Green Sorcerer
      Then the Green Sorcerer should be killed
      And the entire Green team should be eliminated
      And the game should check for a winner

    @edge-case
    Scenario: Self-elimination in a 2-player game results in opponent winning
      Given a 2-player game with Green and Red
      And the Green Troll throws a Rock that hits the Green Sorcerer
      When the Green team is eliminated
      Then the game should end
      And Red should be declared the winner

  # -------------------------------------------------------------------
  # Multi-Player Elimination Progression
  # -------------------------------------------------------------------

  Rule: The game continues as players are progressively eliminated

    Scenario: 4-player game continues after first elimination
      Given a 4-player game in progress
      When the first Sorcerer is killed
      Then 3 players should remain active
      And the eliminated player's turn should be skipped

    Scenario: 4-player game continues after second elimination
      Given a 4-player game where one player has already been eliminated
      When another Sorcerer is killed
      Then 2 players should remain active
      And both eliminated players' turns should be skipped

    Scenario: 4-player game ends after third elimination
      Given a 4-player game where two players have already been eliminated
      When the third Sorcerer is killed
      Then only 1 player should remain
      And that player should be declared the winner

  # -------------------------------------------------------------------
  # 3-Player Specific
  # -------------------------------------------------------------------

  Rule: 3-player games follow the same elimination rules

    Scenario: 3-player game continues after first elimination
      Given a 3-player game in progress
      When the first Sorcerer is killed
      Then 2 players should remain active

    Scenario: 3-player game ends after second elimination
      Given a 3-player game where one player has been eliminated
      When the second Sorcerer is killed
      Then the game should end
      And the remaining player should be declared the winner

  # -------------------------------------------------------------------
  # Pieces Freed After Elimination
  # -------------------------------------------------------------------

  Rule: Squares occupied by eliminated team pieces become empty after removal

    Scenario: Squares become available after team elimination
      Given the Red team has pieces on squares "E7", "D6", and "F6"
      When the Red Sorcerer on "E7" is killed by a thrown Rock
      Then square "D6" should be empty
      And square "F6" should be empty
      And square "E7" should contain only the Rock

  # -------------------------------------------------------------------
  # Rocks Persist After Elimination
  # -------------------------------------------------------------------

  Rule: All 4 Rocks remain on the board regardless of team eliminations

    Scenario: Rocks remain after a team is eliminated
      Given a 4-player game with all 4 Rocks on the board
      When a team is eliminated
      Then there should still be 4 Rocks on the board

    Scenario: Rock used to kill Sorcerer stays on the kill square
      Given a Rock at "E3" is thrown north and kills a Sorcerer at "E7"
      When the elimination is processed
      Then the Rock should be on square "E7"
      And the total Rock count should still be 4
