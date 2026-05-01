import React from 'react'
import { Link } from 'react-router-dom'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  to?: string
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const variants = {
  primary:   'bg-burgundy hover:bg-burgundy-700 text-offwhite border border-burgundy',
  secondary: 'bg-transparent hover:bg-burgundy hover:text-offwhite text-burgundy border border-burgundy',
  ghost:     'bg-transparent hover:bg-burgundy/5 text-burgundy border border-transparent',
  gold:      'bg-gold hover:bg-gold-300 text-burgundy border border-gold'
}
const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm'
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  children,
  className = '',
  fullWidth = false,
  type = 'button',
  disabled = false
}) => {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-button transition-all duration-300 ease-luxe ${
    variants[variant]
  } ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`

  if (to) return <Link to={to} className={cls}>{children}</Link>
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>
}

export default Button
