@ui @help
Feature: Help / Rules Modal
  As a player
  I want to view the game rules from both the lobby and during gameplay
  So that I can learn or review how to play SPLUT! without losing my game state

  # ===================================================================
  # Entry Points
  # ===================================================================

  # -------------------------------------------------------------------
  # Lobby Help Button
  # -------------------------------------------------------------------

  Rule: The lobby screen shows a "How to Play" link below the setup card

    @critical
    Scenario: "How to Play" link is visible on the lobby screen
      Given the player is on the lobby screen
      Then a "How to Play" button should be visible below the stone tablet card
      And it should be centered horizontally
      And it should appear as an underlined text link, not a filled button

    Scenario: "How to Play" link has correct visual styling
      Given the player is on the lobby screen
      Then the "How to Play" link should use bone color text
      And the underline should use rune-gold at reduced opacity
      And the link should have a pointer cursor

    Scenario: "How to Play" link hover state
      Given the player is on the lobby screen
      When the player hovers over the "How to Play" link
      Then the text color should transition to parchment
      And the underline opacity should increase to full rune-gold

    Scenario: "How to Play" link is keyboard-focusable
      Given the player is on the lobby screen
      When the player tabs to the "How to Play" link
      Then the link should display the standard focus-ring style

  # -------------------------------------------------------------------
  # In-Game Help Button
  # -------------------------------------------------------------------

  Rule: The game screen shows a "Rules" button in the top-right corner

    @critical
    Scenario: "Rules" button is visible during gameplay
      Given a game is in progress
      Then a "Rules" button should be visible in the top-right corner of the screen
      And the button should contain a question-mark icon and the text "Rules"

    Scenario: In-game "Rules" button is positioned near the lobby back button
      Given a game is in progress
      Then the "Rules" button should be fixed at the top-right of the viewport
      And the "Lobby" back button should be fixed at the top-left of the viewport
      And neither button should overlap the turn banner or game board

    Scenario: In-game "Rules" button has correct visual styling
      Given a game is in progress
      Then the "Rules" button should use ash color text by default
      And the question-mark icon should be enclosed in a small circle

    Scenario: In-game "Rules" button hover state
      Given a game is in progress
      When the player hovers over the "Rules" button
      Then the button text and icon should transition to bone color

    Scenario: In-game "Rules" button meets minimum touch target size
      Given a game is in progress
      Then the "Rules" button clickable area should be at least 44x44 pixels

  # ===================================================================
  # Opening the Help Modal
  # ===================================================================

  # -------------------------------------------------------------------
  # Opening from Lobby
  # -------------------------------------------------------------------

  Rule: Clicking "How to Play" on the lobby opens the help modal

    @critical
    Scenario: Opening help modal from the lobby
      Given the player is on the lobby screen
      When the player clicks the "How to Play" link
      Then the help modal should open
      And the modal title should read "RULES OF SPLUT!"
      And the Overview tab should be selected by default

    Scenario: Lobby setup state is preserved when opening help
      Given the player is on the lobby screen
      And the player has selected 3 players and configured seat assignments
      When the player clicks the "How to Play" link
      Then the help modal should open
      When the player closes the help modal
      Then the lobby should still show 3 players selected
      And the seat assignments should be unchanged

  # -------------------------------------------------------------------
  # Opening from Game Screen
  # -------------------------------------------------------------------

  Rule: Clicking "Rules" during gameplay opens the help modal

    @critical
    Scenario: Opening help modal from the game screen
      Given a game is in progress
      When the player clicks the "Rules" button
      Then the help modal should open
      And the modal title should read "RULES OF SPLUT!"
      And the Overview tab should be selected by default

    @critical
    Scenario: Game state is fully preserved when opening help during gameplay
      Given a game is in progress
      And it is the Green player's turn with 2 moves remaining
      And the Green Troll is on square "E5"
      When the player clicks the "Rules" button
      Then the help modal should open over the game board
      When the player closes the help modal
      Then it should still be the Green player's turn
      And the Green player should still have 2 moves remaining
      And the Green Troll should still be on square "E5"

    Scenario: Game timers and state do not change while help modal is open
      Given a game is in progress
      When the player opens the help modal
      Then no game actions should be processable while the modal is open
      And clicking on the game board behind the modal should have no effect

  # ===================================================================
  # Modal Shell
  # ===================================================================

  # -------------------------------------------------------------------
  # Modal Appearance
  # -------------------------------------------------------------------

  Rule: The help modal displays as a near-full-screen overlay with the game visible behind it

    @critical
    Scenario: Help modal displays with backdrop overlay
      Given the help modal is open
      Then a semi-transparent backdrop should cover the entire viewport
      And the backdrop should have a blur effect
      And the modal container should be centered on screen

    Scenario: Help modal container has correct dimensions
      Given the help modal is open on a desktop-sized viewport
      Then the modal should have a maximum width of 720 pixels
      And the modal should have a maximum height of 85vh or 800 pixels, whichever is smaller
      And the modal should have rounded corners and a subtle gold border

    Scenario: Help modal header displays title and subtitle
      Given the help modal is open
      Then the header should display "RULES OF SPLUT!" in Cinzel font with rune-gold-bright color
      And the subtitle "A Game of Trolls, Dwarves & Sorcerers" should appear below in italic
      And a decorative diamond ornament should appear above the title

    Scenario: Help modal close button is visible
      Given the help modal is open
      Then an X close button should be visible in the top-right corner of the modal
      And the close button should have an aria-label of "Close rules"

  # -------------------------------------------------------------------
  # Modal Open/Close Animation
  # -------------------------------------------------------------------

  Rule: The help modal opens and closes with smooth animations

    Scenario: Help modal open animation
      Given the player triggers the help modal to open
      Then the backdrop should fade in
      And the modal container should scale from 95% to 100% while fading in

    Scenario: Help modal close animation
      Given the help modal is open
      When the player closes the help modal
      Then the modal container should scale down slightly while fading out
      And the backdrop should fade out simultaneously

    Scenario: Animations respect reduced motion preference
      Given the user's system has "prefers-reduced-motion: reduce" enabled
      When the player opens the help modal
      Then all modal animations should complete near-instantly

  # ===================================================================
  # Closing the Help Modal
  # ===================================================================

  Rule: The help modal can be closed via the close button, Escape key, or backdrop click

    @critical
    Scenario: Closing help modal with the close button
      Given the help modal is open
      When the player clicks the X close button
      Then the help modal should close
      And focus should return to the element that triggered the modal

    @critical
    Scenario: Closing help modal with the Escape key
      Given the help modal is open
      When the player presses the Escape key
      Then the help modal should close
      And focus should return to the element that triggered the modal

    @critical
    Scenario: Closing help modal by clicking the backdrop
      Given the help modal is open
      When the player clicks on the backdrop area outside the modal container
      Then the help modal should close

    Scenario: Clicking inside the modal content does not close it
      Given the help modal is open
      When the player clicks on the modal content area
      Then the help modal should remain open

  # ===================================================================
  # Tab Navigation
  # ===================================================================

  # -------------------------------------------------------------------
  # Tab Presence and Structure
  # -------------------------------------------------------------------

  Rule: The help modal contains exactly 6 navigable section tabs

    @critical
    Scenario: All six section tabs are present
      Given the help modal is open
      Then the tab bar should display exactly 6 tabs in this order:
        | Tab Label  |
        | Overview   |
        | Board      |
        | Pieces     |
        | SPLUT!     |
        | Winning    |
        | Quick Ref  |

    Scenario: Tab bar is sticky below the header
      Given the help modal is open
      And the content area is scrolled down
      Then the tab bar should remain visible and pinned below the header
      And the content should scroll beneath the tab bar

  # -------------------------------------------------------------------
  # Tab Click Navigation
  # -------------------------------------------------------------------

  Rule: Clicking a tab switches the displayed content to that section

    @critical
    Scenario Outline: Clicking a tab shows that section's content
      Given the help modal is open
      When the player clicks the "<tab>" tab
      Then the "<tab>" tab should appear as the active/selected tab
      And the content area should display the "<tab>" section content
      And all other tabs should appear in their default inactive style

      Examples:
        | tab        |
        | Overview   |
        | Board      |
        | Pieces     |
        | SPLUT!     |
        | Winning    |
        | Quick Ref  |

    Scenario: Tab content switch is instantaneous with no animation
      Given the help modal is open with the Overview tab selected
      When the player clicks the Pieces tab
      Then the Pieces content should appear immediately
      And there should be no slide or fade transition between sections

    Scenario: Active tab visual indicator
      Given the help modal is open
      When the player clicks a tab
      Then the active tab should display rune-gold-bright text color
      And the active tab should have a 2-pixel rune-gold bottom border
      And inactive tabs should display ash text color with no bottom border

  # -------------------------------------------------------------------
  # Tab Keyboard Navigation
  # -------------------------------------------------------------------

  Rule: Arrow keys navigate between tabs when a tab is focused

    @critical
    Scenario: Right arrow key moves focus to the next tab
      Given the help modal is open
      And the Overview tab has keyboard focus
      When the player presses the Right Arrow key
      Then focus should move to the Board tab

    @critical
    Scenario: Left arrow key moves focus to the previous tab
      Given the help modal is open
      And the Board tab has keyboard focus
      When the player presses the Left Arrow key
      Then focus should move to the Overview tab

    Scenario: Right arrow key wraps from last tab to first tab
      Given the help modal is open
      And the Quick Ref tab has keyboard focus
      When the player presses the Right Arrow key
      Then focus should wrap around to the Overview tab

    Scenario: Left arrow key wraps from first tab to last tab
      Given the help modal is open
      And the Overview tab has keyboard focus
      When the player presses the Left Arrow key
      Then focus should wrap around to the Quick Ref tab

    Scenario: Home key moves focus to the first tab
      Given the help modal is open
      And the Winning tab has keyboard focus
      When the player presses the Home key
      Then focus should move to the Overview tab

    Scenario: End key moves focus to the last tab
      Given the help modal is open
      And the Overview tab has keyboard focus
      When the player presses the End key
      Then focus should move to the Quick Ref tab

    Scenario: Enter or Space activates the focused tab
      Given the help modal is open
      And the Pieces tab has keyboard focus but is not the active tab
      When the player presses Enter
      Then the Pieces tab should become the active tab
      And the Pieces section content should be displayed

  # ===================================================================
  # Tab Content
  # ===================================================================

  # -------------------------------------------------------------------
  # Overview Tab Content
  # -------------------------------------------------------------------

  Rule: The Overview tab displays the game introduction and turn structure

    @critical
    Scenario: Overview tab contains the game introduction paragraph
      Given the help modal is open with the Overview tab selected
      Then the content should include a paragraph describing SPLUT! as a strategic board game
      And the paragraph should mention Sorcerer, Troll, Dwarf, and Rock pieces
      And piece names should be accompanied by their inline icons

    @critical
    Scenario: Overview tab contains the turn structure table
      Given the help modal is open with the Overview tab selected
      Then the content should include a "Turn Structure" subsection
      And the turn table should show 1 move for the 1st turn
      And the turn table should show 2 moves for the 2nd turn
      And the turn table should show 3 moves for the 3rd turn onward
      And move counts should be rendered as visual pips (filled/empty circles)

    Scenario: Overview tab displays the "all moves are mandatory" callout
      Given the help modal is open with the Overview tab selected
      Then a callout box should display the text "All moves are mandatory"
      And the callout should have a rune-gold left border

  # -------------------------------------------------------------------
  # Board Tab Content
  # -------------------------------------------------------------------

  Rule: The Board tab displays the board diagram, team positions, and player count variants

    @critical
    Scenario: Board tab contains a styled board diagram
      Given the help modal is open with the Board tab selected
      Then the content should display a visual board diagram
      And the diagram should show a diamond-shaped grid of 41 valid squares
      And each valid square should display its coordinate label
      And invalid squares outside the diamond should not be visible

    Scenario: Board diagram shows starting positions
      Given the help modal is open with the Board tab selected
      Then the board diagram should indicate starting positions for all four teams
      And Rock starting positions at E9, E1, A5, and I5 should be marked
      And a color legend should appear below the diagram

    @critical
    Scenario: Board tab contains team cards for all four teams
      Given the help modal is open with the Board tab selected
      Then four team cards should be displayed in a grid layout
      And each card should show the team color, team name, and seat position
      And each card should list the Sorcerer, Dwarf, and Troll with their starting coordinates

    Scenario: Board tab contains player count variant information
      Given the help modal is open with the Board tab selected
      Then the content should describe the 2-player setup (opposite seats)
      And the content should describe the 3-player setup (any three seats)
      And the content should describe the 4-player setup (all seats)

  # -------------------------------------------------------------------
  # Pieces Tab Content
  # -------------------------------------------------------------------

  Rule: The Pieces tab describes all four piece types with their abilities

    @critical
    Scenario: Pieces tab contains sections for all four piece types
      Given the help modal is open with the Pieces tab selected
      Then the content should have subsections for Sorcerer, Troll, Dwarf, and Rock
      And each subsection should have a heading with the piece icon and name
      And subsections should be separated by dividers

    Scenario: Sorcerer subsection describes movement and levitation
      Given the help modal is open with the Pieces tab selected
      Then the Sorcerer subsection should describe 1-square orthogonal movement
      And the Sorcerer subsection should explain the levitation ability
      And the levitation rules should appear in a callout with a purple left border
      And the cooldown rule should appear in a warning callout with an orange left border

    Scenario: Troll subsection describes movement, throwing, and pull-back
      Given the help modal is open with the Pieces tab selected
      Then the Troll subsection should describe 1-square orthogonal movement
      And the Troll subsection should explain mandatory throwing when landing on a Rock
      And a throw outcome table should list what happens when a Rock hits each obstacle type
      And the pull-back ability should be described in a callout box

    Scenario: Dwarf subsection describes movement and push chains
      Given the help modal is open with the Pieces tab selected
      Then the Dwarf subsection should describe 1-square orthogonal movement into occupied squares
      And the Dwarf subsection should explain push chain mechanics
      And a note should reference the SPLUT! section for the Dwarf's vulnerability

    Scenario: Rock subsection describes the four movement methods
      Given the help modal is open with the Pieces tab selected
      Then the Rock subsection should list Throw, Levitation, Push, and Pull-back as movement methods
      And each method should display its associated piece icon inline
      And a callout should note that there are always 4 Rocks on the board

  # -------------------------------------------------------------------
  # SPLUT! Tab Content
  # -------------------------------------------------------------------

  Rule: The SPLUT! tab explains the signature mechanic with a dramatic visual treatment

    @critical
    Scenario: SPLUT! tab displays the mechanic explanation
      Given the help modal is open with the "SPLUT!" tab selected
      Then the content should display "SPLUT!" as a large dramatic title in red with a glow effect
      And the content should explain that a thrown Rock crushes a Dwarf when the next square is blocked
      And the content should clarify that SPLUT! kills only the Dwarf, not the team

    @critical
    Scenario: SPLUT! tab contains the throw diagram
      Given the help modal is open with the "SPLUT!" tab selected
      Then a styled diagram should show four squares in a row
      And the first square should contain a Troll icon
      And the third square should contain a Dwarf icon with a red highlight
      And the fourth square should contain a Rock icon
      And a "SPLUT!" label should appear below the Dwarf's square

    Scenario: SPLUT! tab lists conditions that do NOT trigger SPLUT!
      Given the help modal is open with the "SPLUT!" tab selected
      Then the content should list what does NOT trigger SPLUT!
      And it should state that an empty square after the Dwarf means the Rock keeps flying
      And it should state that a Sorcerer after the Dwarf means the Rock kills the Sorcerer instead

  # -------------------------------------------------------------------
  # Winning Tab Content
  # -------------------------------------------------------------------

  Rule: The Winning tab explains elimination and victory conditions

    @critical
    Scenario: Winning tab explains Sorcerer death and team elimination
      Given the help modal is open with the Winning tab selected
      Then the content should explain that killing a Sorcerer eliminates the entire team

    Scenario: Winning tab highlights the victory condition
      Given the help modal is open with the Winning tab selected
      Then the text "The last player with a surviving Sorcerer wins!" should be displayed prominently
      And it should use Cinzel font with rune-gold-bright color and centered alignment

    Scenario: Winning tab includes a friendly fire warning
      Given the help modal is open with the Winning tab selected
      Then a warning callout should note that players can accidentally kill their own Sorcerer
      And the callout should have an orange left border

  # -------------------------------------------------------------------
  # Quick Reference Tab Content
  # -------------------------------------------------------------------

  Rule: The Quick Reference tab provides a numbered summary of the 8 key rules

    @critical
    Scenario: Quick Reference tab lists all 8 rules
      Given the help modal is open with the Quick Ref tab selected
      Then the content should display a numbered list of exactly 8 rules
      And each number should appear inside a styled circular marker
      And the rules should cover: mandatory moves, throw ends turn, Sorcerer kill, Dwarf push, Sorcerer levitation, Troll throw and pull, SPLUT! definition, and Rocks never leave the board

    Scenario Outline: Quick Reference rule <number> is present
      Given the help modal is open with the Quick Ref tab selected
      Then rule number <number> should contain the text "<key_phrase>"

      Examples:
        | number | key_phrase                   |
        | 1      | mandatory                    |
        | 2      | ends your turn               |
        | 3      | eliminate the whole team      |
        | 4      | push chains                  |
        | 5      | levitate                     |
        | 6      | throw                        |
        | 7      | SPLUT!                       |
        | 8      | always 4                     |

  # ===================================================================
  # Content Scrolling
  # ===================================================================

  Rule: The content area scrolls independently when content exceeds the visible area

    Scenario: Long content sections are scrollable
      Given the help modal is open with the Pieces tab selected
      Then the content area should be vertically scrollable
      And the tab bar and header should remain fixed above the scroll area

    Scenario: Content scroll position resets when switching tabs
      Given the help modal is open with the Pieces tab selected
      And the player has scrolled to the bottom of the Pieces content
      When the player clicks the Overview tab
      Then the content area should be scrolled to the top

  # ===================================================================
  # Responsive Behavior
  # ===================================================================

  # -------------------------------------------------------------------
  # Mobile Layout
  # -------------------------------------------------------------------

  Rule: The help modal adapts to mobile viewports

    @critical
    Scenario: Modal fills mobile viewport with appropriate margins
      Given the player is on a mobile-sized viewport (less than 640px wide)
      And the help modal is open
      Then the modal should span the full width minus 16px margins on each side
      And the modal should use reduced content padding

    Scenario: Tab bar is horizontally scrollable on mobile
      Given the player is on a mobile-sized viewport
      And the help modal is open
      Then the tab bar should be horizontally scrollable
      And the scrollbar should be hidden
      And all 6 tabs should remain accessible by scrolling

    Scenario: Board diagram scales down on mobile
      Given the player is on a mobile-sized viewport
      And the help modal is open with the Board tab selected
      Then the board diagram grid cells should be smaller than on desktop
      And coordinate labels should use a smaller font size

    Scenario: Team cards stack vertically on mobile
      Given the player is on a mobile-sized viewport
      And the help modal is open with the Board tab selected
      Then the four team cards should stack in a single column
      And each card should span the full content width

  # -------------------------------------------------------------------
  # Landscape Mobile
  # -------------------------------------------------------------------

  Rule: The help modal adapts to landscape orientation on small screens

    @edge-case
    Scenario: Modal header is compacted in landscape on short viewports
      Given the player is on a viewport with height less than 500px
      And the help modal is open
      Then the modal subtitle should be hidden
      And the decorative ornament above the title should be hidden
      And the title font size should be reduced
      And the tab bar should remain visible

  # ===================================================================
  # Accessibility
  # ===================================================================

  # -------------------------------------------------------------------
  # ARIA Attributes
  # -------------------------------------------------------------------

  Rule: The help modal has correct ARIA attributes for screen readers

    @critical
    Scenario: Modal container has dialog role and aria attributes
      Given the help modal is open
      Then the modal container should have role "dialog"
      And the modal container should have aria-modal set to "true"
      And the modal container should have aria-labelledby referencing the modal title

    @critical
    Scenario: Tab bar has correct ARIA tab roles
      Given the help modal is open
      Then the tab bar should have role "tablist" with aria-label "Rules sections"
      And each tab should have role "tab"
      And the active tab should have aria-selected set to "true"
      And inactive tabs should have aria-selected set to "false"
      And each tab should have an aria-controls attribute referencing its content panel

    Scenario: Content panels have correct ARIA tabpanel role
      Given the help modal is open
      Then the visible content panel should have role "tabpanel"
      And the content panel should have an aria-labelledby attribute referencing its tab

    Scenario: Close button has accessible label
      Given the help modal is open
      Then the close button should have aria-label "Close rules"

  # -------------------------------------------------------------------
  # Focus Management
  # -------------------------------------------------------------------

  Rule: Focus is trapped within the modal and managed correctly

    @critical
    Scenario: Focus moves into the modal when it opens
      Given the player is on the lobby screen
      When the player clicks the "How to Play" link
      Then focus should move to an element inside the help modal

    @critical
    Scenario: Focus is trapped within the modal
      Given the help modal is open
      When the player presses Tab repeatedly
      Then focus should cycle through the close button, tabs, and content
      And focus should never escape to elements behind the modal

    @critical
    Scenario: Focus returns to trigger element on close
      Given the player is on the lobby screen
      And the player opens the help modal via the "How to Play" link
      When the player closes the help modal
      Then focus should return to the "How to Play" link

    Scenario: Focus returns to in-game trigger on close
      Given a game is in progress
      And the player opens the help modal via the "Rules" button
      When the player closes the help modal
      Then focus should return to the "Rules" button

  # -------------------------------------------------------------------
  # Contrast and Readability
  # -------------------------------------------------------------------

  Rule: Text within the modal meets WCAG AA contrast requirements

    Scenario: Body text meets AA contrast ratio on modal background
      Given the help modal is open
      Then bone-colored body text on the slate-stone background should meet WCAG AA 4.5:1 contrast ratio
      And parchment-colored headings on the slate-stone background should meet WCAG AA contrast ratio
      And rune-gold section headings on the slate-stone background should meet WCAG AA contrast ratio

    Scenario: Ash color is used only for non-essential or large text
      Given the help modal is open
      Then ash-colored text should only appear on decorative elements, coordinate labels, or large text
      And ash-colored text should not be used for primary reading content

  # ===================================================================
  # Edge Cases
  # ===================================================================

  Rule: The help modal handles unusual interaction patterns gracefully

    @edge-case
    Scenario: Rapidly opening and closing the modal does not cause errors
      Given the player is on the lobby screen
      When the player rapidly clicks "How to Play" and then immediately presses Escape
      Then the modal should close cleanly without visual artifacts or console errors

    @edge-case
    Scenario: Opening help during a pending throw does not disrupt throw state
      Given a game is in progress
      And a Troll has landed on a Rock and the throw direction picker is showing
      When the player clicks the "Rules" button
      Then the help modal should open
      When the player closes the help modal
      Then the throw direction picker should still be visible
      And the player should still be able to choose a throw direction

    @edge-case
    Scenario: Opening help during a pull-back prompt does not disrupt pull-back state
      Given a game is in progress
      And the player is being prompted for a pull-back confirmation
      When the player clicks the "Rules" button
      Then the help modal should open
      When the player closes the help modal
      Then the pull-back prompt should still be visible
      And the player should still be able to confirm or decline the pull-back

    @edge-case
    Scenario: Help modal is not available when the game-over overlay is showing
      Given a game has ended and the game-over overlay is displayed
      Then the "Rules" button should not be visible or should be non-interactive

    @edge-case
    Scenario: The modal defaults to the Overview tab each time it opens
      Given the player previously opened the help modal and navigated to the Quick Ref tab
      And the player closed the help modal
      When the player opens the help modal again
      Then the Overview tab should be selected by default
