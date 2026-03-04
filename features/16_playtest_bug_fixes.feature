@engine @bug-fix
Feature: Playtest Bug Fixes
  As a player
  I want the battle log to include detailed information about levitation and SPLUT! events
  And I want thrown rocks to remain on the board when the throw direction leads off the diamond edge

  # ===================================================================
  # BUG #9: BATTLE LOG DOES NOT MENTION ROCK LEVITATION
  # ===================================================================

  Rule: When a Sorcerer levitates a Rock, the battle log must include the Rock movement details

    @critical @bug-9
    Scenario: Levitation log entry includes rock's old and new position
      Given a game is in progress
      And a Sorcerer is selected with a Rock chosen for levitation
      When the Sorcerer moves and levitates the Rock
      Then the battle log entry should have kind "levitate"
      And the description should include the Rock's origin and destination squares
      And the description format should be like "D7 -> D6 (levitated Rock E9 -> E8)"

    @bug-9
    Scenario: Non-levitation Sorcerer move has a plain description
      Given a game is in progress
      And a Sorcerer is selected without a Rock chosen for levitation
      When the Sorcerer moves to an adjacent empty square
      Then the battle log entry should have kind "move"
      And the description should only contain the Sorcerer's movement squares

  # ===================================================================
  # BUG #10: SPLUT! BATTLE LOG ENTRY LACKS DETAIL
  # ===================================================================

  Rule: When a SPLUT! occurs, the battle log must identify the crushed Dwarf's team and square

    @critical @bug-10
    Scenario: SPLUT! log entry includes crushed Dwarf's team color and square
      Given a game is in progress
      And a Troll has landed on a Rock and must throw
      When the player throws the Rock and it SPLUTs an enemy Dwarf
      Then the SPLUT! log entry should include the crushed Dwarf's team color name
      And the description format should be like "SPLUT! Green Dwarf crushed at E7"

    @bug-10
    Scenario: AI SPLUT! log entry also includes crushed Dwarf details
      Given a game is in progress with an AI player
      And the AI Troll has landed on a Rock
      When the AI throws the Rock and it SPLUTs a Dwarf
      Then the SPLUT! log entry should include the crushed Dwarf's team color name
      And the description should not be a generic "SPLUT! at" message

  # ===================================================================
  # BUG #11: ROCK DISAPPEARS WHEN THROWN OFF DIAMOND EDGE
  # ===================================================================

  Rule: A thrown Rock that would leave the diamond stays on its current square

    @critical @bug-11
    Scenario: Rock thrown East from G7 stays at G7 because H7 is off-diamond
      Given a game is in progress
      And a Troll is on G7 sharing the square with a Rock
      And H7 is outside the valid diamond (Manhattan distance > 4)
      When the player throws the Rock East
      Then the Rock should remain at G7
      And the Rock should not be removed from the board

    @critical @bug-11
    Scenario: Rock thrown North from I5 stays at I5 because I6 is off-diamond
      Given a game is in progress
      And a Troll is on I5 sharing the square with a Rock
      And I6 is outside the valid diamond (Manhattan distance > 4)
      When the player throws the Rock North
      Then the Rock should remain at I5
      And the Rock should not be removed from the board

    @bug-11
    Scenario: Rock thrown inward from a diamond-edge square moves normally
      Given a game is in progress
      And a Troll is on G7 sharing the square with a Rock
      And F7 is inside the valid diamond
      When the player throws the Rock West
      Then the Rock should move away from G7 toward the center
      And the throw should resolve normally following standard trajectory rules

  # ===================================================================
  # BUG #12: ROCK DISAPPEARS AFTER PULL-BACK + DWARF PUSH
  # ===================================================================

  Rule: After a Troll pull-back, the pulled Rock must have valid occupancy so subsequent moves can interact with it

    @critical @bug-12
    Scenario: Pulled Rock retains occupancy and can be pushed by Dwarf
      Given a game is in progress
      And a Troll is on E8 with a Rock on E9 behind it
      When the Troll moves south to E7 with pull-back
      Then the Rock should be at E8 (the Troll's vacated square)
      And squareOccupancy should map E8 to the Rock's ID
      And a Dwarf moving from D8 to E8 should push the Rock east to F8

    @bug-12
    Scenario: Pull-back does not corrupt occupancy when Troll and Rock share history
      Given a game is in progress
      And a Troll is on E5 with a Rock on E6 behind it (south)
      When the Troll moves north to E4 with pull-back
      Then the Rock should be at E5
      And occupancy at E5 should be the Rock
      And occupancy at E4 should be the Troll
