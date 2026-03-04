// ============================================================================
// SPLUT! Root Layout
// Next.js App Router root layout with Dark Fantasy Arcana theme.
// ============================================================================

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SPLUT! - A Game of Trolls, Dwarves & Sorcerers',
  description:
    'A strategic board game where Trolls throw Rocks, Dwarves push, and Sorcerers levitate. Last Sorcerer standing wins!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
