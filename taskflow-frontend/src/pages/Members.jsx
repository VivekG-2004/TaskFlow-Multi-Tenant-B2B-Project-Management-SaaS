import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

const roleVariant = {
  OWNER: 'purple',
  ADMIN: 'info',
  MEMBER: 'default',
}

const roles = ['MEMBER', 'ADMIN']

export default function Members() {
  const { role, user } = useAuth()

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(null)

  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    role: 'MEMBER',
  })

  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [newRole, setNewRole] = useState('MEMBER')
  const [changingRole, setChangingRole] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleInviteChange = (field) => (e) => {
    setInviteForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/members')
      setMembers(res.data?.data || [])
    } catch {
      setError('Failed to load members.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleInvite = async () => {
    setInviteError('')
    setInviteSuccess(null)

    if (!inviteForm.fullName || !inviteForm.email) {
      setInviteError('Full name and email are required.')
      return
    }

    try {
      setInviting(true)
      const res = await api.post('/api/members/invite', inviteForm)
      const data = res.data?.data
      setInviteSuccess({
  fullName: data?.fullName || inviteForm.fullName,
  email: data?.email || inviteForm.email,
  password: data?.tempPassword || null,
})
      setInviteForm({ fullName: '', email: '', role: 'MEMBER' })
      fetchMembers()
    } catch (err) {
      setInviteError(err.response?.data?.error || err.response?.data?.message || 'Failed to invite member.')
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async () => {
    if (!selectedMember) return
    try {
      setChangingRole(true)
      await api.put(`/api/members/${selectedMember.id}/role?role=${newRole}`)
      setRoleModalOpen(false)
      setSelectedMember(null)
      fetchMembers()
    } catch {
      // handle silently
    } finally {
      setChangingRole(false)
    }
  }

  const handleRemove = async (memberId) => {
    if (!window.confirm('Remove this member from the workspace?')) return
    try {
      await api.delete(`/api/members/${memberId}`)
      fetchMembers()
    } catch {
      // handle silently
    }
  }

  const openRoleModal = (member) => {
    setSelectedMember(member)
    setNewRole(member.role)
    setRoleModalOpen(true)
  }

  return (
    <AppLayout title="Members">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-2xl font-semibold text-neutral-100"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Team Members
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''} in this workspace
          </p>
        </div>
        {role === 'OWNER' && (
          <Button onClick={() => { setInviteOpen(true); setInviteSuccess(null) }}>
            + Invite member
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400 mb-6">{error}</p>
      )}

      {/* Members table */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">

          {/* Table header */}
          <div className="grid grid-cols-12 px-5 py-3 border-b border-neutral-800">
            <span className="col-span-4 text-xs text-neutral-600 uppercase tracking-widest">Member</span>
            <span className="col-span-3 text-xs text-neutral-600 uppercase tracking-widest">Email</span>
            <span className="col-span-2 text-xs text-neutral-600 uppercase tracking-widest">Role</span>
            <span className="col-span-3 text-xs text-neutral-600 uppercase tracking-widest text-right">Actions</span>
          </div>

          {/* Rows */}
          {members.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-neutral-600 text-sm">No members found.</p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-12 px-5 py-4 border-b border-neutral-800 last:border-0 items-center hover:bg-neutral-800/30 transition-colors"
              >
                {/* Name + avatar */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-sm text-neutral-300 font-medium shrink-0">
                    {member.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm text-neutral-200 font-medium">{member.fullName}</p>
                    {member.email === user?.email && (
                      <p className="text-xs text-neutral-600">You</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="col-span-3">
                  <p className="text-sm text-neutral-500 truncate">{member.email}</p>
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <Badge label={member.role} variant={roleVariant[member.role] || 'default'} />
                </div>

                {/* Actions */}
                <div className="col-span-3 flex items-center justify-end gap-2">
                  {/* Only owner can change roles, and not their own */}
                  {role === 'OWNER' && member.role !== 'OWNER' && (
                    <Button
                      variant="ghost"
                      onClick={() => openRoleModal(member)}
                    >
                      Change role
                    </Button>
                  )}
                  {/* Owner can remove non-owners, admin can remove members */}
                  {(role === 'OWNER' && member.role !== 'OWNER') ||
                  (role === 'ADMIN' && member.role === 'MEMBER') ? (
                    <Button
                      variant="danger"
                      onClick={() => handleRemove(member.id)}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Invite modal */}
      <Modal
        isOpen={inviteOpen}
        onClose={() => { setInviteOpen(false); setInviteSuccess(null); setInviteError('') }}
        title="Invite Member"
      >
        {inviteSuccess ? (
          <div className="flex flex-col gap-4">
            <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4">
              <p className="text-sm font-medium text-emerald-400 mb-1">Member added successfully</p>
              <p className="text-sm text-neutral-400">
                <span className="text-neutral-200">{inviteSuccess.fullName}</span> has been added to the workspace.
              </p>
            </div>

            <div className="bg-neutral-800 rounded-lg p-4 flex flex-col gap-2">
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Share these credentials</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Email</span>
                <span className="text-sm text-neutral-200 font-mono">{inviteSuccess.email}</span>
              </div>
              {inviteSuccess.password && (
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-neutral-500">Temp password</span>
                    <div className="relative">
                    <span className="block text-sm text-neutral-200 font-mono break-all bg-neutral-900 px-2 py-1.5 pr-16 rounded">
                        {inviteSuccess.password}
                    </span>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(inviteSuccess.password)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-100 transition-colors"
                        >
                        {copied ? '✓ Copied' : 'Copy'}
                    </button>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                    ⚠ This password won't be shown again. Copy it before closing.
                </p>
            </div>
            )}
            </div>

            <p className="text-xs text-neutral-600">
              Share these credentials with the member manually. They can change their password after logging in.
            </p>

            <div className="flex justify-end">
              <Button onClick={() => { setInviteOpen(false); setInviteSuccess(null) }}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Input
              label="Full Name"
              value={inviteForm.fullName}
              onChange={handleInviteChange('fullName')}
              placeholder="Jane Doe"
            />
            <Input
              label="Email"
              type="email"
              value={inviteForm.email}
              onChange={handleInviteChange('email')}
              placeholder="jane@company.com"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
                Role
              </label>
              <select
                value={inviteForm.role}
                onChange={handleInviteChange('role')}
                className="bg-neutral-900 border border-neutral-700 text-neutral-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {inviteError && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-3 py-2">
                {inviteError}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <Button variant="ghost" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={inviting}>
                {inviting ? 'Adding...' : 'Add member'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Change role modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Change Role"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-neutral-400">
            Changing role for{' '}
            <span className="text-neutral-200 font-medium">{selectedMember?.fullName}</span>
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
              New Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-neutral-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="ghost" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={changingRole}>
              {changingRole ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

    </AppLayout>
  )
}