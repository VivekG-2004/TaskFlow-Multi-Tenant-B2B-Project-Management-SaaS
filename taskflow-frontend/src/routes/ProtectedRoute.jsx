import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, role } = useAuth()

  if (!token) return <Navigate to="/" replace />

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />
  }

  return children
}