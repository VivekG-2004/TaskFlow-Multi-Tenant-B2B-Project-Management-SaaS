export default function Badge({ label, variant = 'default' }) {
  const variants = {
    default: 'bg-neutral-800 text-neutral-300',
    success: 'bg-emerald-900/50 text-emerald-400',
    warning: 'bg-yellow-900/50 text-yellow-400',
    danger: 'bg-red-900/50 text-red-400',
    info: 'bg-blue-900/50 text-blue-400',
    purple: 'bg-purple-900/50 text-purple-400',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}