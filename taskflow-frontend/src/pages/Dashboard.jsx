import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

const priorityVariant = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'success',
}

const statusVariant = {
  ACTIVE: 'success',
  ARCHIVED: 'default',
}

export default function Dashboard() {
  const { role } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmArchive, setConfirmArchive] = useState(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
  })

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/projects')
      setProjects(res.data?.data || [])
    } catch (err) {
      setError('Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreate = async () => {
  setFormError('')
  if (!form.name || !form.startDate || !form.dueDate) {
    setFormError('Name, start date and due date are required.')
    return
  }

  try {
    setCreating(true)
    await api.post('/api/projects', form)
    setModalOpen(false)
    setForm({ name: '', description: '', startDate: '', dueDate: '' })
    fetchProjects()
  } catch (err) {
    if (err.response?.status === 403) {
      setFormError('You have reached the free plan limit of 3 projects. Upgrade to Pro for unlimited projects.')
    } else {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Failed to create project.')
    }
  } finally {
    setCreating(false)
  }
}

  const handleArchive = async (id) => {
  try {
    await api.put(`/api/projects/${id}/archive`)
    setConfirmArchive(null)
    fetchProjects()
  } catch {
    // handle silently
  }
}

const handleUnarchive = async (id) => {
  try {
    await api.put(`/api/projects/${id}/unarchive`)
    fetchProjects()
  } catch {
    // handle silently
  }
}

  return (
    <AppLayout title="Dashboard">

      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-2xl font-semibold text-neutral-100"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Projects
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
          </p>
        </div>
        {(role === 'OWNER' || role === 'ADMIN') && (
          <Button onClick={() => setModalOpen(true)}>
            + New project
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 mb-6">{error}</p>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">◈</div>
          <h3 className="text-neutral-300 font-medium mb-2">No projects yet</h3>
          <p className="text-neutral-600 text-sm mb-6">
            Create your first project to get started.
          </p>
          {(role === 'OWNER' || role === 'ADMIN') && (
            <Button onClick={() => setModalOpen(true)}>
              + New project
            </Button>
          )}
        </div>
      )}

      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
  <div
  key={project.id}
  onClick={() => !project.isArchived && navigate(`/projects/${project.id}`)}
  className={`bg-neutral-900 border rounded-xl p-5 transition-all group flex flex-col ${
    project.isArchived
      ? 'border-neutral-800 opacity-40 cursor-not-allowed'
      : 'border-neutral-800 cursor-pointer hover:border-neutral-600'
  }`}
>
    <div className="flex items-start justify-between mb-3">
      <h3 className={`text-sm font-semibold transition-colors ${
        project.isArchived
          ? 'text-neutral-500'
          : 'text-neutral-100 group-hover:text-white'
      }`}>
        {project.name}
      </h3>
      <Badge
  label={project.isArchived ? 'ARCHIVED' : project.status || 'PLANNING'}
  variant={
    project.isArchived ? 'default' :
    project.status === 'PLANNING' ? 'info' :
    project.status === 'ACTIVE' ? 'success' :
    project.status === 'ON_HOLD' ? 'warning' :
    project.status === 'COMPLETED' ? 'purple' :
    'default'
  }
/>
    </div>

    {project.description && (
      <p className="text-xs text-neutral-500 mb-4 line-clamp-2 leading-relaxed">
        {project.description}
      </p>
    )}

    <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-800">
      <span className="text-xs text-neutral-600">
        {project.startDate} → {project.dueDate}
      </span>

      {/* Archive / Unarchive button */}
      {(role === 'OWNER' || role === 'ADMIN') && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (project.isArchived) {
              handleUnarchive(project.id)
            } else {
              setConfirmArchive(project)
            }
          }}
          className={`text-xs font-medium transition-colors ${
            project.isArchived
            ? 'text-emerald-600 hover:text-emerald-400'
            : 'text-neutral-600 hover:text-yellow-400'
            }`}
        >
          {project.isArchived ? 'Unarchive' : 'Archive'}
        </button>
      )}
    </div>
  </div>
))}
</div>

      {/* Create project modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setFormError('') }}
        title="New Project"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Project Name"
            value={form.name}
            onChange={handleChange('name')}
            placeholder="e.g. Website Redesign"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
            placeholder="What is this project about?"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={handleChange('startDate')}
            />
            <Input
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={handleChange('dueDate')}
            />
          </div>

          {formError && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2">
              {formError}
            </p>
          )}

          <div className="flex flex-col gap-3 mt-2">
  {projects.filter(p => !p.isArchived).length >= 3 && (
    <p className="text-xs text-yellow-600 bg-yellow-900/20 border border-yellow-800 rounded-md px-3 py-2">
      ⚠ You are on the free plan which allows a maximum of 3 active projects.
    </p>
  )}
  <div className="flex justify-end gap-3">
    <Button
      variant="ghost"
      onClick={() => { setModalOpen(false); setFormError('') }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleCreate}
      disabled={creating || projects.filter(p => !p.isArchived).length >= 3}
    >
      {creating ? 'Creating...' : 'Create project'}
    </Button>
  </div>
</div>
        </div>
      </Modal>

      {/* Archive confirmation modal */}
<Modal
  isOpen={!!confirmArchive}
  onClose={() => setConfirmArchive(null)}
  title="Archive Project"
>
  <div className="flex flex-col gap-4">
    <p className="text-sm text-neutral-400">
      Are you sure you want to archive{' '}
      <span className="text-neutral-200 font-medium">
        {confirmArchive?.name}
      </span>
      ? It will no longer be accessible until unarchived.
    </p>
    <div className="flex justify-end gap-3 mt-2">
      <Button variant="ghost" onClick={() => setConfirmArchive(null)}>
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={() => handleArchive(confirmArchive.id)}
      >
        Yes, archive it
      </Button>
    </div>
  </div>
</Modal>

    </AppLayout>
  )
}