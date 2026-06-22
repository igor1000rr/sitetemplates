import axios from 'axios'

// Access-токен держим только в памяти (НЕ в localStorage) — это снижает риск
// кражи токена через XSS. В проде сессия восстанавливается из httpOnly-cookie
// auth_token, которую ставит бэкенд; здесь токен идёт как Bearer в рамках сессии.
let authToken: string | null = null
export function setAuthToken(token: string | null) {
  authToken = token
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // отправляем httpOnly-cookie auth_token на бэкенд
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Auth token interceptor — Bearer из памяти, если есть; иначе бэкенд
// аутентифицирует по httpOnly-cookie (middleware AuthTokenFromCookie)
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authToken = null
    }
    return Promise.reject(error)
  }
)

export default api

// ─── API методы ───

export const templatesApi = {
  list: (params?: Record<string, any>) =>
    api.get('/templates', { params }),

  featured: () =>
    api.get('/templates/featured'),

  show: (slug: string) =>
    api.get(`/templates/${slug}`),
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string; referral_code?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () =>
    api.post('/auth/logout'),

  user: () =>
    api.get('/user'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put('/user', data),

  changePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
    api.post('/user/password', data),
  deleteAccount: () => api.delete('/user'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }) =>
    api.post('/auth/reset-password', data),

  // Обмен одноразового кода из OAuth-колбэка на токен (токен не идёт через URL)
  socialExchange: (code: string) =>
    api.post('/auth/social/exchange', { code }),
}

export const notificationApi = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (ids?: number[]) => api.post('/notifications/read', ids ? { ids } : {}),
}

export const contactApi = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post('/contact', data),
}

export const ordersApi = {
  create: (data: { items: { template_id: number; services?: number[] }[]; promo_code?: string }) =>
    api.post('/orders', data),

  list: (params?: { page?: number; per_page?: number } | number) => {
    const p = typeof params === 'number' ? { page: params } : params
    return api.get('/orders', { params: p })
  },

  show: (id: number) =>
    api.get(`/orders/${id}`),

  findByNumber: (orderNumber: string) =>
    api.get(`/orders/find/${orderNumber}`),

  download: (orderId: number, templateId: number) =>
    api.get(`/download/${orderId}/${templateId}`),
}

export const catalogApi = {
  categories: () =>
    api.get('/categories'),

  platforms: () =>
    api.get('/platforms'),
}

export const reviewsApi = {
  list: (templateId: number, page = 1) =>
    api.get(`/reviews/${templateId}`, { params: { page } }),

  create: (data: { template_id: number; rating: number; text: string }) =>
    api.post('/reviews', data),
}

export const promoApi = {
  validate: (code: string) =>
    api.post('/promo/validate', { code }),
}

export const blogApi = {
  list: (params?: Record<string, any>) =>
    api.get('/blog', { params }),

  show: (slug: string) =>
    api.get(`/blog/${slug}`),

  categories: () =>
    api.get('/blog/categories'),
}

export const subscriptionApi = {
  plans: () =>
    api.get('/subscriptions/plans'),

  my: () =>
    api.get('/subscriptions/my'),

  subscribe: (plan_id: number, billing_cycle: 'monthly' | 'annual') =>
    api.post('/subscriptions/subscribe', { plan_id, billing_cycle }),

  cancel: () =>
    api.post('/subscriptions/cancel'),

  downloadBySubscription: (templateId: number) =>
    api.get(`/download/subscription/${templateId}`),

  checkAccess: (templateId: number) =>
    api.get(`/download/check/${templateId}`),
}

export const referralApi = {
  stats: () =>
    api.get('/referral/stats'),

  rewards: (params?: Record<string, any>) =>
    api.get('/referral/rewards', { params }),

  generate: () =>
    api.post('/referral/generate'),
}

export const deployApi = {
  list: () =>
    api.get('/deploy'),

  create: (data: {
    template_id: number; method: string; host: string;
    port?: number; username: string; password: string; remote_path?: string;
  }) =>
    api.post('/deploy', data),

  status: (id: number) =>
    api.get(`/deploy/${id}`),
}

export const wishlistApi = {
  list: () =>
    api.get('/wishlist'),

  toggle: (template_id: number) =>
    api.post('/wishlist/toggle', { template_id }),

  check: (ids: number[]) =>
    api.get('/wishlist/check', { params: { ids: ids.join(',') } }),
}

