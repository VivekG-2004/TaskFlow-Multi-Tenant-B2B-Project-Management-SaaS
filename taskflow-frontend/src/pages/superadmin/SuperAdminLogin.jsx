import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) {
      setError('Both fields are required.')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/api/super-admin/login', form)
      const data = res.data?.data

      login(
        {
          email: data.email,
          fullName: data.fullName || 'Super Admin',
          role: 'SUPER_ADMIN',
          type: 'SUPER_ADMIN',
        },
        data.token
      )

      navigate('/super-admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <span
            className="text-2xl font-semibold text-neutral-100"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            TaskFlow
          </span>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-full px-3 py-1 mx-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-xs text-neutral-500">Super Admin Access</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <h1
            className="text-xl font-semibold text-neutral-100 mb-1"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Admin sign in
          </h1>
          <p className="text-sm text-neutral-600 mb-6">
            Restricted access. Authorized personnel only.
          </p>

          <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="admin@taskflow.com"
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
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-neutral-700 hover:text-neutral-500 transition-colors"
          >
            ← Back to tenant login
          </button>
        </div>

      </div>
    </div>
  )
}