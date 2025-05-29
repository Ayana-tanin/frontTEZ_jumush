import { createRouter, createWebHistory } from 'vue-router'
import { i18n } from '../utils/i18n'
import type { TranslationLanguages } from '../utils/i18n'

const routes = [
  {
    path: '/:locale(ru|kg)?',
    component: { template: '<router-view />' },
    children: [
      { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
      { path: 'jobs', name: 'jobs', component: () => import('../views/JobsView.vue'), meta: { requiresAuth: true } },
      { path: 'jobs/:id', name: 'job-details', component: () => import('../views/JobDetailView.vue'), meta: { requiresAuth: true } },
      { path: 'about', name: 'about', component: () => import('../views/AboutView.vue') },
      { path: 'register', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { requiresGuest: true } },
      { path: 'login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { requiresGuest: true } },
      { path: 'dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
      { path: ':pathMatch(.*)*', redirect: '' },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Функция для проверки валидности токена
function isValidToken(token: string): boolean {
  if (!token) return false
  
  // Для демо токенов проверяем время создания
  if (token.startsWith('demo_')) {
    try {
      const timestamp = parseInt(token.split('_').pop() || '0')
      const weekInMs = 7 * 24 * 60 * 60 * 1000
      return (Date.now() - timestamp) < weekInMs
    } catch {
      return false
    }
  }
  
  // Для JWT токенов можно добавить более сложную проверку
  if (token.includes('.')) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      // Проверяем время истечения если есть
      if (payload.exp) {
        return payload.exp * 1000 > Date.now()
      }
      return true // Если нет exp, считаем валидным
    } catch {
      return false
    }
  }
  
  return true // Для других типов токенов
}

// Улучшенная функция проверки авторизации
function checkAuthentication(): { isAuthenticated: boolean; user: any | null } {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      return { isAuthenticated: false, user: null }
    }
    
    const user = JSON.parse(userStr)
    
    // Проверяем обязательные поля
    if (!user.email || !user.name) {
      console.warn('Неполные данные пользователя, очищаем localStorage')
      localStorage.removeItem('user')
      return { isAuthenticated: false, user: null }
    }
    
    // Проверяем валидность токена
    if (user.token && !isValidToken(user.token)) {
      console.warn('Недействительный токен, очищаем localStorage')
      localStorage.removeItem('user')
      return { isAuthenticated: false, user: null }
    }
    
    return { isAuthenticated: true, user }
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error)
    localStorage.removeItem('user')
    return { isAuthenticated: false, user: null }
  }
}

router.beforeEach((to, from, next) => {
  const locale = to.params.locale as TranslationLanguages | undefined
  if (locale && (locale === 'ru' || locale === 'kg')) {
    i18n.global.locale.value = locale
    localStorage.setItem('preferredLanguage', locale)
  }

  console.log('Router navigation:', { from: from.path, to: to.path })

  const { isAuthenticated, user } = checkAuthentication()
  console.log('User authenticated:', isAuthenticated, user ? `(${user.email})` : '')

  // Если маршрут требует авторизации
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      console.log('Redirecting to login because route requires auth')
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      })
      return
    } else {
      console.log('User is authenticated, allowing access to protected route')
      next()
      return
    }
  }
  
  // Если маршрут требует отсутствия авторизации (login/register)
  if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting to dashboard')
      next({ path: '/dashboard' })
      return
    } else {
      console.log('User is not authenticated, allowing access to guest route')
      next()
      return
    }
  }
  
  // Если маршрут не требует особых проверок авторизации
  console.log('Route does not require auth checks, allowing access')
  next()
})

// Обработка ошибок навигации
router.onError((error) => {
  console.error('Router error:', error)
  
  // Если ошибка связана с загрузкой компонента, перенаправляем на главную
  if (error.message.includes('Loading chunk') || error.message.includes('Failed to fetch')) {
    console.warn('Chunk loading error, redirecting to home')
    router.push('/')
  }
})

// Логирование успешной навигации в dev режиме
if (import.meta.env.DEV) {
  router.afterEach((to, from) => {
    console.log(`Navigation completed: ${from.path} -> ${to.path}`)
  })
}

export default router
