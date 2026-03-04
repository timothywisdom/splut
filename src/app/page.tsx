// ============================================================================
// SPLUT! Root Page
// Thin wrapper that loads the entire app client-side only (no SSR).
// ============================================================================

'use client'

import dynamic from 'next/dynamic'

const Home = dynamic(() => import('@/components/Home'), { ssr: false })

export default function Page() {
  return <Home />
}
