import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// Типы для API
export interface User {
  id: number | string
  name: string
  email: string
  phone: string
  userType: 'worker' | 'employer'
  photo: string
  age: number
  skills: string[]
  experience: string
  hasOtherJobs: boolean
  authProvider: string
  token?: string
}

export interface Job {
  id: number
  title: string
  description: string
  salary: string
  salary_amount?: number
  location: string
  phone: string
  date: string
  category: string
  requirements: string[]
  employer: string
  employer_photo?: string
  urgency: 'low' | 'medium' | 'high'
  employment_type: 'full-time' | 'part-time' | 'freelance' | 'contract'
  user_id: number
  applications_count?: number
  created_at: string
  updated_at: string
  applications?: any[]
}

export interface Application {
  id: number
  job_id: number
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  cover_letter: string
  applied_at: string
  updated_at: string
  job?: Partial<Job>
  applicant?: Partial<User>
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
    items_per_page: number
  }
}

// Получаем API URL с fallback
const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 секунд таймаут
})

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`
        }
      } catch (e) {
        console.error('Error parsing user token:', e)
        // Удаляем поврежденные данные пользователя
        localStorage.removeItem('user')
      }
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Улучшенная обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    })

    // Обработка различных типов ошибок
    if (error.response?.status === 401) {
      // Неавторизованный доступ - удаляем токен и перенаправляем
      console.warn('Unauthorized access, clearing user data')
      localStorage.removeItem('user')
      
      // Перенаправляем только если не находимся уже на странице логина
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      // Запрещенный доступ
      console.warn('Forbidden access')
    } else if (error.response && error.response.status !== undefined && error.response.status >= 500) {
      // Ошибки сервера
      console.error('Server error:', error.response.status)
    } else if ((error as any).code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      // Сетевые ошибки - переключаемся в оффлайн режим
      { console.warn('Network error detected, switching to offline mode'); }
      (error as any).isNetworkError = true
    } else if ((error as any).code === 'ECONNABORTED') {
      // Таймаут
      { console.warn('Request timeout'); }
      (error as any).isTimeout = true
    }

    return Promise.reject(error)
  }
)

// Функция для проверки доступности API
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE}/health`, { timeout: 3000 })
    return response.status === 200
  } catch (error) {
    console.warn('API health check failed:', error)
    return false
  }
}

export const authAPI = {
  // Регистрация
  async register(userData: {
    name: string
    email: string
    password: string
    phone?: string
    userType: string
    photo?: string
    age?: number
    skills?: string[]
    experience?: string
    hasOtherJobs?: boolean
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post('/users/register', userData)
      return response.data
    } catch (error: any) {
      // Для демо режима возвращаем мок-данные
      if (error.isNetworkError) {
        const mockUser: User = {
          id: 'demo_' + Date.now(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          userType: userData.userType as 'worker' | 'employer',
          photo: userData.photo || '',
          age: userData.age || 0,
          skills: userData.skills || [],
          experience: userData.experience || '',
          hasOtherJobs: userData.hasOtherJobs || false,
          authProvider: 'local',
          token: 'demo_token_' + Date.now()
        }
        
        return {
          data: {
            user: mockUser,
            token: mockUser.token!
          },
          success: true,
          message: 'Демо-регистрация успешна'
        }
      }
      throw error
    }
  },

  // Логин
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post('/users/login', credentials)
      return response.data
    } catch (error: any) {
      // Для демо режима проверяем локальные данные
      if (error.isNetworkError) {
        const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]')
        const user = demoUsers.find((u: any) => u.email === credentials.email)
        
        if (user) {
          return {
            data: {
              user,
              token: user.token || 'demo_token_' + Date.now()
            },
            success: true,
            message: 'Демо-вход успешен'
          }
        } else {
          throw new Error('Пользователь не найден в демо-режиме')
        }
      }
      throw error
    }
  },

  // Google авторизация
  async googleAuth(credential: string, userType = 'worker'): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post('/auth/google/verify', {
        credential,
        userType
      })
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        throw error // Позволяем GoogleSignIn обработать это как сетевую ошибку
      }
      throw error
    }
  },

  // Получение профиля
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/users/me')
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        // Возвращаем данные из localStorage
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          return {
            data: user,
            success: true,
            message: 'Профиль загружен из кэша'
          }
        }
      }
      throw error
    }
  },

  // Обновление профиля
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await api.put('/users/me', profileData)
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        // Обновляем данные локально
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          const updatedUser = { ...user, ...profileData }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          
          return {
            data: updatedUser,
            success: true,
            message: 'Профиль обновлен локально'
          }
        }
      }
      throw error
    }
  }
}

