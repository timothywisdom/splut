@setup
Feature: Game Setup
  As a player
  I want the game board to be correctly initialized with all pieces in their starting positions
  So that we can begin a fair game of SPLUT!

  # -------------------------------------------------------------------
  # Board Geometry
  # -------------------------------------------------------------------

  Rule: The board is a diamond-shaped grid with columns A-I and rows 1-9

    @critical
    Scenario: Valid board squares form a diamond shape
      Given a new game board
      Then the board should contain exactly the valid diamond-shaped squares
      And squares outside the diamond boundary should not exist

    Scenario: Each square has at most 4 orthogonal neighbours
      Given a new game board
      Then every square should have only horizontal and vertical neighbours
      And no square should have diagonal neighbours

    Scenario: Corner squares have exactly one adjacent square
      Given a new game board
      Then square "E9" should have exactly 1 adjacent square
      And square "E1" should have exactly 1 adjacent square
      And square "A5" should have exactly 1 adjacent square
      And square "I5" should have exactly 1 adjacent square

  # -------------------------------------------------------------------
  # Rock Placement
  # -------------------------------------------------------------------

  Rule: Four Rocks are placed at the outermost corner squares at game start

    @critical
    Scenario: Rocks are placed at the four corner squares
      Given a new game is being set up
      When the board is initialized
      Then a Rock should be on square "E9"
      And a Rock should be on square "E1"
      And a Rock should be on square "A5"
      And a Rock should be on square "I5"

    Scenario: Rocks are neutral and not owned by any player
      Given a new game is being set up
      When the board is initialized
      Then none of the 4 Rocks should be assigned to any player

    Scenario: Exactly 4 Rocks are present on the board
      Given a new game is being set up
      When the board is initialized
      Then there should be exactly 4 Rocks on the board

  # -------------------------------------------------------------------
  # 4-Player Setup
  # -------------------------------------------------------------------

  Rule: In a 4-player game each player's team is placed near their assigned Rock

    @critical
    Scenario: 4-player game places Green team at the top
      Given a new 4-player game is being set up
      When the board is initialized
      Then the Green Sorcerer should be on square "D8"
      And the Green Dwarf should be on square "E8"
      And the Green Troll should be on square "F8"

    @critical
    Scenario: 4-player game places Red team at the bottom
      Given a new 4-player game is being set up
      When the board is initialized
      Then the Red Sorcerer should be on square "F2"
      And the Red Dwarf should be on square "E2"
      And the Red Troll should be on square "D2"

    @critical
    Scenario: 4-player game places Yellow team at the left
      Given a new 4-player game is being set up
      When the board is initialized
      Then the Yellow Sorcerer should be on square "B6"
      And the Yellow Dwarf should be on square "B5"
      And the Yellow Troll should be on square "B4"

    @critical
    Scenario: 4-player game places Blue team at the right
      Given a new 4-player game is being set up
      When the board is initialized
      Then the Blue Sorcerer should be on square "H6"
      And the Blue Dwarf should be on square "H5"
      And the Blue Troll should be on square "H4"

    Scenario: 4-player game has 16 pieces on the board
      Given a new 4-player game is being set up
      When the board is initialized
      Then there should be 12 player pieces on the board
      And there should be 4 Rocks on the board

  # -------------------------------------------------------------------
  # 2-Player Setup
  # -------------------------------------------------------------------

  Rule: In a 2-player game the players sit at opposite seats

    @critical
    Scenario: 2-player game with Top and Bottom seats
      Given a new 2-player game with players at "Top" and "Bottom"
      When the board is initialized
      Then the Top player's team should be in the top starting positions
      And the Bottom player's team should be in the bottom starting positions
      And the Left and Right starting positions should be empty of player pieces

    @critical
    Scenario: 2-player game with Left and Right seats
      Given a new 2-player game with players at "Left" and "Right"
      When the board is initialized
      Then the Left player's team should be in the left starting positions
      And the Right player's team should be in the right starting positions
      And the Top and Bottom starting positions should be empty of player pieces

    Scenario: 2-player game still places all 4 Rocks
      Given a new 2-player game with players at "Top" and "Bottom"
      When the board is initialized
      Then there should be exactly 4 Rocks on the board

    Scenario: 2-player game has 10 pieces total on the board
      Given a new 2-player game with players at "Top" and "Bottom"
      When the board is initialized
      Then there should be 6 player pieces on the board
      And there should be 4 Rocks on the board

  # -------------------------------------------------------------------
  # 3-Player Setup
  # -------------------------------------------------------------------

  Rule: In a 3-player game three seats are occupied and one is empty

    @critical
    Scenario: 3-player game occupies three seats
      Given a new 3-player game with players at "Top", "Bottom", and "Left"
      When the board is initialized
      Then the Top player's team should be in the top starting positions
      And the Bottom player's team should be in the bottom starting positions
      And the Left player's team should be in the left starting positions
      And the Right starting positions should be empty of player pieces

    Scenario: 3-player game has 13 pieces total on the board
      Given a new 3-player game with players at "Top", "Bottom", and "Left"
      When the board is initialized
      Then there should be 9 player pieces on the board
      And there should be 4 Rocks on the board

  # -------------------------------------------------------------------
  # Team Composition
  # -------------------------------------------------------------------

  Rule: Each player's team consists of exactly one Sorcerer, one Troll, and one Dwarf

    Scenario Outline: Each player has exactly one of each piece type
      Given a new 4-player game is being set up
      When the board is initialized
      Then the <team> player should have exactly 1 Sorcerer
      And the <team> player should have exactly 1 Troll
      And the <team> player should have exactly 1 Dwarf

      Examples:
        | team   |
        | Green  |
        | Red    |
        | Yellow |
        | Blue   |

  # -------------------------------------------------------------------
  # Starting Position Validation
  # -------------------------------------------------------------------

  Rule: Starting positions must conform to the Dwarf-in-front-of-Rock pattern

    Scenario: Dwarf starts directly adjacent to its team's Rock
      Given a new 4-player game is being set up
      When the board is initialized
      Then each team's Dwarf should be on the square adjacent to and directly in front of its team's Rock

    Scenario: Sorcerer starts to the left of the Dwarf from the Rock's perspective
      Given a new 4-player game is being set up
      When the board is initialized
      Then each team's Sorcerer should be to the left of the Dwarf from the Rock's perspective

    Scenario: Troll starts to the right of the Dwarf from the Rock's perspective
      Given a new 4-player game is being set up
      When the board is initialized
      Then each team's Troll should be to the right of the Dwarf from the Rock's perspective

  # -------------------------------------------------------------------
  # Error Conditions
  # -------------------------------------------------------------------

  Rule: Game setup must reject invalid configurations

    @error
    Scenario: Cannot start a game with fewer than 2 players
      Given a game setup with 1 player
      When the game attempts to initialize
      Then the game should reject the setup with an error "minimum 2 players required"

    @error
    Scenario: Cannot start a game with more than 4 players
      Given a game setup with 5 players
      When the game attempts to initialize
      Then the game should reject the setup with an error "maximum 4 players allowed"

    @error
    Scenario: 2-player game rejects non-opposite seating
      Given a 2-player game setup with players at "Top" and "Left"
      When the game attempts to initialize
      Then the game should reject the setup with an error "2-player game requires opposite seats"