export const compareApi = {
  compare: (ids: number[]) =>
    api.get('/compare', { params: { ids: ids.join(',') } }),
}

export const aiApi = {
  chat: (message: string, history: { role: string; text: string }[]) =>
    api.post('/ai/chat', { message, history }),

  match: (data: { message: string }) =>
    api.post('/ai/chat', { message: data.message, history: [] }),
}

export const authorApi = {
  register: (data: { display_name: string; bio?: string; specialization?: string; website?: string }) =>
    api.post('/author/register', data),

  dashboard: () =>
    api.get('/author/dashboard'),

  profile: () =>
    api.get('/author/profile'),

  updateProfile: (data: any) =>
    api.put('/author/profile', data),

  templates: (page = 1) =>
    api.get('/author/templates', { params: { page } }),

  templateShow: (id: number) =>
    api.get(`/author/templates/${id}`),

  templateCreate: (data: any) =>
    api.post('/author/templates', data),

  templateUpdate: (id: number, data: any) =>
    api.put(`/author/templates/${id}`, data),

  templateDelete: (id: number) =>
    api.delete(`/author/templates/${id}`),

  payouts: (page = 1) =>
    api.get('/author/payouts', { params: { page } }),

  requestPayout: (amount: number) =>
    api.post('/author/payouts', { amount }),

  upload: (file: File, folder = 'templates') => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    return api.post('/author/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  publicProfile: (slug: string) =>
    api.get(`/authors/${slug}`),
}

// ─── ADMIN API ───

export const servicesApi = {
  list: () => api.get('/services'),
}

export const customRequestApi = {
  submit: (data: {
    name: string
    email: string
    phone?: string
    company?: string
    business_type?: string
    budget_range?: string
    deadline?: string
    description: string
    reference_urls?: string
    preferred_platform?: string
  }) => api.post('/custom-requests', data),
}

export const adminApi = {
  dashboard: () =>
    api.get('/admin/dashboard'),

  // Templates
  templates: (params?: Record<string, any>) =>
    api.get('/admin/templates', { params }),

  templateShow: (id: number) =>
    api.get(`/admin/templates/${id}`),

  templateCreate: (data: any) =>
    api.post('/admin/templates', data),

  templateUpdate: (id: number, data: any) =>
    api.put(`/admin/templates/${id}`, data),

  templateDelete: (id: number) =>
    api.delete(`/admin/templates/${id}`),

  // Orders
  orders: (params?: Record<string, any>) =>
    api.get('/admin/orders', { params }),

  orderShow: (id: number) =>
    api.get(`/admin/orders/${id}`),

  orderUpdate: (id: number, data: { status: string }) =>
    api.put(`/admin/orders/${id}`, data),

  // Reviews
  reviews: (params?: Record<string, any>) =>
    api.get('/admin/reviews', { params }),

  reviewApprove: (id: number) =>
    api.put(`/admin/reviews/${id}`, { status: 'approved' }),

  reviewReject: (id: number) =>
    api.put(`/admin/reviews/${id}`, { status: 'rejected' }),

  // Promo
  promos: () =>
    api.get('/admin/promo'),

  promoCreate: (data: any) =>
    api.post('/admin/promo', data),

  promoUpdate: (id: number, data: any) =>
    api.put(`/admin/promo/${id}`, data),

  promoDelete: (id: number) =>
    api.delete(`/admin/promo/${id}`),

  // Upload
  upload: (file: File, folder = 'templates') => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    return api.post('/admin/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Payouts (авторские выплаты)
  payouts: (params?: Record<string, any>) =>
    api.get('/admin/payouts', { params }),

  payoutUpdate: (id: number, data: { status: string; admin_note?: string }) =>
    api.put(`/admin/payouts/${id}`, data),

  // Blog
  posts: (params?: Record<string, any>) =>
    api.get('/admin/posts', { params }),

  postShow: (id: number) =>
    api.get(`/admin/posts/${id}`),

  postCreate: (data: any) =>
    api.post('/admin/posts', data),

  postUpdate: (id: number, data: any) =>
    api.put(`/admin/posts/${id}`, data),

  postDelete: (id: number) =>
    api.delete(`/admin/posts/${id}`),

  postCategories: () =>
    api.get('/admin/post-categories'),

  postCategoryCreate: (data: { name: string; slug: string; description?: string }) =>
    api.post('/admin/post-categories', data),

  postCategoryDelete: (id: number) =>
    api.delete(`/admin/post-categories/${id}`),
}
