import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import api from '../api/axios'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

export default function Register() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated])

  const [form, setForm] = useState({
    companyName: '',
    fullName: '',
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!form.companyName || !form.fullName || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/api/tenants/register', form)
      const slug = res.data?.data?.tenantSlug || form.companyName.toLowerCase().replace(/\s+/g, '-')
      setSuccess(`Workspace created! Your tenant slug is: "${slug}". Use it to log in.`)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
            One workspace.
            <br />
            Every project.
            <br />
            <span className="text-neutral-500">All your team.</span>
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed max-w-sm">
            Register your company and get a private, isolated workspace
            with full project and task management from day one.
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
              Create your workspace
            </h1>
            <p className="text-sm text-neutral-500">
              Already have one?{' '}
              <Link to="/login" className="text-neutral-300 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Company Name"
              value={form.companyName}
              onChange={handleChange('companyName')}
              placeholder="Acme Inc."
            />
            <Input
              label="Your Full Name"
              value={form.fullName}
              onChange={handleChange('fullName')}
              placeholder="John Doe"
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

          {success && (
            <div className="mt-4 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800 rounded-md px-3 py-2">
              <p className="font-medium mb-1">Registration successful!</p>
              <p>{success}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-2 text-emerald-300 hover:underline text-xs"
              >
                Go to login →
              </button>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6"
          >
            {loading ? 'Creating workspace...' : 'Create workspace'}
          </Button>

          <p className="text-xs text-neutral-700 text-center mt-6">
            By registering, you become the Owner of your workspace.
          </p>
        </div>
      </div>

    </div>
  )
}