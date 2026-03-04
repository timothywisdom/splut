@troll @ui @pull-back
Feature: Troll Pull-Back Rock Selection UX
  As a player
  I want a way to select a rock to pull when moving my Troll
  So that I can strategically reposition rocks during Troll movement

  Background:
    Given a game is in progress
    And it is a human player's turn with moves available

  # -------------------------------------------------------------------
  # Pull-Back Prompt
  # -------------------------------------------------------------------

  Rule: When a Troll moves and there is an eligible rock to pull, the player must be offered the choice

    @critical @bug-1
    Scenario: Player is prompted to pull a rock when eligible
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E4"
      And square "E6" is empty
      When the player selects their Troll
      And clicks the valid move target "E6"
      Then the UI should prompt the player with a pull-back confirmation
      And the prompt should indicate which Rock can be pulled (the one on "E4")

    @critical @bug-1
    Scenario: Player chooses to pull the rock
      Given the current player's Troll is about to move from "E5" to "E6"
      And a Rock on "E4" is eligible for pull-back
      When the player confirms the pull-back
      Then the Troll should move to "E6"
      And the Rock should move from "E4" to "E5"

    @critical @bug-1
    Scenario: Player declines to pull the rock
      Given the current player's Troll is about to move from "E5" to "E6"
      And a Rock on "E4" is eligible for pull-back
      When the player declines the pull-back
      Then the Troll should move to "E6"
      And the Rock should remain on "E4"

  # -------------------------------------------------------------------
  # No Pull-Back Available
  # -------------------------------------------------------------------

  Rule: When no rock is eligible, the Troll moves immediately without prompting

    @bug-1
    Scenario: Troll moves without prompt when no rock is eligible for pull-back
      Given the current player's Troll is on square "E5"
      And no Rock is directly behind the Troll relative to any valid move direction
      When the player selects their Troll and clicks a valid move target
      Then the Troll should move immediately without a pull-back prompt

  # -------------------------------------------------------------------
  # Pull-Back Eligible Highlighting
  # -------------------------------------------------------------------

  Rule: The eligible pull-back rock should be visually indicated

    @bug-1
    Scenario: Eligible pull-back rock is highlighted during confirmation
      Given the player is being prompted for a pull-back confirmation
      Then the eligible Rock should be visually highlighted
      And the Troll's destination square should be indicated
      And the Troll's current (vacated) square should show where the Rock will land

  # -------------------------------------------------------------------
  # Edge Cases
  # -------------------------------------------------------------------

  Rule: Pull-back prompt handles edge cases correctly

    @bug-1 @edge-case
    Scenario: Troll landing on a Rock triggers throw, not pull-back
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E6"
      When the player moves their Troll to "E6" (landing on the Rock)
      Then no pull-back prompt should appear
      And the throw direction picker should appear instead

    @bug-1 @edge-case
    Scenario: Pull-back prompt with rock behind for one direction only
      Given the current player's Troll is on square "E5"
      And a Rock is on square "E4" (south of Troll)
      And square "E6" is empty (north)
      And square "D5" is empty (west) with no rock on "F5"
      When the player selects the Troll and clicks "E6" (moving north)
      Then a pull-back prompt should appear for the Rock on "E4"
      But when the player instead clicks "D5" (moving west)
      Then no pull-back prompt should appear because the Rock is not in line
