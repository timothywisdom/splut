@sorcerer @ui @levitate
Feature: Sorcerer Levitation Rock Selection UX
  As a player
  I want a way to select a Rock to levitate before moving my Sorcerer
  So that I can strategically reposition rocks using my Sorcerer

  Background:
    Given a game is in progress
    And it is a human player's turn with moves available

  # -------------------------------------------------------------------
  # Rock Selection Phase
  # -------------------------------------------------------------------

  Rule: When a Sorcerer is selected, eligible rocks should be highlighted for levitation

    @critical @bug-2
    Scenario: Selecting a Sorcerer shows levitation-eligible rocks
      Given the current player's Sorcerer is on square "E5"
      And a Rock on "D4" is eligible for levitation (not on cooldown)
      And a Rock on "I5" is on cooldown (moved last turn)
      When the player selects their Sorcerer
      Then Rock on "D4" should be highlighted with a levitate-eligible style
      And Rock on "I5" should NOT be highlighted (on cooldown)
      And the valid move targets for the Sorcerer should be shown

    @critical @bug-2
    Scenario: Player clicks an eligible rock to select it for levitation
      Given the current player's Sorcerer is selected
      And a Rock on "D4" is highlighted as levitate-eligible
      When the player clicks the Rock on "D4"
      Then the Rock on "D4" should be visually marked as the levitation target
      And the valid move targets should update to only show directions where the Rock can also move

    @critical @bug-2
    Scenario: Player clicks the selected rock again to deselect levitation
      Given the current player's Sorcerer is selected
      And the Rock on "D4" is currently set as the levitation target
      When the player clicks the Rock on "D4" again
      Then the levitation target should be cleared
      And all valid move targets for the Sorcerer should be shown again (without levitation constraint)

  # -------------------------------------------------------------------
  # Moving With Levitation
  # -------------------------------------------------------------------

  Rule: After selecting a rock, the Sorcerer moves and the rock mirrors the movement

    @critical @bug-2
    Scenario: Sorcerer moves with a levitated rock
      Given the current player's Sorcerer is on "E5"
      And the player has selected the Rock on "D4" for levitation
      And square "E6" is empty and square "D5" is empty
      When the player clicks "E6" to move the Sorcerer north
      Then the Sorcerer should move to "E6"
      And the Rock should move from "D4" to "D5" (one square north)

    @bug-2
    Scenario: Sorcerer moves without selecting a rock for levitation
      Given the current player's Sorcerer is selected
      And no Rock has been selected for levitation
      When the player clicks a valid move target
      Then the Sorcerer should move normally without levitating any rock

  # -------------------------------------------------------------------
  # Valid Move Filtering with Levitation
  # -------------------------------------------------------------------

  Rule: When a rock is selected for levitation, move targets are filtered to directions where the rock can also move

    @critical @bug-2
    Scenario: Move targets filtered by rock's ability to move
      Given the current player's Sorcerer is on "E5"
      And the player has selected the Rock on "D5" for levitation
      And square "D6" is occupied (blocking Rock's northward path)
      And square "E6" is empty
      Then "E6" should NOT be shown as a valid move (Rock would be blocked going north)
      But if the player deselects the Rock, "E6" should become a valid move again

    @bug-2
    Scenario: All directions blocked with levitation shows no valid moves
      Given the current player's Sorcerer is on "E5"
      And a Rock is selected for levitation
      And the Rock's destination is blocked in all four directions
      Then no valid move targets should be shown while the Rock is selected
      And the player can deselect the Rock to see moves without levitation

  # -------------------------------------------------------------------
  # Levitation State Across Turn
  # -------------------------------------------------------------------

  Rule: Levitation selection persists within a turn but can be changed between moves

    @bug-2
    Scenario: Levitation rock remains selected for consecutive Sorcerer moves
      Given the current player's Sorcerer levitated a Rock on move 1
      When the player selects the Sorcerer for move 2
      Then the same Rock should still be indicated as the levitation target
      And the player can continue levitating the same Rock

    @bug-2
    Scenario: After moving a different piece, levitation cannot resume
      Given the current player's Sorcerer levitated a Rock on move 1
      And the player moved their Troll on move 2
      When the player selects their Sorcerer on move 3
      Then no rocks should be shown as levitate-eligible
      And a visual indicator should show levitation is interrupted for this turn
