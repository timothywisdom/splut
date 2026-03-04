// ============================================================================
// SPLUT! Help Content
// Renders the active section's content in a scrollable area.
// ============================================================================

'use client'

import { useRef, useEffect } from 'react'
import type { HelpSection } from './HelpTabs'
import OverviewSection from './sections/OverviewSection'
import BoardSection from './sections/BoardSection'
import PiecesSection from './sections/PiecesSection'
import SplatSection from './sections/SplatSection'
import WinningSection from './sections/WinningSection'
import QuickRefSection from './sections/QuickRefSection'

interface HelpContentProps {
  activeSection: HelpSection
}

function SectionContent({ section }: { section: HelpSection }) {
  switch (section) {
    case 'overview':
      return <OverviewSection />
    case 'board':
      return <BoardSection />
    case 'pieces':
      return <PiecesSection />
    case 'splut':
      return <SplatSection />
    case 'winning':
      return <WinningSection />
    case 'quick-ref':
      return <QuickRefSection />
  }
}

export default function HelpContent({ activeSection }: HelpContentProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset scroll position when switching tabs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [activeSection])

  return (
    <div
      ref={scrollRef}
      role="tabpanel"
      id={`help-panel-${activeSection}`}
      aria-labelledby={`help-tab-${activeSection}`}
      className="flex-1 min-h-0 overflow-y-auto help-content-scroll"
      style={{ padding: '24px', scrollPaddingTop: '8px' }}
    >
      <SectionContent section={activeSection} />
    </div>
  )
}
