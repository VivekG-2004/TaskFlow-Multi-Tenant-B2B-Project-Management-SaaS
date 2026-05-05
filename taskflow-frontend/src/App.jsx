import { Routes, Route, useNavigate } from 'react-router-dom'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import TaskDetail from './pages/TaskDetail'
import Members from './pages/Members'
import Notifications from './pages/Notifications'
import AuditLogs from './pages/AuditLogs'
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard'

import ProtectedRoute from './routes/ProtectedRoute'
import SuperAdminRoute from './routes/SuperAdminRoute'


function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-center px-6">
      <p className="text-6xl font-semibold text-neutral-800 mb-4"
        style={{ fontFamily: "'DM Serif Display', serif" }}>
        404
      </p>
      <h1 className="text-xl text-neutral-300 font-medium mb-2">Page not found</h1>
      <p className="text-sm text-neutral-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
      >
        ← Back to home
      </button>
    </div>
  )
}

function AccessDenied() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-center px-6">
      <p className="text-6xl font-semibold text-neutral-800 mb-4"
        style={{ fontFamily: "'DM Serif Display', serif" }}>
        403
      </p>
      <h1 className="text-xl text-neutral-300 font-medium mb-2">Access denied</h1>
      <p className="text-sm text-neutral-600 mb-8">
        You don't have permission to view this page.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
      >
        ← Back to dashboard
      </button>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/403" element={<AccessDenied />} />

      {/* Tenant protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/projects/:id" element={
        <ProtectedRoute><ProjectDetail /></ProtectedRoute>
      } />
      <Route path="/projects/:id/tasks/:taskId" element={
        <ProtectedRoute><TaskDetail /></ProtectedRoute>
      } />
      <Route path="/members" element={
        <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
          <Members />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute><Notifications /></ProtectedRoute>
      } />
      <Route path="/audit" element={
        <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
          <AuditLogs />
        </ProtectedRoute>
      } />

      {/* Super admin */}
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      <Route path="/super-admin/dashboard" element={
        <SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}