import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiry = payload.exp * 1000
    return Date.now() > expiry
  } catch {
    return true
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  // On every app load, check if stored token is expired
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken && isTokenExpired(storedToken)) {
      logout()
    }
  }, [])

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', jwtToken)
    console.log('Login stored:', { userData, jwtToken })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.clear()
  }

  const isAuthenticated = !!token && !isTokenExpired(token)
  const isSuperAdmin = user?.type === 'SUPER_ADMIN'
  const role = user?.role || null

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isSuperAdmin, role }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}