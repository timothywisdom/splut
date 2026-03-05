@ui @lobby
Feature: Lobby UI Layout
  As a player
  I want the lobby screen to be visually balanced and well laid out
  So that the game feels polished from the start

  # -------------------------------------------------------------------
  # Player Count Buttons
  # -------------------------------------------------------------------

  Rule: Player count buttons must fill their container equally

    @critical @bug-13
    Scenario: Player count buttons have equal width with no trailing space
      Given the player count selector is displayed
      Then the player count buttons should each stretch equally to fill the container
      And there should be no extra empty space after the last button
