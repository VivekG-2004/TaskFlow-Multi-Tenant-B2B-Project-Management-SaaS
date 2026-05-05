import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '⊞' },
  { label: 'Notifications', path: '/notifications', icon: '🔔' },
]

const adminItems = [
  { label: 'Members', path: '/members', icon: '👥' },
  { label: 'Audit Logs', path: '/audit', icon: '📋' },
]

export default function Sidebar() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-60 min-h-screen bg-neutral-950 border-r border-neutral-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-neutral-800">
        <span className="text-lg font-semibold text-neutral-100" style={{ fontFamily: "'DM Serif Display', serif" }}>
          TaskFlow
        </span>
      </div>

      {/* Tenant info */}
      <div className="px-6 py-4 border-b border-neutral-800">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Workspace</p>
        <p className="text-sm text-neutral-200 font-medium truncate">{user?.tenantSlug || '—'}</p>
        <p className="text-xs text-neutral-500 mt-0.5 truncate">{user?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {/* Admin only */}
        {(role === 'OWNER' || role === 'ADMIN') && (
          <>
            <div className="mt-4 mb-1 px-3">
              <p className="text-xs text-neutral-600 uppercase tracking-widest">Admin</p>
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-300 font-medium">
            {user?.fullName?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-200 truncate">{user?.fullName}</p>
            <p className="text-xs text-neutral-500">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-md transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}