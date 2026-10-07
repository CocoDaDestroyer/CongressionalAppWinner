import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'sm'

// Primary buttons are ink and turn teal on hover, lifting off an offset shadow like a stamped tag.
const LIFT =
  'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-ink)] active:translate-0 active:shadow-none'

const VARIANTS: Record<Variant, string> = {
  primary: `border-[1.5px] border-ink bg-ink text-paper hover:border-teal hover:bg-teal hover:text-on-teal ${LIFT}`,
  secondary: `border-[1.5px] border-ink bg-transparent text-ink hover:bg-paper-raised ${LIFT}`,
  ghost: 'text-ink-muted hover:bg-paper-sunken hover:text-ink',
  danger: `border-[1.5px] border-brick bg-transparent text-brick hover:bg-paper-raised ${LIFT}`,
}

const SIZES: Record<Size, string> = {
  md: 'h-12 px-5 text-[15px] gap-2',
  sm: 'h-9 px-3 text-sm gap-1.5',
}

function buttonClass(variant: Variant, size: Size, extra: string): string {
  return [
    'inline-flex shrink-0 items-center justify-center rounded-control font-semibold',
    'transition-[background-color,color,translate,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    extra,
  ].join(' ')
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant
  size?: Size
  icon?: ReactNode
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  )
}
