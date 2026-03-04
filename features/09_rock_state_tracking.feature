@rock-state
Feature: Rock State Tracking for Levitation Eligibility
  As a game system
  I want to track which Rocks were moved during each turn
  So that the levitation cooldown rule is correctly enforced

  # -------------------------------------------------------------------
  # Tracking Rock Movement Types
  # -------------------------------------------------------------------

  Rule: Every Rock movement is recorded with the movement type and the turn it occurred on

    @critical
    Scenario: Thrown Rock is tracked as moved
      Given it is the Green player's turn
      When the Green Troll throws a Rock
      Then that Rock should be marked as "Thrown" during Green's turn

    @critical
    Scenario: Levitated Rock is tracked as moved
      Given it is the Green player's turn
      When the Green Sorcerer levitates a Rock
      Then that Rock should be marked as "Levitated" during Green's turn

    @critical
    Scenario: Pushed Rock is tracked as moved
      Given it is the Green player's turn
      When the Green Dwarf pushes a Rock
      Then that Rock should be marked as "Pushed" during Green's turn

    @critical
    Scenario: Pulled Rock is tracked as moved
      Given it is the Green player's turn
      When the Green Troll pulls a Rock via Pull Back
      Then that Rock should be marked as "Pulled" during Green's turn

  # -------------------------------------------------------------------
  # Cooldown Applies Only to Previous Player's Turn
  # -------------------------------------------------------------------

  Rule: The levitation cooldown only blocks Rocks moved during the immediately previous player's turn

    @critical
    Scenario: Rock moved by the player two turns ago is eligible for levitation
      Given Green threw Rock A during their turn
      And Red did not move Rock A during their turn
      When it is Yellow's turn
      Then Yellow's Sorcerer should be able to levitate Rock A

    @critical
    Scenario: Rock moved by the immediately previous player is NOT eligible
      Given Red levitated Rock A during their turn
      When it is Yellow's turn
      Then Yellow's Sorcerer should NOT be able to levitate Rock A

    Scenario: Rock not moved by anyone in the previous turn is always eligible
      Given Rock B has not been moved for 3 turns
      When any player's Sorcerer attempts to levitate Rock B
      Then the levitation should be allowed

  # -------------------------------------------------------------------
  # Multiple Rocks Tracked Independently
  # -------------------------------------------------------------------

  Rule: Each Rock's movement state is tracked independently

    Scenario: Only the specific Rock that was moved is restricted
      Given Green threw Rock A during their turn
      And Green did not move Rock B, Rock C, or Rock D
      When it is Red's turn
      Then Red should NOT be able to levitate Rock A
      But Red should be able to levitate Rock B
      And Red should be able to levitate Rock C
      And Red should be able to levitate Rock D

    Scenario: Multiple Rocks moved in one turn are all restricted
      Given Green pushed Rock A and pulled Rock B during their turn
      When it is Red's turn
      Then Red should NOT be able to levitate Rock A
      And Red should NOT be able to levitate Rock B

  # -------------------------------------------------------------------
  # Current Turn vs Previous Turn Distinction
  # -------------------------------------------------------------------

  Rule: Rocks moved during YOUR OWN current turn CAN be levitated

    @critical
    Scenario: Rock pushed by own Dwarf on move 1 can be levitated on move 2
      Given it is Green's turn
      And Green's Dwarf pushes Rock A on move 1
      When Green's Sorcerer attempts to levitate Rock A on move 2
      Then the levitation should be allowed

    @critical
    Scenario: Rock pulled by own Troll on move 1 can be levitated on move 2
      Given it is Green's turn
      And Green's Troll pulls Rock A on move 1
      When Green's Sorcerer attempts to levitate Rock A on move 2
      Then the levitation should be allowed

    @edge-case
    Scenario: Rock thrown by own Troll ends the turn so levitation is moot
      Given it is Green's turn
      When Green's Troll throws Rock A
      Then Green's turn ends immediately
      And there is no opportunity to levitate Rock A during this turn

  # -------------------------------------------------------------------
  # State Reset Between Turns
  # -------------------------------------------------------------------

  Rule: Rock movement tracking rolls forward each turn keeping only the previous turn's state

    Scenario: Previous turn's movement state replaces the one before it
      Given during turn N-2, Green moved Rock A
      And during turn N-1 (Red's turn), Red did NOT move Rock A
      And during turn N-1, Red moved Rock B
      When it is turn N (Yellow's turn)
      Then Rock A should be eligible for levitation
      And Rock B should NOT be eligible for levitation

    Scenario: State correctly resets after a full round
      Given during the previous round, Green threw Rock A
      And no one has moved Rock A since
      When it returns to Green's turn
      Then Rock A should be eligible for levitation by Green

  # -------------------------------------------------------------------
  # Tracking Through Team Elimination
  # -------------------------------------------------------------------

  Rule: Rock state tracking continues correctly when teams are eliminated

    @edge-case
    Scenario: Rock that killed a Sorcerer is tracked as moved
      Given a Rock was thrown and killed a Sorcerer this turn
      When the next player's turn begins
      Then that Rock should be marked as moved during the previous turn
      And the next player should NOT be able to levitate that Rock

    @edge-case
    Scenario: Rocks remain trackable after the team that moved them is eliminated
      Given Green threw Rock A and Green's Sorcerer was killed later the same turn
      When the next player's turn begins
      Then Rock A should still be tracked as moved during the previous turn
      And the next player should NOT be able to levitate Rock A

  # -------------------------------------------------------------------
  # Dwarf Push Tracking Multiple Rocks
  # -------------------------------------------------------------------

  Rule: When a Dwarf push moves multiple Rocks in a chain all are tracked

    @edge-case
    Scenario: Dwarf pushes a chain containing two Rocks
      Given the current player's Dwarf is on square "E3"
      And Rock A is on square "E4"
      And Rock B is on square "E5"
      And square "E6" is empty
      When the Dwarf pushes north into "E4"
      Then Rock A should be marked as "Pushed" during this turn
      And Rock B should be marked as "Pushed" during this turn
      And both Rocks should be ineligible for levitation by the next player

  # -------------------------------------------------------------------
  # Levitate Eligibility Summary
  # -------------------------------------------------------------------

  Rule: Levitation eligibility follows precise rules based on who moved the Rock and when

    Scenario Outline: Levitation eligibility based on movement history
      Given <mover> moved Rock A via <action> during <when>
      When the current player's Sorcerer attempts to levitate Rock A
      Then the levitation should be <result>

      Examples:
        | mover            | action    | when              | result   |
        | previous player  | Throw     | previous turn     | rejected |
        | previous player  | Levitate  | previous turn     | rejected |
        | previous player  | Push      | previous turn     | rejected |
        | previous player  | Pull Back | previous turn     | rejected |
        | current player   | Push      | current turn      | allowed  |
        | current player   | Pull Back | current turn      | allowed  |
        | two-ago player   | Throw     | two turns ago     | allowed  |
        | nobody           | none      | never             | allowed  |
