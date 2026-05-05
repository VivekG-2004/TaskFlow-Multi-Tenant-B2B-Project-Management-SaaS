import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SuperAdminRoute({ children }) {
  const { isAuthenticated, isSuperAdmin } = useAuth()

  if (!isAuthenticated || !isSuperAdmin) {
    return <Navigate to="/super-admin/login" replace />
  }

  return children
}