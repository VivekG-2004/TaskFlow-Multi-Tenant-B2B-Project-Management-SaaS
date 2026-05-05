import { useState } from 'react'
import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  const navigate = useNavigate()

  const { login, isAuthenticated, isSuperAdmin } = useAuth()

    useEffect(() => {
    if (isAuthenticated) {
        navigate(isSuperAdmin ? '/super-admin/dashboard' : '/dashboard')
    }
    }, [isAuthenticated])

  const [form, setForm] = useState({
    email: '',
    password: '',
    tenantSlug: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async () => {
    setError('')

    if (!form.email || !form.password || !form.tenantSlug) {
      setError('All fields are required.')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/api/auth/login', form)
      const data = res.data?.data

      login(
        {
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          tenantSlug: data.tenantSlug,
          type: 'TENANT',
        },
        data.token
      )

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex">

      {/* Left panel */}
      <div className="hidden md:flex w-1/2 border-r border-neutral-800 flex-col justify-between p-12">
        <span
          className="text-xl font-semibold text-neutral-100"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          TaskFlow
        </span>
        <div>
          <h2
            className="text-4xl font-semibold text-neutral-200 leading-snug mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Welcome back.
            <br />
            <span className="text-neutral-500">Your team is waiting.</span>
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed max-w-sm">
            Sign in to your workspace and pick up right where you left off.
            Everything is exactly as you left it.
          </p>
        </div>
        <p className="text-xs text-neutral-700">© 2026 TaskFlow</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1
              className="text-2xl font-semibold text-neutral-100 mb-1"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Sign in to your workspace
            </h1>
            <p className="text-sm text-neutral-500">
              New to TaskFlow?{' '}
              <Link to="/register" className="text-neutral-300 hover:underline">
                Create a workspace
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
            <Input
              label="Workspace Slug"
              value={form.tenantSlug}
              onChange={handleChange('tenantSlug')}
              placeholder="acme-inc"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@company.com"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
            <Link
              to="/super-admin/login"
              className="text-xs text-neutral-700 hover:text-neutral-500 transition-colors"
            >
              Super admin access →
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}