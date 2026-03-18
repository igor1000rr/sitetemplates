// ─── Каталог ───

export interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  templates_count?: number
}

export interface Platform {
  id: number
  name: string
  slug: string
}

export interface TemplateImage {
  id: number
  path: string
  alt?: string
  is_main: boolean
}

export interface TemplateListItem {
  id: number
  title: string
  slug: string
  short_desc?: string
  price: number
  price_rub: number
  old_price?: number
  old_price_rub?: number
  discount_percent?: number
  template_type: 'landing' | 'multipage' | 'shop' | 'quiz'
  features: string[]
  rating: number
  reviews_count: number
  sales_count: number
  is_featured: boolean
  category: { name: string; slug: string }
  platform: { name: string; slug: string }
  image?: string
  demo_url?: string
  published_at?: string
}

export interface Template extends TemplateListItem {
  description?: string
  tags: string[]
  tech_specs: Record<string, string>
  version: string
  views_count: number
  meta_title?: string
  meta_desc?: string
  images: TemplateImage[]
  reviews?: ReviewItem[]
  published_at?: string
}

// ─── Заказы ───

export interface OrderItem {
  id: number
  template_id: number
  price: number
  price_rub: number
  template?: {
    title: string
    slug: string
    image?: string
    platform?: string
  }
}

export interface Order {
  id: number
  order_number: string
  status: 'pending' | 'processing' | 'paid' | 'cancelled' | 'refunded'
  subtotal: number
  discount: number
  total: number
  total_rub: number
  payment_method?: string
  paid_at?: string
  created_at: string
  items: OrderItem[]
  promo_code?: string
}

// ─── Отзывы ───

export interface ReviewItem {
  id: number
  rating: number
  text: string
  user: string
  created_at: string
}

// ─── Пользователь ───

export interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'author' | 'admin'
  phone?: string
  avatar?: string
}

// ─── Корзина ───

export interface CartItem {
  id: number
  title: string
  slug: string
  price: number
  price_rub: number
  old_price_rub?: number
  image?: string
  platform: string
  services?: number[] // ID выбранных доп. услуг
}

// ─── Доп. услуги ───

export interface Service {
  id: number
  name: string
  slug: string
  short_description?: string
  price: number
  price_rub: number
  icon?: string
  category: string
  estimated_days: number
  is_popular: boolean
}

// ─── API responses ───

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links: {
    next?: string
    prev?: string
  }
}

// ─── Admin ───

export interface DashboardStats {
  total_revenue: number
  month_revenue: number
  today_revenue: number
  total_orders: number
  month_orders: number
  today_orders: number
  total_users: number
  month_users: number
  total_templates: number
  total_downloads: number
  pending_orders: number
  pending_reviews: number
}

export interface PromoCode {
  id: number
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order: number
  max_uses: number
  used_count: number
  expires_at?: string
  is_active: boolean
}
