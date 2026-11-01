import axios from 'axios'

export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL })

// ajoute le JWT à chaque requête
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// token expiré ou invalide so retour au login (sauf pour le login lui-même)
http.interceptors.response.use(
  (r) => r,
  (err) => {
    const isLogin = err.config?.url?.includes('/auth/login')
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)