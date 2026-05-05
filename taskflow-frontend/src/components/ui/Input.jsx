export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder-neutral-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-400 transition-colors"
      />
    </div>
  )
}