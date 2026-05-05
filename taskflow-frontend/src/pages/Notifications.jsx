import { useState, useEffect } from 'react'
import api from '../api/axios'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL') // ALL | UNREAD

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const endpoint =
        filter === 'UNREAD'
          ? '/api/notifications/unread'
          : '/api/notifications'
      const res = await api.get(endpoint)
      setNotifications(res.data?.data || [])
    } catch {
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`)
      fetchNotifications()
    } catch {
      // handle silently
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all')
      fetchNotifications()
    } catch {
      // handle silently
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <AppLayout title="Notifications">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-2xl font-semibold text-neutral-100"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Notifications
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit">
        {['ALL', 'UNREAD'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === tab
                ? 'bg-neutral-700 text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-400 mb-6">{error}</p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-neutral-300 font-medium mb-2">
            {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-neutral-600 text-sm">
            {filter === 'UNREAD'
              ? 'Switch to All to see your full history.'
              : 'Activity in your workspace will appear here.'}
          </p>
        </div>
      )}

      {/* Notifications list */}
      {!loading && notifications.length > 0 && (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-4 px-5 py-4 rounded-xl border transition-colors ${
                n.isRead
                  ? 'bg-neutral-900 border-neutral-800'
                  : 'bg-neutral-900 border-neutral-700 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  {!n.isRead ? (
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-neutral-700" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium mb-0.5 ${n.isRead ? 'text-neutral-400' : 'text-neutral-200'}`}>
                        {n.title}
                    </p>
                    <p className={`text-sm leading-relaxed ${n.isRead ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {n.body}
                    </p>
                    {n.createdAt && (
                    <p className="text-xs text-neutral-600 mt-1">{n.createdAt}</p>
                )}
                </div>
              </div>

              {/* Mark as read */}
              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs text-neutral-600 hover:text-neutral-300 transition-colors shrink-0 mt-1"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </AppLayout>
  )
}