// Демо-данные для оффлайн режима
const generateDemoJobs = (): Job[] => [
  {
    id: 1,
    title: 'Курьер на день',
    description: 'Доставка документов по городу на 1 день. Требуется ответственный человек с транспортом.',
    salary: '1000 сом',
    salary_amount: 1000,
    location: 'Бишкек',
    phone: '+996 555 123456',
    date: new Date().toISOString(),
    category: 'Доставка',
    requirements: ['Наличие транспорта', 'Ответственность'],
    employer: 'ОсОО "Быстрая доставка"',
    urgency: 'medium' as const,
    employment_type: 'part-time' as const,
    user_id: 1,
    applications_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Помощник на мероприятие',
    description: 'Требуется помощник для организации свадебного мероприятия. Работа на выходных.',
    salary: '1500 сом',
    salary_amount: 1500,
    location: 'Бишкек',
    phone: '+996 555 789012',
    date: new Date().toISOString(),
    category: 'Мероприятия',
    requirements: ['Коммуникабельность', 'Опрятный внешний вид'],
    employer: 'Event Agency "Праздник"',
    urgency: 'high' as const,
    employment_type: 'freelance' as const,
    user_id: 2,
    applications_count: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Уборка помещения',
    description: 'Уборка офиса после ремонта. Необходимо убрать строительный мусор и провести влажную уборку.',
    salary: '2000 сом',
    salary_amount: 2000,
    location: 'Бишкек',
    phone: '+996 555 345678',
    date: new Date().toISOString(),
    category: 'Уборка',
    requirements: ['Опыт уборки', 'Наличие инвентаря'],
    employer: 'Строительная компания "Ремонт+"',
    urgency: 'low' as const,
    employment_type: 'contract' as const,
    user_id: 3,
    applications_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const jobsAPI = {
  async getJobs(): Promise<Job[]> {
    try {
      const response = await api.get('/jobs')
      
      // Проверяем разные форматы ответа
      if (response.data && response.data.jobs) {
        console.log('Получены вакансии из API:', response.data.jobs.length)
        return response.data.jobs
      } else if (response.data && Array.isArray(response.data.data)) {
        console.log('Получены вакансии из data:', response.data.data.length)
        return response.data.data
      } else if (Array.isArray(response.data)) {
        console.log('Получены вакансии напрямую:', response.data.length)
        return response.data
      } else {
        console.warn('Неизвестный формат ответа API:', response.data)
        // Возвращаем демо-данные, если формат ответа неизвестен
        console.log('Используем демо-данные из-за неизвестного формата ответа')
        return generateDemoJobs()
      }
    } catch (error: any) {
      console.error('Ошибка при получении вакансий:', error)
      if (error.isNetworkError) {
        console.log('Используем демо-данные из-за сетевой ошибки')
        return generateDemoJobs()
      }
      // В любом случае возвращаем демо-данные при ошибке
      console.log('Используем демо-данные из-за ошибки')
      return generateDemoJobs()
    }
  },

  async getJob(id: number | string): Promise<Job> {
    try {
      const response = await api.get(`/jobs/${id}`)
      return response.data.data || response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        const demoJobs = generateDemoJobs()
        const job = demoJobs.find(j => j.id.toString() === id.toString())
        if (job) {
          return job
        }
        throw new Error('Вакансия не найдена')
      }
      throw error
    }
  },

  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    try {
      const response = await api.post('/jobs', jobData)
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        const newJob: Job = {
          id: Date.now(),
          title: jobData.title || '',
          description: jobData.description || '',
          salary: jobData.salary || '',
          location: jobData.location || '',
          phone: jobData.phone || '',
          category: jobData.category || '',
          date: jobData.date || new Date().toISOString(),
          requirements: [],
          employer: 'Демо работодатель',
          urgency: 'medium' as const,
          employment_type: 'part-time' as const,
          user_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        return {
          data: newJob,
          success: true,
          message: 'Вакансия создана в демо-режиме'
        }
      }
      throw error
    }
  },

  async updateJob(id: number | string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    try {
      const response = await api.put(`/jobs/${id}`, jobData)
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        return {
          data: { ...jobData, id: Number(id) } as Job,
          success: true,
          message: 'Вакансия обновлена в демо-режиме'
        }
      }
      throw error
    }
  },

  async deleteJob(id: number | string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/jobs/${id}`)
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        return {
          data: undefined,
          success: true,
          message: 'Вакансия удалена в демо-режиме'
        }
      }
      throw error
    }
  },

  async apply(jobId: number | string): Promise<ApiResponse<Application>> {
    try {
      const response = await api.post('/applications', { job_id: jobId })
      return response.data
    } catch (error: any) {
      if (error.isNetworkError) {
        // Проверяем, не подавал ли уже заявку пользователь
        const applications = JSON.parse(localStorage.getItem('demoApplications') || '[]')
        const userStr = localStorage.getItem('user')
        
        if (userStr) {
          const user = JSON.parse(userStr)
          const existingApplication = applications.find((app: any) => 
            app.job_id.toString() === jobId.toString() && app.user_id === user.id
          )
          
          if (existingApplication) {
            throw new Error('Вы уже откликнулись на эту вакансию')
          }
          
          const newApplication: Application = {
            id: Date.now(),
            job_id: Number(jobId),
            status: 'pending',
            cover_letter: '',
            applied_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          applications.push({ ...newApplication, user_id: user.id })
          localStorage.setItem('demoApplications', JSON.stringify(applications))
          
          return {
            data: newApplication,
            success: true,
            message: 'Отклик отправлен в демо-режиме'
          }
        }
      }
      throw error
    }
  }
}

export default api