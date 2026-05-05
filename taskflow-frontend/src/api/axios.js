import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)



// Handle 401 and 403 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const errorMsg = error.response?.data?.error || error.response?.data?.message
    const url = error.config?.url

    const isLoginEndpoint =
      url?.includes('/api/auth/login') ||
      url?.includes('/api/super-admin/login')

    if (status === 401 && !isLoginEndpoint && errorMsg !== 'You are not a member of this project') {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.clear()
      if (user?.type === 'SUPER_ADMIN') {
        window.location.href = '/super-admin/login'
      } else {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api