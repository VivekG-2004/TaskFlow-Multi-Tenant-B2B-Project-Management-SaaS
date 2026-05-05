import { useNavigate } from 'react-router-dom'

export default function TopBar({ title }) {
  const navigate = useNavigate()

  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm flex items-center px-6 gap-4">
      <button
        onClick={() => navigate(-1)}
        className="text-neutral-500 hover:text-neutral-200 transition-colors text-sm"
      >
        ←
      </button>
      <h1
        className="text-base font-semibold text-neutral-100"
        style={{ fontFamily: "'DM Serif Display', serif" }}
      >
        {title}
      </h1>
    </header>
  )
}