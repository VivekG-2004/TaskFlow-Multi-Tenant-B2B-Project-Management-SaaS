import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

const columnLabels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
}

const columnColors = {
  TODO: 'text-neutral-400',
  IN_PROGRESS: 'text-blue-400',
  IN_REVIEW: 'text-yellow-400',
  DONE: 'text-emerald-400',
}

const priorityVariant = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'success',
  CRITICAL: 'purple',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [addMemberError, setAddMemberError] = useState('')
  const [addMemberSuccess, setAddMemberSuccess] = useState('')
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
    parentId: null,
  })

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const fetchProject = async () => {
    try {
      const res = await api.get(`/api/projects/${id}`)
      setProject(res.data?.data)
    } catch (err) {
      if (err.response?.status === 401) {
        setError('not_a_member')
      } else {
        setError('Failed to load project.')
      }
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/api/tasks/project/${id}`)
      setTasks(res.data?.data || [])
    } catch {
      setError('Failed to load tasks.')
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await api.get('/api/members')
      setMembers(res.data?.data || [])
    } catch (err) {
      if (err.response?.status !== 403 && err.response?.status !== 401) {
        console.error('Failed to fetch members')
      }
    }
  }

  const handleAddMember = async () => {
    setAddMemberError('')
    setAddMemberSuccess('')
    if (!selectedUserId) {
      setAddMemberError('Please select a member.')
      return
    }
    try {
      setAddingMember(true)
      await api.post(`/api/projects/${id}/members/${selectedUserId}`)
      setAddMemberSuccess('Member added to project successfully.')
      setSelectedUserId('')
    } catch (err) {
      setAddMemberError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to add member.'
      )
    } finally {
      setAddingMember(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
  try {
    setUpdatingStatus(true)

    // optimistic UI update
    setProject((prev) => ({ ...prev, status: newStatus }))

    await api.put(`/api/projects/${id}`, {
      name: project.name || '',
      description: project.description || '',
      startDate: project.startDate
        ? project.startDate.split('T')[0]
        : null,
      dueDate: project.dueDate
        ? project.dueDate.split('T')[0]
        : null,
      status: newStatus,
    })

    setStatusDropdownOpen(false)

    // refresh with correct data
    
  } catch (err) {
    console.error('Status update failed:', err.response?.data)
    fetchProject() // revert UI if failed
  } finally {
    setUpdatingStatus(false)
  }
}

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchProject(), fetchTasks(), fetchMembers()])
      setLoading(false)
    }
    init()
  }, [id])

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest('.status-dropdown')) {
      setStatusDropdownOpen(false)
    }
  }
  if (statusDropdownOpen) {
    document.addEventListener('mousedown', handleClickOutside)
  }
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [statusDropdownOpen])

  const handleCreate = async () => {
    setFormError('')
    if (!form.title) {
      setFormError('Task title is required.')
      return
    }
    try {
      setCreating(true)
      await api.post('/api/tasks', {
        ...form,
        projectId: parseInt(id),
        assigneeId: form.assigneeId ? parseInt(form.assigneeId) : null,
      })
      setModalOpen(false)
      setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '', parentId: null })
      fetchTasks()
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Failed to create task.')
    } finally {
      setCreating(false)
    }
  }

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col)
    return acc
  }, {})

  return (
    <AppLayout title={project?.name || 'Project'}>

      {/* Project header */}
      {project && (
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2
              className="text-2xl font-semibold text-neutral-100"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {project.name}
            </h2>
            {project.description && (
              <p className="text-sm text-neutral-500 mt-1 max-w-xl">{project.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-neutral-600">
                {project.startDate?.split('T')[0]} → {project.dueDate?.split('T')[0]}
              </span>
              {project.isArchived ? (
  <Badge label="ARCHIVED" variant="default" />
) : (role === 'OWNER' || role === 'ADMIN') ? (
  <div className="relative status-dropdown">
    <button
      onClick={(e) => {
              e.stopPropagation()
              setStatusDropdownOpen((prev) => !prev)
            }}
      disabled={updatingStatus}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
        project.status === 'PLANNING' ? 'bg-blue-900/50 text-blue-400 hover:bg-blue-900/70' :
        project.status === 'ACTIVE' ? 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900/70' :
        project.status === 'ON_HOLD' ? 'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900/70' :
        project.status === 'COMPLETED' ? 'bg-purple-900/50 text-purple-400 hover:bg-purple-900/70' :
        'bg-neutral-800 text-neutral-300'
      }`}
    >
      {project.status || 'PLANNING'}
      <span className="text-xs opacity-60">▾</span>
    </button>

    {statusDropdownOpen && (
      <div className="absolute top-full left-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 overflow-hidden min-w-32">
        {['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'].map((s) => (
          <button
            key={s}
            onClick={(e) => {
                  e.stopPropagation()
                  handleStatusUpdate(s)
                }}
            className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-neutral-800 ${
              project.status === s
                ? 'text-neutral-100 font-medium bg-neutral-800'
                : 'text-neutral-400'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>
    )}
  </div>
) : (
  <Badge
    label={project.status || 'PLANNING'}
    variant={
      project.status === 'PLANNING' ? 'info' :
      project.status === 'ACTIVE' ? 'success' :
      project.status === 'ON_HOLD' ? 'warning' :
      project.status === 'COMPLETED' ? 'purple' :
      'default'
    }
  />
)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(role === 'OWNER' || role === 'ADMIN') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setAddMemberOpen(true)
                  setAddMemberError('')
                  setAddMemberSuccess('')
                }}
              >
                + Add member
              </Button>
            )}
            {(role === 'OWNER' || role === 'ADMIN') && !project.isArchived && (
              <Button
                variant="ghost"
                onClick={() => setConfirmArchive(true)}
              >
                Archive
              </Button>
            )}
            <Button onClick={() => setModalOpen(true)}>
              + New task
            </Button>
          </div>
        </div>
      )}

      {/* Error states */}
      {error === 'not_a_member' ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-neutral-300 font-medium mb-2">Access restricted</h3>
          <p className="text-neutral-600 text-sm max-w-sm">
            You are not a member of this project. Contact your project admin to get added.
          </p>
        </div>
      ) : error ? (
        <p className="text-sm text-red-400 mb-6">{error}</p>
      ) : null}

      {/* Task board */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col} className="h-64 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col} className="bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col">

              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                <span className={`text-xs font-semibold uppercase tracking-widest ${columnColors[col]}`}>
                  {columnLabels[col]}
                </span>
                <span className="text-xs text-neutral-600 bg-neutral-800 rounded-full px-2 py-0.5">
                  {tasksByStatus[col].length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-2 p-3 flex-1">
                {tasksByStatus[col].length === 0 && (
                  <p className="text-xs text-neutral-700 text-center py-6">No tasks</p>
                )}
                {tasksByStatus[col].map((task) => (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/projects/${id}/tasks/${task.id}`)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 cursor-pointer hover:border-neutral-600 transition-all group"
                  >
                    <p className="text-sm text-neutral-200 font-medium mb-2 group-hover:text-white transition-colors line-clamp-2">
                      {task.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        label={task.priority}
                        variant={priorityVariant[task.priority] || 'default'}
                      />
                      {task.dueDate && (
                        <span className="text-xs text-neutral-600">
                          {task.dueDate.split('T')[0]}
                        </span>
                      )}
                    </div>
                    {(() => {
                      const assignee = members.find((m) => m.id === task.assigneeId)
                      return assignee ? (
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-neutral-800">
                          <div className="w-4 h-4 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-neutral-400">
                            {assignee.fullName.charAt(0)}
                          </div>
                          <span className="text-xs text-neutral-500">{assignee.fullName}</span>
                        </div>
                      ) : null
                    })()}
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create task modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setFormError('') }}
        title="New Task"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Task Title"
            value={form.title}
            onChange={handleChange('title')}
            placeholder="What needs to be done?"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Optional details..."
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={handleChange('priority')}
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
              value={form.dueDate}
              onChange={handleChange('dueDate')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
              Assignee
            </label>
            <select
              value={form.assigneeId}
              onChange={handleChange('assigneeId')}
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
            <Button
              variant="ghost"
              onClick={() => { setModalOpen(false); setFormError('') }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create task'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Archive confirmation modal */}
      <Modal
        isOpen={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        title="Archive Project"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-neutral-400">
            Are you sure you want to archive{' '}
            <span className="text-neutral-200 font-medium">{project?.name}</span>
            ? It will no longer be accessible until unarchived.
          </p>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="ghost" onClick={() => setConfirmArchive(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await api.put(`/api/projects/${id}/archive`)
                  setConfirmArchive(false)
                  navigate('/dashboard')
                } catch {
                  // handle silently
                }
              }}
            >
              Yes, archive it
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add member to project modal */}
      <Modal
        isOpen={addMemberOpen}
        onClose={() => {
          setAddMemberOpen(false)
          setAddMemberError('')
          setAddMemberSuccess('')
        }}
        title="Add Member to Project"
      >
        <div className="flex flex-col gap-4">
          {addMemberSuccess && (
            <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4">
              <p className="text-sm text-emerald-400">{addMemberSuccess}</p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
              Select Member
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-neutral-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            >
              <option value="">Choose a member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} — {m.role}
                </option>
              ))}
            </select>
          </div>

          {addMemberError && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2">
              {addMemberError}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setAddMemberOpen(false)
                setAddMemberError('')
                setAddMemberSuccess('')
              }}
            >
              Close
            </Button>
            {!addMemberSuccess && (
              <Button onClick={handleAddMember} disabled={addingMember}>
                {addingMember ? 'Adding...' : 'Add to project'}
              </Button>
            )}
          </div>
        </div>
      </Modal>

    </AppLayout>
  )
}