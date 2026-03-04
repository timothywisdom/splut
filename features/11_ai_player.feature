@ai
Feature: AI Player
  As a player
  I want to designate game seats as AI-controlled
  So that the game can fill empty seats with automated opponents that follow a deterministic strategy

  # ===================================================================
  # GAME SETUP WITH AI PLAYERS
  # ===================================================================

  # -------------------------------------------------------------------
  # Designating AI Seats
  # -------------------------------------------------------------------

  Rule: Any player seat can be designated as AI-controlled at game setup

    @critical @setup
    Scenario: 2-player game with one AI opponent
      Given a 2-player game setup with players at "Top" and "Bottom"
      And the "Bottom" seat is designated as AI
      When the board is initialized
      Then the Top seat should be marked as "Human"
      And the Bottom seat should be marked as "AI"
      And the Bottom team should be placed in the bottom starting positions

    @critical @setup
    Scenario: 4-player game with two AI opponents
      Given a 4-player game setup with seats Green, Red, Yellow, Blue
      And the "Red" and "Yellow" seats are designated as AI
      When the board is initialized
      Then the Green seat should be marked as "Human"
      And the Red seat should be marked as "AI"
      And the Yellow seat should be marked as "AI"
      And the Blue seat should be marked as "Human"

    @setup
    Scenario: 3-player game with one AI opponent
      Given a 3-player game setup with players at "Top", "Bottom", and "Left"
      And the "Left" seat is designated as AI
      When the board is initialized
      Then the Left seat should be marked as "AI"
      And the Top and Bottom seats should be marked as "Human"

    @setup
    Scenario: 4-player game with three AI opponents
      Given a 4-player game setup with seats Green, Red, Yellow, Blue
      And the "Red", "Yellow", and "Blue" seats are designated as AI
      When the board is initialized
      Then only Green should be marked as "Human"
      And Red, Yellow, and Blue should be marked as "AI"

    @critical @setup
    Scenario: All-AI game with no human players
      Given a 4-player game setup with seats Green, Red, Yellow, Blue
      And all seats are designated as AI
      When the board is initialized
      Then all 4 seats should be marked as "AI"
      And the game should begin automatically

    @setup
    Scenario: AI players follow the same seat assignment rules as humans
      Given a 2-player game setup with players at "Top" and "Left"
      And the "Left" seat is designated as AI
      When the game attempts to initialize
      Then the game should reject the setup with an error "2-player game requires opposite seats"

    @setup
    Scenario Outline: Mixed human and AI games across player counts
      Given a <count>-player game setup
      And <ai_count> of the seats are designated as AI
      When the board is initialized
      Then there should be <human_count> human-controlled seats
      And there should be <ai_count> AI-controlled seats
      And piece placement should follow standard rules

      Examples:
        | count | ai_count | human_count |
        | 2     | 1        | 1           |
        | 2     | 2        | 0           |
        | 3     | 1        | 2           |
        | 3     | 2        | 1           |
        | 3     | 3        | 0           |
        | 4     | 1        | 3           |
        | 4     | 2        | 2           |
        | 4     | 3        | 1           |
        | 4     | 4        | 0           |

  # ===================================================================
  # AI TURN EXECUTION
  # ===================================================================

  # -------------------------------------------------------------------
  # Automatic Turn Triggering
  # -------------------------------------------------------------------

  Rule: When it becomes an AI player's turn the AI computes and executes moves automatically

    @critical @turns
    Scenario: AI turn triggers automatically when it is the AI player's turn
      Given a 2-player game with Top as Human and Bottom as AI
      And the game is in progress
      When the Top player finishes their turn
      Then the Bottom AI player's turn should begin automatically
      And the AI should compute and execute its moves without human input

    @critical @turns
    Scenario: Human player cannot interact with the board during an AI turn
      Given a 2-player game with Top as Human and Bottom as AI
      And it is the Bottom AI player's turn
      When the Top player attempts to select a piece on the board
      Then the interaction should be rejected
      And an "AI is thinking..." indicator should be displayed

    @turns
    Scenario: AI "thinking" indicator is shown during AI turn execution
      Given a 2-player game with Top as Human and Bottom as AI
      When the Bottom AI player's turn begins
      Then an "AI is thinking..." indicator should be shown
      And the AI player's pieces should display a thinking animation
      And the indicator should remain until the AI turn completes

    @turns
    Scenario: Configurable delay between AI moves for visual feedback
      Given a 2-player game with Top as Human and Bottom as AI
      And the AI move delay is set to 500 milliseconds
      When the Bottom AI player executes a 3-move turn
      Then there should be approximately 500 milliseconds between each move
      And the human player can observe each AI move individually

  # -------------------------------------------------------------------
  # AI Mandatory Move Compliance
  # -------------------------------------------------------------------

  Rule: The AI always uses all of its mandatory moves unless a throw ends the turn

    @critical @turns
    Scenario: AI uses exactly 1 move on the first turn of the game
      Given a 2-player game where Bottom AI takes the first turn
      When the AI executes its first turn
      Then the AI should make exactly 1 move
      And the AI's turn should end

    @critical @turns
    Scenario: AI uses exactly 2 moves on the second turn of the game
      Given a 2-player game where Bottom AI takes the second turn
      When the AI executes its turn
      Then the AI should make exactly 2 moves
      And the AI's turn should end

    @critical @turns
    Scenario: AI uses all 3 moves on a standard turn
      Given a game in progress where it is the AI player's turn
      And the AI player has 3 moves available
      And no throw opportunity arises during the turn
      When the AI executes its turn
      Then the AI should make exactly 3 moves
      And the AI's turn should end

    @critical @turns
    Scenario: AI turn ends immediately after a throw
      Given a game in progress where it is the AI player's turn
      And the AI player has 3 moves available
      When the AI's Troll lands on a Rock and throws it on the first move
      Then the AI's turn should end immediately
      And no further AI moves should be executed this turn

    @turns
    Scenario: AI throw on second move ends turn with 1 unused move
      Given a game in progress where it is the AI player's turn
      And the AI player has 3 moves available
      When the AI makes a non-throw move as its first move
      And the AI's Troll lands on a Rock and throws it on the second move
      Then the AI's turn should end immediately
      And the third move should be forfeited

  # ===================================================================
  # AI TIER 1: IMMEDIATE WIN
  # ===================================================================

  # -------------------------------------------------------------------
  # Troll Already on Rock — Direct Kill Shot
  # -------------------------------------------------------------------

  Rule: If the AI Troll is on a Rock and can throw to kill an enemy Sorcerer it takes the kill shot

    @critical
    Scenario: AI Troll already on Rock throws to kill enemy Sorcerer
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E5" with a Rock
      And an enemy Sorcerer is on square "E8"
      And squares "E6" and "E7" are empty
      When the AI evaluates its next move
      Then the AI should throw the Rock north
      And the Rock should land on square "E8"
      And the enemy Sorcerer should be killed
      And the AI's turn should end immediately

    @critical
    Scenario: AI Troll already on Rock throws south to kill enemy Sorcerer
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E5" with a Rock
      And an enemy Sorcerer is on square "E3"
      And square "E4" is empty
      When the AI evaluates its next move
      Then the AI should throw the Rock south
      And the Rock should land on square "E3"
      And the enemy Sorcerer should be killed

  # -------------------------------------------------------------------
  # Troll Moves to Rock Then Throws — Reachable Kill
  # -------------------------------------------------------------------

  Rule: If the AI Troll can move onto a Rock in one step and throwing from there kills a Sorcerer the AI does it

    @critical
    Scenario: AI Troll moves one step onto Rock and throws to kill
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E4"
      And a Rock is on square "E5"
      And an enemy Sorcerer is on square "E8"
      And squares "E6" and "E7" are empty
      When the AI evaluates its next move
      Then the AI should move its Troll from "E4" to "E5"
      And the AI should throw the Rock north
      And the Rock should land on square "E8"
      And the enemy Sorcerer should be killed

    @critical
    Scenario: AI Troll moves onto Rock and throws east to kill
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "D5"
      And a Rock is on square "E5"
      And an enemy Sorcerer is on square "G5"
      And square "F5" is empty
      When the AI evaluates its next move
      Then the AI should move its Troll from "D5" to "E5"
      And the AI should throw the Rock east
      And the Rock should land on square "G5"
      And the enemy Sorcerer should be killed

  # -------------------------------------------------------------------
  # Tier 1 Tiebreaker
  # -------------------------------------------------------------------

  Rule: When multiple kill opportunities exist the AI picks the one targeting the alphabetically-first square

    @critical
    Scenario: AI breaks Tier 1 tie by alphabetical target square
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E5" with a Rock
      And an enemy Sorcerer is on square "E8" in a clear line north
      And another enemy Sorcerer is on square "C5" in a clear line west
      When the AI evaluates its next move
      Then the AI should throw the Rock west toward "C5"
      Because "C5" is alphabetically before "E8"

    Scenario: AI breaks Tier 1 tie between two reachable Rocks
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E5"
      And a Rock is on square "D5" with an enemy Sorcerer at "A5" in a clear line west
      And a Rock is on square "E6" with an enemy Sorcerer at "E8" in a clear line north
      When the AI evaluates its next move
      Then the AI should move its Troll to "D5" and throw west toward "A5"
      Because "A5" is alphabetically before "E8"

  # -------------------------------------------------------------------
  # Tier 1 Not Applicable
  # -------------------------------------------------------------------

  Rule: If no immediate kill opportunity exists the AI does not use Tier 1

    Scenario: No kill opportunity means AI skips Tier 1
      Given a game in progress where it is the AI player's turn
      And the AI Troll is not on any Rock
      And no Rock is adjacent to the AI Troll
      When the AI evaluates available Tier 1 actions
      Then no Tier 1 action should be available
      And the AI should evaluate Tier 2

    Scenario: Troll on Rock but all throw directions are blocked before any Sorcerer
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E5" with a Rock
      And no enemy Sorcerer is in a clear throwing line from "E5" in any direction
      When the AI evaluates available Tier 1 actions
      Then no Tier 1 action should be available
      And the AI should evaluate Tier 2

  # ===================================================================
  # AI TIER 2: DEFENSIVE ESCAPE
  # ===================================================================

  # -------------------------------------------------------------------
  # Sorcerer Threatened by Row
  # -------------------------------------------------------------------

  Rule: If the AI Sorcerer is threatened by an enemy Troll on a Rock in the same row or column with no obstacle between them the AI moves the Sorcerer to safety

    @critical
    Scenario: AI Sorcerer escapes from a row threat
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "G5"
      And an enemy Troll is on square "C5" with a Rock
      And squares "D5", "E5", and "F5" are empty between them
      When the AI evaluates its next move
      Then the AI should move its Sorcerer out of row 5
      And the AI Sorcerer should not remain on any square in row 5

    @critical
    Scenario: AI Sorcerer escapes from a column threat
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "E7"
      And an enemy Troll is on square "E3" with a Rock
      And squares "E4", "E5", and "E6" are empty between them
      When the AI evaluates its next move
      Then the AI should move its Sorcerer out of column E
      And the AI Sorcerer should not remain on any square in column E

    @critical
    Scenario: AI defensive escape picks the alphabetically-first safe square
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "E6"
      And an enemy Troll is on square "E3" with a Rock
      And squares "E4" and "E5" are empty between them
      And square "D6" is empty and not in any threatened line
      And square "F6" is empty and not in any threatened line
      When the AI evaluates its next move
      Then the AI should move its Sorcerer to "D6"
      Because "D6" is alphabetically before "F6"

  # -------------------------------------------------------------------
  # Not Threatened
  # -------------------------------------------------------------------

  Rule: If the AI Sorcerer is not threatened the AI does not use Tier 2

    Scenario: Sorcerer not in line with any enemy Troll on a Rock
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "D6"
      And no enemy Troll is on a Rock in the same row or column as "D6"
      When the AI evaluates available Tier 2 actions
      Then no Tier 2 action should be available
      And the AI should evaluate Tier 3

    Scenario: Enemy Troll is in the same row but not on a Rock
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "G5"
      And an enemy Troll is on square "C5" without a Rock
      When the AI evaluates available Tier 2 actions
      Then no Tier 2 action should be available
      And the AI should evaluate Tier 3

    @edge-case
    Scenario: Obstacle between enemy Troll-on-Rock and AI Sorcerer negates threat
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "G5"
      And an enemy Troll is on square "C5" with a Rock
      And another Troll is on square "E5" between them
      When the AI evaluates available Tier 2 actions
      Then no Tier 2 action should be available
      Because the intervening Troll is an obstacle that blocks the throw line

  # ===================================================================
  # AI TIER 3: OFFENSIVE ROCK POSITIONING
  # ===================================================================

  # -------------------------------------------------------------------
  # Pull Back to Reposition Rock
  # -------------------------------------------------------------------

  Rule: If the AI Troll is adjacent to a Rock the AI can Pull Back while moving to reposition the Rock

    @critical
    Scenario: AI Troll pulls Rock behind it to reposition
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E5"
      And a Rock is on square "E4"
      And square "E6" is empty
      And no Tier 1 or Tier 2 actions are available
      When the AI evaluates its next move
      Then the AI should move its Troll to "E6" with Pull Back
      And the Rock should move from "E4" to "E5"

  # -------------------------------------------------------------------
  # Levitate Rock Toward Enemy
  # -------------------------------------------------------------------

  Rule: The AI Sorcerer can levitate an eligible Rock one step closer to an enemy Sorcerer's row or column

    @critical
    Scenario: AI Sorcerer levitates Rock toward enemy Sorcerer row
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "D6"
      And a Rock is on square "C4" eligible for levitation
      And an enemy Sorcerer is on square "F7"
      And square "D7" is empty and square "C5" is empty
      And no Tier 1, Tier 2, or Pull Back actions are available
      When the AI evaluates its next move
      Then the AI should move its Sorcerer to "D7" while levitating the Rock from "C4" to "C5"
      And the Rock should be one step closer to the enemy Sorcerer's row

    Scenario: AI skips Rock on cooldown for Tier 3 levitation
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "D6"
      And Rock A on "C4" was moved during the previous player's turn
      And Rock B on "F3" is eligible for levitation
      And no Tier 1 or Tier 2 actions are available
      When the AI evaluates Tier 3 levitation options
      Then Rock A should be excluded due to cooldown
      And the AI should consider Rock B for levitation instead

  # -------------------------------------------------------------------
  # Pull Back Takes Priority Over Levitate in Tier 3
  # -------------------------------------------------------------------

  Rule: When both Pull Back and Levitate are available in Tier 3 the AI prefers Pull Back

    @critical
    Scenario: AI prefers Pull Back over Levitate when both available
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E5" adjacent to a Rock on "E4"
      And the AI Sorcerer is on square "D6" with an eligible Rock on "C4"
      And no Tier 1 or Tier 2 actions are available
      When the AI evaluates Tier 3 options
      Then the AI should choose Pull Back with its Troll
      And the AI should not use Levitate for this move

  # ===================================================================
  # AI TIER 4: APPROACH
  # ===================================================================

  # -------------------------------------------------------------------
  # Troll Approaches Nearest Rock
  # -------------------------------------------------------------------

  Rule: The AI moves its Troll one step closer to the nearest Rock

    @critical
    Scenario: AI Troll moves one step toward the nearest Rock
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "D4"
      And the nearest Rock is on square "D7"
      And square "D5" is empty
      And no Tier 1, Tier 2, or Tier 3 actions are available
      When the AI evaluates its next move
      Then the AI should move its Troll from "D4" to "D5"

    Scenario: AI Troll breaks equidistant Rock tie by alphabetical square key
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E5"
      And Rock A is on square "C5" at distance 2
      And Rock B is on square "G5" at distance 2
      And no Tier 1, Tier 2, or Tier 3 actions are available
      When the AI evaluates its next move
      Then the AI should move its Troll toward Rock A on "C5"
      Because "C5" is alphabetically before "G5"

  # -------------------------------------------------------------------
  # Sorcerer Approaches Nearest Eligible Rock
  # -------------------------------------------------------------------

  Rule: The AI moves its Sorcerer one step closer to the nearest eligible Rock for future levitation

    @critical
    Scenario: AI Sorcerer moves one step toward the nearest eligible Rock
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "F6"
      And the nearest eligible Rock is on square "F3"
      And square "F5" is empty
      And no Tier 1, Tier 2, or Tier 3 actions are available
      And the AI Troll has no valid Tier 4 approach move
      When the AI evaluates its next move
      Then the AI should move its Sorcerer from "F6" to "F5"

    Scenario: AI Sorcerer skips Rock on cooldown when finding nearest eligible
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "F6"
      And Rock A on "F4" was moved during the previous player's turn
      And Rock B on "D6" is eligible for levitation
      And square "E6" is empty
      And no Tier 1, Tier 2, or Tier 3 actions are available
      When the AI evaluates Tier 4 Sorcerer approach
      Then the AI should move its Sorcerer toward Rock B on "D6"
      And the AI should not approach Rock A which is on cooldown

  # ===================================================================
  # AI TIER 5: FALLBACK
  # ===================================================================

  # -------------------------------------------------------------------
  # Any Valid Move in Deterministic Order
  # -------------------------------------------------------------------

  Rule: When no higher tier applies the AI makes any valid move using piece priority Troll then Dwarf then Sorcerer and alphabetical target square order

    @critical
    Scenario: AI fallback moves Troll before Dwarf before Sorcerer
      Given a game in progress where it is the AI player's turn
      And no Tier 1, Tier 2, Tier 3, or Tier 4 actions are available
      And the AI Troll on "E5" can move to "E6" or "D5"
      And the AI Dwarf on "D4" can move to "D5" or "C4"
      And the AI Sorcerer on "F6" can move to "F7" or "G6"
      When the AI evaluates its next move
      Then the AI should move its Troll
      Because Troll has highest fallback priority

    @critical
    Scenario: AI fallback picks alphabetically-first target square for the chosen piece
      Given a game in progress where it is the AI player's turn
      And no Tier 1, Tier 2, Tier 3, or Tier 4 actions are available
      And the AI Troll on "E5" can move to "D5", "E4", "E6", or "F5"
      When the AI evaluates its next move
      Then the AI should move its Troll to "D5"
      Because "D5" is alphabetically first among "D5", "E4", "E6", "F5"

    Scenario: AI fallback uses Dwarf when Troll has no valid move
      Given a game in progress where it is the AI player's turn
      And no Tier 1, Tier 2, Tier 3, or Tier 4 actions are available
      And the AI Troll is surrounded by occupied squares with no valid moves
      And the AI Dwarf on "D4" can move to "C4" or "D3"
      When the AI evaluates its next move
      Then the AI should move its Dwarf to "C4"
      Because Dwarf is next in fallback priority and "C4" is alphabetically first

    Scenario: AI fallback uses Sorcerer when both Troll and Dwarf have no valid moves
      Given a game in progress where it is the AI player's turn
      And no Tier 1, Tier 2, Tier 3, or Tier 4 actions are available
      And the AI Troll and Dwarf are both surrounded with no valid moves
      And the AI Sorcerer on "F6" can move to "F7" or "G6"
      When the AI evaluates its next move
      Then the AI should move its Sorcerer to "F7"
      Because Sorcerer is last in fallback priority and "F7" is alphabetically first

  # ===================================================================
  # MULTI-MOVE AI TURN
  # ===================================================================

  # -------------------------------------------------------------------
  # Re-evaluation After Each Move
  # -------------------------------------------------------------------

  Rule: The AI re-evaluates the priority hierarchy from scratch after each individual move within a turn

    @critical
    Scenario: AI re-evaluates priority after each move in a 3-move turn
      Given a game in progress where it is the AI player's turn
      And the AI player has 3 moves available
      When the AI completes its first move
      Then the AI should re-evaluate all tiers for the second move based on the new board state
      And when the AI completes its second move
      Then the AI should re-evaluate all tiers for the third move based on the updated board state

    @critical
    Scenario: AI uses Tier 4 on move 1 then discovers Tier 1 on move 2
      Given a game in progress where it is the AI player's turn
      And the AI player has 3 moves available
      And the AI Troll is on square "D4"
      And a Rock is on square "D5"
      And an enemy Sorcerer is on square "D8"
      And squares "D6" and "D7" are empty
      And no Tier 1 action is available at the start of the turn (Troll not adjacent to a throw-to-kill Rock)
      When the AI evaluates move 1 and moves its Troll from "D4" to "D5" via Tier 4 approach
      Then the AI Troll lands on the Rock at "D5"
      And the AI must throw the Rock
      And the AI should throw north toward the enemy Sorcerer at "D8"
      And the enemy Sorcerer should be killed
      And the AI's turn should end after move 1 due to throw

    @critical
    Scenario: AI throw on first move ends the turn immediately
      Given a game in progress where it is the AI player's turn
      And the AI player has 3 moves available
      And the AI Troll is on square "E5" with a Rock
      And an enemy Sorcerer is on square "E8" in a clear line north
      When the AI evaluates move 1 and finds a Tier 1 kill opportunity
      Then the AI should throw the Rock north
      And the enemy Sorcerer at "E8" should be killed
      And the AI's turn should end with 2 moves forfeited

    Scenario: AI uses 3 different tiers across 3 moves
      Given a game in progress where it is the AI player's turn
      And the AI player has 3 moves available
      When the AI evaluates and executes move 1 at Tier 2 (defensive escape)
      And the AI evaluates and executes move 2 at Tier 3 (rock positioning)
      And the AI evaluates and executes move 3 at Tier 4 (approach)
      Then all 3 moves should have been executed
      And each move should have been chosen by the highest available tier at that point

  # -------------------------------------------------------------------
  # Troll Lands on Rock Mid-Turn (Mandatory Throw)
  # -------------------------------------------------------------------

  Rule: If the AI Troll lands on a Rock during any move of the turn the mandatory throw rule applies

    Scenario: AI Troll lands on Rock via Tier 4 approach and must throw
      Given a game in progress where it is the AI player's turn
      And the AI player has 3 moves available
      And the AI Troll is on square "E4"
      And a Rock is on square "E5" with no Sorcerer in any throw line
      And no Tier 1, Tier 2, or Tier 3 actions are available
      When the AI moves its Troll from "E4" to "E5" via Tier 4
      Then the AI Troll lands on the Rock at "E5"
      And the AI must choose a throw direction
      And the AI's turn should end after the throw

    Scenario: AI Troll lands on Rock via Tier 5 fallback and must throw
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "D5"
      And a Rock is on square "E5"
      And no Tier 1 through Tier 4 actions are available
      When the AI moves its Troll from "D5" to "E5" via Tier 5 fallback
      Then the AI Troll lands on the Rock at "E5"
      And the AI must throw the Rock
      And the AI's turn should end after the throw

  # ===================================================================
  # AI VS AI GAME
  # ===================================================================

  Rule: A game with all AI players plays to completion automatically

    @critical
    Scenario: All-AI 2-player game plays to completion
      Given a 2-player game with both seats designated as AI
      When the game begins
      Then turns should alternate between the two AI players automatically
      And the game should play until one AI Sorcerer is killed
      And the surviving AI should be declared the winner

    @critical
    Scenario: All-AI 4-player game plays to completion
      Given a 4-player game with all seats designated as AI
      When the game begins
      Then turns should cycle through AI players automatically
      And AI players should be eliminated as their Sorcerers are killed
      And the game should end when only one AI Sorcerer remains

    Scenario: No human interaction possible during fully AI game
      Given a 4-player game with all seats designated as AI
      And the game is in progress
      When a user attempts to interact with the board
      Then the interaction should be rejected
      And all moves should continue to be executed by AI players

  # ===================================================================
  # UI/UX BEHAVIOUR
  # ===================================================================

  Rule: AI seats are visually distinguished and provide feedback during AI turns

    @critical
    Scenario: AI seats are marked in the player status panel
      Given a 4-player game with Red and Yellow as AI
      When the player status panel is displayed
      Then the Red seat should show an "AI" label
      And the Yellow seat should show an "AI" label
      And the Green seat should not show an "AI" label
      And the Blue seat should not show an "AI" label

    Scenario: AI player pieces display thinking animation during AI turn
      Given a 2-player game with Bottom as AI
      When it is the Bottom AI player's turn
      Then the Bottom player's Troll, Dwarf, and Sorcerer should display a thinking animation
      And the thinking animation should stop when the AI turn completes

    Scenario: "AI is thinking" indicator disappears when turn ends
      Given a 2-player game with Bottom as AI
      And the "AI is thinking..." indicator is displayed
      When the Bottom AI player finishes its turn
      Then the "AI is thinking..." indicator should be hidden
      And the board should accept human input again

  # ===================================================================
  # EDGE CASES
  # ===================================================================

  # -------------------------------------------------------------------
  # No Valid Moves for a Piece
  # -------------------------------------------------------------------

  Rule: If a specific piece has no valid moves the AI skips to the next piece but still uses all mandatory moves

    @edge-case
    Scenario: AI skips piece with no valid moves and uses another piece
      Given a game in progress where it is the AI player's turn
      And the AI player has 3 moves available
      And the AI Troll is completely surrounded by occupied squares
      And the AI Dwarf on "D4" has valid moves available
      When the AI evaluates its moves
      Then the AI should skip the Troll for that move
      And the AI should move its Dwarf or Sorcerer instead
      And the AI should still use all 3 moves

  # -------------------------------------------------------------------
  # Throw With All Directions Immediately Blocked
  # -------------------------------------------------------------------

  Rule: If the AI Troll lands on a Rock but all throw directions are immediately blocked the throw still fires and the Rock stays in place

    @edge-case
    Scenario: AI Troll throws Rock that cannot travel in any direction
      Given a game in progress where it is the AI player's turn
      And the AI Troll has landed on square "E5" with a Rock
      And square "E6" is occupied by an obstacle
      And square "E4" is occupied by an obstacle
      And square "D5" is occupied by an obstacle
      And square "F5" is occupied by an obstacle
      When the AI must choose a throw direction
      Then the AI should throw the Rock in the alphabetically-first direction available
      And the Rock should remain on square "E5"
      And the AI's turn should end

  # -------------------------------------------------------------------
  # Levitation Blocked Mid-Path
  # -------------------------------------------------------------------

  Rule: If the AI Sorcerer's levitation target is blocked the AI selects a different Rock or direction

    @edge-case
    Scenario: AI Sorcerer switches Rock when levitation is blocked
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "D6"
      And Rock A on "C6" has a Troll blocking its path northward on "C7"
      And Rock B on "E4" is eligible for levitation with a clear path
      And no Tier 1 or Tier 2 actions are available
      When the AI evaluates Tier 3 levitation
      Then the AI should skip Rock A because levitation is blocked
      And the AI should use Rock B instead

    @edge-case
    Scenario: AI Sorcerer chooses different direction when preferred levitation path is blocked
      Given a game in progress where it is the AI player's turn
      And the AI Sorcerer is on square "E5"
      And a Rock on "D4" is eligible for levitation
      And moving north would place the Rock on a blocked square "D5"
      And moving east would place the Rock on a clear square "E4"
      And square "F5" is empty
      And no Tier 1 or Tier 2 actions are available
      When the AI evaluates Tier 3 levitation directions
      Then the AI should move east instead of north
      And the Sorcerer should be on "F5" and the Rock should be on "E4"

  # -------------------------------------------------------------------
  # AI Troll Forced Throw Without Kill
  # -------------------------------------------------------------------

  Rule: When the AI Troll reaches a Rock through non-kill-path moves the mandatory throw applies even without a target

    @edge-case
    Scenario: AI Troll approaches Rock via Tier 4 and must throw without a Sorcerer in range
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E4"
      And a Rock is on square "E5"
      And no enemy Sorcerer is in any throwing line from "E5"
      And no Tier 1, Tier 2, or Tier 3 actions are available
      When the AI moves its Troll from "E4" to "E5"
      Then the AI Troll lands on the Rock
      And the AI must throw the Rock in a chosen direction
      And the throw should follow tiebreaker rules for direction
      And the AI's turn should end

  # -------------------------------------------------------------------
  # AI Handles Dwarf Push Correctly
  # -------------------------------------------------------------------

  Rule: When the AI moves its Dwarf the standard push rules apply

    @edge-case
    Scenario: AI Dwarf push moves a chain of pieces during fallback
      Given a game in progress where it is the AI player's turn
      And no Tier 1 through Tier 4 actions are available
      And the AI Troll has no valid moves
      And the AI Dwarf is on square "E3"
      And a Rock is on square "E4" and another piece is on square "E5"
      And square "E6" is empty
      When the AI moves its Dwarf north from "E3" to "E4" via Tier 5 fallback
      Then the Dwarf should push the Rock from "E4" to "E5"
      And the piece on "E5" should be pushed to "E6"
      And the pushed Rock should be tracked as moved

  # -------------------------------------------------------------------
  # AI Turn in Elimination Context
  # -------------------------------------------------------------------

  Rule: The AI correctly handles turns when teams are being eliminated

    @edge-case
    Scenario: AI makes kill shot that eliminates a team and game continues
      Given a 4-player game with Green as AI and 3 other players
      And it is the Green AI player's turn
      And the Green AI Troll can throw a Rock to kill the Red Sorcerer
      And Yellow and Blue are still alive
      When the Green AI executes its Tier 1 kill shot
      Then the Red Sorcerer should be killed
      And all Red team pieces should be removed from the board
      And the game should continue with Green, Yellow, and Blue

    @edge-case
    Scenario: AI makes kill shot that wins the game
      Given a 2-player game with Green as AI and Red as Human
      And it is the Green AI player's turn
      And the Green AI Troll can throw a Rock to kill the Red Sorcerer
      When the Green AI executes its Tier 1 kill shot
      Then the Red Sorcerer should be killed
      And the game should end
      And the Green AI should be declared the winner

  # -------------------------------------------------------------------
  # AI Self-Elimination Avoidance
  # -------------------------------------------------------------------

  Rule: The AI should not choose a throw direction that would kill its own Sorcerer when a safe direction exists

    @edge-case
    Scenario: AI avoids throwing Rock toward own Sorcerer when another direction has a kill
      Given a game in progress where it is the AI player's turn
      And the AI Troll is on square "E5" with a Rock
      And the AI Sorcerer is on square "E7" in the north throw line
      And an enemy Sorcerer is on square "C5" in the west throw line
      And square "D5" is empty
      When the AI evaluates throw directions
      Then the AI should throw the Rock west toward "C5"
      And the AI should not throw north toward its own Sorcerer

    @edge-case
    Scenario: AI avoids self-elimination throw when no kill is available
      Given a game in progress where it is the AI player's turn
      And the AI Troll has landed on square "E5" with a Rock via a non-Tier-1 move
      And the AI Sorcerer is on square "E8" in the north throw line
      And no enemy Sorcerer is in any throw line from "E5"
      And squares "E4", "D5", and "F5" provide safe throw directions
      When the AI must choose a throw direction
      Then the AI should not throw north toward its own Sorcerer
      And the AI should throw in a safe direction using alphabetical tiebreaker

  # -------------------------------------------------------------------
  # Deterministic Behaviour Verification
  # -------------------------------------------------------------------

  Rule: Given identical board states the AI always produces the same sequence of moves

    @critical
    Scenario: AI decision is fully deterministic
      Given a specific board state with all piece positions defined
      And it is the AI player's turn
      When the AI evaluates and executes its full turn
      And the board is reset to the same state
      And the AI evaluates and executes its full turn again
      Then the sequence of moves should be identical both times

    Scenario: Deterministic tiebreaker uses alphabetical square key ordering
      Given two equally-ranked move options targeting squares "C5" and "B6"
      When the AI applies the deterministic tiebreaker
      Then the AI should choose the move targeting "B6"
      Because "B6" sorts alphabetically before "C5"
