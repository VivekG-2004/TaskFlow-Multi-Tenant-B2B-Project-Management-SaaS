import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

const priorityVariant = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'purple',
}

const statusOptions = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

const statusVariant = {
  TODO: 'default',
  IN_PROGRESS: 'info',
  IN_REVIEW: 'warning',
  DONE: 'success',
}

export default function TaskDetail() {
  const { id, taskId } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()

  const [task, setTask] = useState(null)
  const [subtasks, setSubtasks] = useState([])
  const [activities, setActivities] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [subtaskModalOpen, setSubtaskModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
  })

  const [subtaskForm, setSubtaskForm] = useState({
    title: '',
    priority: 'MEDIUM',
  })

  const handleEditChange = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubtaskChange = (field) => (e) => {
    setSubtaskForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [taskRes, subtaskRes, activityRes, memberRes] = await Promise.all([
        api.get(`/api/tasks/project/${id}`),
        api.get(`/api/tasks/${taskId}/subtasks`),
        api.get(`/api/tasks/${taskId}/activities`),
        api.get('/api/members'),
      ])

      const allTasks = taskRes.data?.data || []
      const found = allTasks.find((t) => t.id === parseInt(taskId))
      setTask(found || null)

      if (found) {
        setEditForm({
          title: found.title || '',
          description: found.description || '',
          priority: found.priority || 'MEDIUM',
          dueDate: found.dueDate || '',
          assigneeId: found.assigneeId || '',
        })
      }

      setSubtasks(subtaskRes.data?.data || [])
      setActivities(activityRes.data?.data || [])
      setMembers(memberRes.data?.data || [])
    } catch {
      setError('Failed to load task details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [taskId])

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/api/tasks/${taskId}/status?status=${newStatus}`)
      fetchAll()
    } catch {
      // handle silently
    }
  }

  const handleSaveEdit = async () => {
    setFormError('')
    if (!editForm.title) {
      setFormError('Title is required.')
      return
    }
    try {
      setSaving(true)
      await api.put(`/api/tasks/${taskId}`, {
        ...editForm,
        projectId: parseInt(id),
        assigneeId: editForm.assigneeId ? parseInt(editForm.assigneeId) : null,
      })
      setEditModalOpen(false)
      fetchAll()
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Failed to update task.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateSubtask = async () => {
    setFormError('')
    if (!subtaskForm.title) {
      setFormError('Subtask title is required.')
      return
    }
    try {
      setSaving(true)
      await api.post('/api/tasks', {
        ...subtaskForm,
        projectId: parseInt(id),
        parentId: parseInt(taskId),
      })
      setSubtaskModalOpen(false)
      setSubtaskForm({ title: '', priority: 'MEDIUM' })
      fetchAll()
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Failed to create subtask.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return
    try {
      await api.delete(`/api/tasks/${taskId}`)
      navigate(`/projects/${id}`)
    } catch {
      // handle silently
    }
  }

  if (loading) {
    return (
      <AppLayout title="Task">
        <div className="flex flex-col gap-4 max-w-3xl">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </AppLayout>
    )
  }

  if (!task) {
    return (
      <AppLayout title="Task">
        <p className="text-neutral-500">Task not found.</p>
      </AppLayout>
    )
  }

  const statusActive = {
  TODO: 'bg-neutral-600 text-neutral-100 cursor-default',
  IN_PROGRESS: 'bg-blue-600 text-white cursor-default',
  IN_REVIEW: 'bg-yellow-600 text-white cursor-default',
  DONE: 'bg-emerald-600 text-white cursor-default',
}

const statusInactive = {
  TODO: 'bg-neutral-800/60 text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300',
  IN_PROGRESS: 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/60 hover:text-blue-300',
  IN_REVIEW: 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/60 hover:text-yellow-300',
  DONE: 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/60 hover:text-emerald-300',
}

  return (
    <AppLayout title={task.title}>
      <div className="max-w-3xl mx-auto">

        {error && (
          <p className="text-sm text-red-400 mb-4">{error}</p>
        )}

        {/* Task header */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2
              className="text-xl font-semibold text-neutral-100"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {task.title}
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="subtle" onClick={() => setEditModalOpen(true)}>
                Edit
              </Button>
              {(role === 'OWNER' || role === 'ADMIN') && (
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-neutral-400 leading-relaxed mb-5">
              {task.description}
            </p>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-800">
            <div>
              <p className="text-xs text-neutral-600 uppercase tracking-widest mb-1">Status</p>
              <Badge label={task.status} variant={statusVariant[task.status]} />
            </div>
            <div>
              <p className="text-xs text-neutral-600 uppercase tracking-widest mb-1">Priority</p>
              <Badge label={task.priority} variant={priorityVariant[task.priority]} />
            </div>
            <div>
              <p className="text-xs text-neutral-600 uppercase tracking-widest mb-1">Due Date</p>
              <p className="text-sm text-neutral-300">{task.dueDate ? task.dueDate.split('T')[0] : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-600 uppercase tracking-widest mb-1">Assignee</p>
              <p className="text-sm text-neutral-300">
              {(() => {
                  const assignee = members.find((m) => m.id === task.assigneeId)
                  return assignee ? assignee.fullName : 'Unassigned'
              })()}
              </p>
            </div>
          </div>
        </div>

        {/* Status change */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Move to</p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={task.status === s}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    task.status === s
                    ? statusActive[s]
                    : statusInactive[s]
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Subtasks */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">
              Subtasks ({subtasks.length})
            </p>
            <Button variant="subtle" onClick={() => setSubtaskModalOpen(true)}>
              + Add subtask
            </Button>
          </div>

          {subtasks.length === 0 ? (
            <p className="text-xs text-neutral-700 py-4 text-center">No subtasks yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/projects/${id}/tasks/${sub.id}`)}
                  className="flex items-center justify-between px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer hover:border-neutral-600 transition-colors"
                >
                  <span className="text-sm text-neutral-300">{sub.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge label={sub.priority} variant={priorityVariant[sub.priority]} />
                    <Badge label={sub.status} variant={statusVariant[sub.status]} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">
            Activity ({activities.length})
          </p>

          {activities.length === 0 ? (
            <p className="text-xs text-neutral-700 py-4 text-center">No activity yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 shrink-0 mt-0.5">
                    {act.userName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm text-neutral-300">
                      <span className="font-medium">{act.userName}</span>{' '}
                      <span className="text-neutral-500">{act.action}</span>
                    </p>
                    <p className="text-xs text-neutral-600 mt-0.5">
  {act.timestamp ? new Date(act.timestamp).toLocaleString() : ''}
</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Edit task modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setFormError('') }}
        title="Edit Task"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            value={editForm.title}
            onChange={handleEditChange('title')}
          />
          <Input
            label="Description"
            value={editForm.description}
            onChange={handleEditChange('description')}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
                Priority
              </label>
              <select
                value={editForm.priority}
                onChange={handleEditChange('priority')}
                className="bg-neutral-900 border border-neutral-700 text-neutral-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <Input
              label="Due Date"
              type="date"
              value={editForm.dueDate}
              onChange={handleEditChange('dueDate')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
              Assignee
            </label>
            <select
              value={editForm.assigneeId}
              onChange={handleEditChange('assigneeId')}
              className="bg-neutral-900 border border-neutral-700 text-neutral-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.fullName}</option>
              ))}
            </select>
          </div>

          {formError && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="ghost" onClick={() => { setEditModalOpen(false); setFormError('') }}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Subtask modal */}
      <Modal
        isOpen={subtaskModalOpen}
        onClose={() => { setSubtaskModalOpen(false); setFormError('') }}
        title="Add Subtask"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Subtask Title"
            value={subtaskForm.title}
            onChange={handleSubtaskChange('title')}
            placeholder="What needs to be done?"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
              Priority
            </label>
            <select
              value={subtaskForm.priority}
              onChange={handleSubtaskChange('priority')}
              className="bg-neutral-900 border border-neutral-700 text-neutral-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {formError && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="ghost" onClick={() => { setSubtaskModalOpen(false); setFormError('') }}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubtask} disabled={saving}>
              {saving ? 'Adding...' : 'Add subtask'}
            </Button>
          </div>
        </div>
      </Modal>

    </AppLayout>
  )
}