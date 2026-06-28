import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends the httpOnly JWT cookie automatically
})

// Redirect to login on any 401 (expired/invalid session)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fintrack_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  login:    (data) => api.post('/auth/login', data).then(r => r.data),
  logout:   ()     => api.post('/auth/logout').then(r => r.data),
  me:       ()     => api.get('/auth/me').then(r => r.data),
  updateMe: (data) => api.patch('/auth/me', data).then(r => r.data),
  changePassword: (data) => api.patch('/auth/change-password', data).then(r => r.data),
  deleteAccount: (data) => api.delete('/auth/me', { data }).then(r => r.data),
  completeOnboarding: (data) => api.patch('/auth/onboarding', data).then(r => r.data),
}

// ── Transactions ──────────────────────────────────────
export const transactionsApi = {
  list:    (params)  => api.get('/transactions', { params }).then(r => r.data),
  create:  (data)    => api.post('/transactions', data).then(r => r.data),
  remove:  (id)      => api.delete(`/transactions/${id}`).then(r => r.data),
  summary: (params)  => api.get('/transactions/summary', { params }).then(r => r.data),
  monthlyTrend: (params) => api.get('/transactions/monthly-trend', { params }).then(r => r.data),
  categoryComparison: (params) => api.get('/transactions/category-comparison', { params }).then(r => r.data),
}

// ── Budgets ───────────────────────────────────────────
export const budgetsApi = {
  list:        (params) => api.get('/budgets', { params }).then(r => r.data),
  withSpend:   (params) => api.get('/budgets/with-spend', { params }).then(r => r.data),
  create:      (data)   => api.post('/budgets', data).then(r => r.data),
  update:      (id, data) => api.patch(`/budgets/${id}`, data).then(r => r.data),
  remove:      (id)     => api.delete(`/budgets/${id}`).then(r => r.data),
}

// ── Savings Goals ─────────────────────────────────────
export const goalsApi = {
  list:   ()       => api.get('/goals').then(r => r.data),
  create: (data)    => api.post('/goals', data).then(r => r.data),
  update: (id, data) => api.patch(`/goals/${id}`, data).then(r => r.data),
  remove: (id)      => api.delete(`/goals/${id}`).then(r => r.data),
}

// ── Saved Tips ────────────────────────────────────────
export const savedTipsApi = {
  list:   ()      => api.get('/saved-tips').then(r => r.data),
  save:   (tipId)  => api.post('/saved-tips', { tipId }).then(r => r.data),
  unsave: (tipId)  => api.delete(`/saved-tips/${tipId}`).then(r => r.data),
}

export default api