export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}) {
  const base = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-white text-black hover:bg-neutral-200',
    ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800 border border-neutral-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    subtle: 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}