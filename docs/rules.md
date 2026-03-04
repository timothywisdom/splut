# SPLUT! Rules

## Overview

SPLUT! is a strategic board game for 2-4 players. Each player commands a team of three pieces — a **Sorcerer**, a **Troll**, and a **Dwarf** — on a diamond-shaped board scattered with **Rocks**. Eliminate rival Sorcerers by hurling Rocks at them. The last Sorcerer standing wins.

---

## The Board

The board is a **diamond** (rotated square) made of 41 squares on a 9x9 grid. Only squares within Manhattan distance 4 of the center (E5) are playable.

```
          E9
        D8  F8
      C7  D7  E7  F7  G7
    B6  C6  D6  E6  F6  G6  H6
  A5  B5  C5  D5  E5  F5  G5  H5  I5
    B4  C4  D4  E4  F4  G4  H4
      C3  D3  E3  F3  G3
        D2  F2
          E1
```

All movement is **orthogonal** (North, South, East, West). No diagonal movement.

---

## Teams & Starting Positions

Each team has a color and three pieces:

| Seat | Color | Sorcerer | Dwarf | Troll |
|------|-------|----------|-------|-------|
| Top | Green | D8 | E8 | F8 |
| Bottom | Red | F2 | E2 | D2 |
| Left | Yellow | B6 | B5 | B4 |
| Right | Blue | H6 | H5 | H4 |

Four neutral **Rocks** start at the diamond tips: **E9**, **E1**, **A5**, **I5**.

### 2 Players
Players must sit at **opposite** seats (Top/Bottom or Left/Right).

### 3 Players
Any three seats. The fourth seat's corner still has its Rock.

### 4 Players
All four seats occupied.

---

## Turn Structure

Players take turns **clockwise**. Each turn, you get a number of moves:

| Turn # (game-wide) | Moves |
|-----|-------|
| 1st turn | 1 move |
| 2nd turn | 2 moves |
| 3rd turn onward | 3 moves |

**All moves are mandatory** — you cannot pass or skip. Distribute your moves freely among your three pieces in any order.

---

## The Pieces

### Sorcerer — The Leader

The Sorcerer is the most important piece. **If your Sorcerer dies, your entire team is eliminated.**

**Movement:** 1 square orthogonally. Cannot move into any occupied square.

**Levitation:** When moving the Sorcerer, you may simultaneously levitate one Rock anywhere on the board. The Rock moves 1 square in the **same direction** as the Sorcerer.

Levitation rules:
- The Rock's destination must be **empty** (any piece blocks it)
- Once you start levitating a specific Rock, you must keep using that same Rock for the rest of the turn
- If you stop levitating (move another piece, or move the Sorcerer without levitating), you **cannot resume** levitation that turn
- **Cooldown:** You cannot levitate a Rock that was moved by the **previous player** (thrown, levitated, pushed, or pulled)

### Troll — The Heavy Hitter

The Troll is your offensive weapon. It throws Rocks to eliminate enemy Sorcerers.

**Movement:** 1 square orthogonally. Cannot move onto a square occupied by another piece (Sorcerer, Dwarf, or Troll) — **except** Rocks.

**Throwing Rocks:** When the Troll moves onto a Rock's square, it **must** throw the Rock. Pick a direction (N/S/E/W) and the Rock flies in a straight line:

| What the Rock hits | Result |
|---|---|
| Empty square | Flies over, keeps going |
| Board edge | Stops on last valid square |
| Troll or Rock | Stops on square **before** the obstacle |
| **Sorcerer** | **Lands on Sorcerer's square — KILLS the Sorcerer!** |
| Dwarf | Flies over (Dwarves are small!) |

**Throwing immediately ends your turn**, no matter how many moves you had left.

**Pull-back:** After the Troll makes a normal move (not onto a Rock), if there is a Rock directly behind where the Troll came from, you may optionally **drag it** into the Troll's vacated square. This lets you reposition Rocks without throwing them.

### Dwarf — The Pusher

The Dwarf is small but mighty. Thrown Rocks fly right over it — but it can shove anything.

**Movement:** 1 square orthogonally. Can move into occupied squares.

**Push chains:** When the Dwarf moves into an occupied square, it **pushes** all consecutive pieces in that direction. Every piece in the chain shifts 1 square forward. The push fails entirely if the last piece would be pushed off the board.

Dwarves are immune to thrown Rocks... mostly. (See SPLUT! below.)

### Rock — The Weapon

Rocks are neutral — no player owns them. They can only be moved by:
- **Throw** (Troll lands on it)
- **Levitation** (Sorcerer lifts it)
- **Push** (Dwarf shoves it)
- **Pull-back** (Troll drags it)

There are always **4 Rocks** on the board. Rocks are never removed from play.

---

## SPLUT!

The signature move! When a thrown Rock flies over a Dwarf and the **very next square** is blocked (board edge, Troll, or Rock), the Rock **lands on the Dwarf and crushes it**.

```
  Troll throws East →

  [Troll] [    ] [Dwarf] [Rock]
                    ↑
                  SPLUT!
                Rock lands here,
                Dwarf is crushed
```

SPLUT! only kills the Dwarf — it does **not** eliminate the team (the Sorcerer survives).

SPLUT! does **NOT** trigger if the square after the Dwarf is:
- Empty (Rock keeps flying)
- A Sorcerer (Rock flies over Dwarf and kills the Sorcerer instead)

---

## Winning

When a Sorcerer is killed by a thrown Rock, that **entire team is eliminated** — all their pieces are removed from the board.

**The last player with a surviving Sorcerer wins!**

Watch out for friendly fire — you can accidentally kill your own Sorcerer with a poorly aimed throw.

---

## Quick Reference

1. All moves are **mandatory** — use them all
2. Throwing a Rock **ends your turn immediately**
3. Kill a Sorcerer = eliminate the whole team
4. Dwarves push chains of pieces
5. Sorcerers levitate one Rock at a time (same direction they move)
6. Trolls throw Rocks and can pull them back
7. SPLUT! = thrown Rock + Dwarf + obstacle right behind = Dwarf crushed
8. Rocks never leave the board — always 4 in play
