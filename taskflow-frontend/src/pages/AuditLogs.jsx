import { useState, useEffect } from 'react'
import api from '../api/axios'
import AppLayout from '../components/layout/AppLayout'
import Badge from '../components/ui/Badge'

const ENTITY_TYPES = ['ALL', 'PROJECT', 'TASK', 'MEMBER', 'NOTIFICATION']

const entityVariant = {
  PROJECT: 'info',
  TASK: 'warning',
  MEMBER: 'purple',
  NOTIFICATION: 'default',
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [entityFilter, setEntityFilter] = useState('ALL')
  const [userFilter, setUserFilter] = useState('ALL')

  const fetchMembers = async () => {
    try {
      const res = await api.get('/api/members')
      setMembers(res.data?.data || [])
    } catch {
      // non critical
    }
  }

  const fetchLogs = async () => {
    try {
      setLoading(true)
      let res

      if (userFilter !== 'ALL') {
        res = await api.get(`/api/audit/user/${userFilter}`)
      } else if (entityFilter !== 'ALL') {
        res = await api.get(`/api/audit/entity/${entityFilter}`)
      } else {
        res = await api.get('/api/audit')
      }

      setLogs(res.data?.data || [])
    } catch {
      setError('Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [entityFilter, userFilter])

  const handleEntityFilter = (type) => {
    setEntityFilter(type)
    setUserFilter('ALL')
  }

  const handleUserFilter = (e) => {
    setUserFilter(e.target.value)
    setEntityFilter('ALL')
  }

  return (
    <AppLayout title="Audit Logs">

      {/* Header */}
      <div className="mb-8">
        <h2
          className="text-2xl font-semibold text-neutral-100"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Audit Logs
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Full history of all actions taken in this workspace
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">

        {/* Entity type tabs */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
          {ENTITY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleEntityFilter(type)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                entityFilter === type && userFilter === 'ALL'
                  ? 'bg-neutral-700 text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* User filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-600 uppercase tracking-widest">
            User
          </label>
          <select
            value={userFilter}
            onChange={handleUserFilter}
            className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-neutral-600"
          >
            <option value="ALL">All users</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Result count */}
        <span className="text-xs text-neutral-600 ml-auto">
          {logs.length} result{logs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-400 mb-6">{error}</p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-neutral-300 font-medium mb-2">No logs found</h3>
          <p className="text-neutral-600 text-sm">
            Try changing the filters or check back later.
          </p>
        </div>
      )}

      {/* Logs table */}
      {!loading && logs.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">

          {/* Table header */}
          <div className="grid grid-cols-12 px-5 py-3 border-b border-neutral-800">
            <span className="col-span-2 text-xs text-neutral-600 uppercase tracking-widest">
              Entity
            </span>
            <span className="col-span-3 text-xs text-neutral-600 uppercase tracking-widest">
              Action
            </span>
            <span className="col-span-3 text-xs text-neutral-600 uppercase tracking-widest">
              Performed By
            </span>
            <span className="col-span-2 text-xs text-neutral-600 uppercase tracking-widest">
              Entity ID
            </span>
            <span className="col-span-2 text-xs text-neutral-600 uppercase tracking-widest text-right">
              Time
            </span>
          </div>

          {/* Rows */}
          {logs.map((log, i) => (
            <div
              key={log.id || i}
              className="grid grid-cols-12 px-5 py-4 border-b border-neutral-800 last:border-0 items-center hover:bg-neutral-800/30 transition-colors"
            >
              {/* Entity type */}
              <div className="col-span-2">
                <Badge
                  label={log.entityType || '—'}
                  variant={entityVariant[log.entityType] || 'default'}
                />
              </div>

              {/* Action */}
              <div className="col-span-3">
                <p className="text-sm text-neutral-300 font-medium">
                  {log.action || '—'}
                </p>
              </div>

              {/* Performed by */}
<div className="col-span-3 flex items-center gap-2">
  {(() => {
    const member = members.find((m) => m.id === log.userId)
    const name = member?.fullName || `User #${log.userId}`
    return (
      <>
        <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 shrink-0">
          {name.charAt(0)}
        </div>
        <span className="text-sm text-neutral-400 truncate">
          {name}
        </span>
      </>
    )
  })()}
</div>

              {/* Entity ID */}
              <div className="col-span-2">
                <span className="text-xs text-neutral-600 font-mono">
                  #{log.entityId || '—'}
                </span>
              </div>

              {/* Timestamp */}
              <div className="col-span-2 text-right">
                <span className="text-xs text-neutral-600">
                  {log.timestamp || log.createdAt || '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </AppLayout>
  )
}