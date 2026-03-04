// ============================================================================
// SPLUT! Styled Table
// Reusable table component for rules content.
// ============================================================================

'use client'

import { ReactNode } from 'react'

interface RulesTableProps {
  headers: string[]
  rows: ReactNode[][]
}

export default function RulesTable({ headers, rows }: RulesTableProps) {
  return (
    <div
      className="w-full rounded-lg overflow-hidden my-4"
      style={{ border: '1px solid var(--carved-stone)' }}
    >
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ background: 'var(--carved-stone)' }}>
            {headers.map((header, i) => (
              <th
                key={i}
                className="text-left text-parchment"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '10px 16px',
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="transition-colors duration-150"
              style={{
                background:
                  rowIdx % 2 === 0
                    ? 'var(--slate-stone)'
                    : 'rgba(42, 42, 62, 0.3)',
                borderTop: rowIdx > 0 ? '1px solid rgba(42, 42, 62, 0.4)' : undefined,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(42, 42, 62, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  rowIdx % 2 === 0
                    ? 'var(--slate-stone)'
                    : 'rgba(42, 42, 62, 0.3)'
              }}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="text-bone"
                  style={{
                    fontSize: '13px',
                    fontWeight: 400,
                    padding: '10px 16px',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
