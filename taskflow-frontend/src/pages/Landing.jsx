import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 border-b border-neutral-800">
        <span
          className="text-xl font-semibold text-neutral-100"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          TaskFlow
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="text-sm bg-white text-black px-4 py-2 rounded-md hover:bg-neutral-200 transition-colors font-medium"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-full px-4 py-1.5 text-xs text-neutral-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
          Multi-tenant project management for modern teams
        </div>

        <h1
          className="text-5xl md:text-7xl font-semibold text-neutral-100 leading-tight max-w-4xl mb-6"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Your team's work,
          <br />
          <span className="text-neutral-400">beautifully organized.</span>
        </h1>

        <p className="text-neutral-500 text-lg max-w-xl mb-10 leading-relaxed">
          TaskFlow gives your company a private workspace to plan projects,
          track tasks, and ship faster — without the noise.
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Create your workspace
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors px-6 py-3"
          >
            Sign in →
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-neutral-800 px-10 py-16">
        <p
          className="text-center text-xs text-neutral-600 uppercase tracking-widest mb-12"
        >
          Everything your team needs
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-600 transition-colors"
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="text-sm font-semibold text-neutral-200 mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 px-10 py-6 flex items-center justify-between">
        <span
          className="text-sm text-neutral-600"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          TaskFlow
        </span>
        <p className="text-xs text-neutral-700">
          Built for teams that move fast.
        </p>
      </footer>

    </div>
  )
}

const features = [
  {
    icon: '⬛',
    title: 'Private workspaces',
    description:
      'Every company gets a fully isolated workspace. Your data never touches another tenant.',
  },
  {
    icon: '◈',
    title: 'Project & task tracking',
    description:
      'Organize work into projects, break them into tasks, assign owners, set priorities and due dates.',
  },
  {
    icon: '⬡',
    title: 'Role-based access',
    description:
      'Owners, Admins, and Members each get the right level of access — nothing more, nothing less.',
  },
]