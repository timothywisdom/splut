// ============================================================================
// SPLUT! Button Component
// Styled button variants for the Dark Fantasy Arcana theme.
// ============================================================================

'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-150 rounded-lg cursor-pointer select-none focus-ring'

  const sizeClasses = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-12 px-6 text-sm',
    lg: 'h-[52px] px-8 text-sm',
  }

  const variantClasses = {
    primary: disabled
      ? 'bg-ash text-carved-stone cursor-not-allowed'
      : 'text-obsidian shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_16px_rgba(212,168,83,0.3)] active:scale-[0.98] active:shadow-[0_1px_4px_rgba(0,0,0,0.3)]',
    secondary: disabled
      ? 'bg-carved-stone text-ash cursor-not-allowed border border-ash/20'
      : 'bg-carved-stone text-parchment border border-ash/30 hover:bg-worn-stone hover:border-rune-gold/50 active:scale-[0.98]',
    ghost: disabled
      ? 'text-ash cursor-not-allowed'
      : 'text-bone hover:text-parchment hover:bg-worn-stone/30 active:scale-[0.98]',
  }

  // Primary button uses inline gradient style for 135deg diagonal
  const primaryStyle = variant === 'primary' && !disabled
    ? { background: 'linear-gradient(135deg, var(--rune-gold), #B8922E)' }
    : undefined

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      style={primaryStyle}
      {...props}
    >
      {children}
    </button>
  )
}
