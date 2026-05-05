import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const statCards = (stats) => [
  { label: 'Total Tenants', value: stats?.totalTenants ?? '—' },
  { label: 'Active Tenants', value: stats?.activeTenants ?? '—' },
  { label: 'Suspended Tenants', value: stats?.suspendedTenants ?? '—' },
  { label: 'Free Plan', value: stats?.freePlanTenants ?? '—' },
  { label: 'Pro Plan', value: stats?.proPlanTenants ?? '—' },
]

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [tenants, setTenants] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [tenantsRes, statsRes] = await Promise.all([
        api.get('/api/super-admin/tenants'),
        api.get('/api/super-admin/stats'),
      ])
      setTenants(tenantsRes.data?.data || [])
      setStats(statsRes.data?.data || null)
    } catch {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this tenant?')) return
    try {
      await api.put(`/api/super-admin/tenants/${id}/suspend`)
      fetchAll()
    } catch {
      // handle silently
    }
  }

  const handleReactivate = async (id) => {
    try {
      await api.put(`/api/super-admin/tenants/${id}/reactivate`)
      fetchAll()
    } catch {
      // handle silently
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/super-admin/login')
  }

  const filtered = tenants.filter(
    (t) =>
      t.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      t.slug?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">

      {/* Top nav */}
      <header className="border-b border-neutral-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="text-lg font-semibold text-neutral-100"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            TaskFlow
          </span>
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-xs text-neutral-500">Super Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-600 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 px-8 py-8 max-w-7xl mx-auto w-full">

        {/* Page title */}
        <div className="mb-8">
          <h1
            className="text-2xl font-semibold text-neutral-100"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Platform Overview
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage all tenants and monitor platform health
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400 mb-6">{error}</p>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {statCards(stats).map((card) => (
            <div
              key={card.label}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4"
            >
              <p className="text-xs text-neutral-600 uppercase tracking-widest mb-2">
                {card.label}
              </p>
              <p
                className="text-3xl font-semibold text-neutral-100"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tenants section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-widest">
            All Tenants
          </h2>
          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or slug..."
            className="bg-neutral-900 border border-neutral-800 text-neutral-300 placeholder-neutral-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-neutral-600 w-64"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">⬡</div>
            <h3 className="text-neutral-300 font-medium mb-2">No tenants found</h3>
            <p className="text-neutral-600 text-sm">
              {search ? 'Try a different search term.' : 'No companies have registered yet.'}
            </p>
          </div>
        )}

        {/* Tenants table */}
        {!loading && filtered.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">

            {/* Header */}
            <div className="grid grid-cols-12 px-5 py-3 border-b border-neutral-800">
              <span className="col-span-3 text-xs text-neutral-600 uppercase tracking-widest">Company</span>
              <span className="col-span-2 text-xs text-neutral-600 uppercase tracking-widest">Slug</span>
              <span className="col-span-2 text-xs text-neutral-600 uppercase tracking-widest">Plan</span>
              <span className="col-span-2 text-xs text-neutral-600 uppercase tracking-widest">Status</span>
              <span className="col-span-3 text-xs text-neutral-600 uppercase tracking-widest text-right">Actions</span>
            </div>

            {/* Rows */}
            {filtered.map((tenant) => (
              <div
                key={tenant.id}
                className="grid grid-cols-12 px-5 py-4 border-b border-neutral-800 last:border-0 items-center hover:bg-neutral-800/30 transition-colors"
              >
                {/* Company */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm text-neutral-300 font-medium shrink-0">
                    {tenant.companyName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm text-neutral-200 font-medium">
                      {tenant.companyName}
                    </p>
                    <p className="text-xs text-neutral-600">{tenant.ownerEmail}</p>
                  </div>
                </div>

                {/* Slug */}
                <div className="col-span-2">
                  <span className="text-xs text-neutral-500 font-mono bg-neutral-800 px-2 py-1 rounded">
                    {tenant.slug}
                  </span>
                </div>

                {/* Plan */}
                <div className="col-span-2">
                  <Badge
                    label={tenant.plan || 'FREE'}
                    variant={tenant.plan === 'PRO' ? 'success' : 'default'}
                  />
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <Badge
                    label={tenant.status || 'ACTIVE'}
                    variant={
                      tenant.status === 'SUSPENDED'
                        ? 'danger'
                        : tenant.status === 'ACTIVE'
                        ? 'success'
                        : 'default'
                    }
                  />
                </div>

                {/* Actions */}
                <div className="col-span-3 flex items-center justify-end gap-2">
                  {tenant.status === 'ACTIVE' || !tenant.status ? (
                    <Button
                      variant="danger"
                      onClick={() => handleSuspend(tenant.id)}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      variant="subtle"
                      onClick={() => handleReactivate(tenant.id)}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}