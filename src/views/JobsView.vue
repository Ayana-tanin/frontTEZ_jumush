<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import JobCard from '@/components/JobCard.vue'
import { useI18n } from 'vue-i18n'
import { jobsAPI } from '@/utils/api'
import type { Job } from '@/utils/api'

// Получаем доступ к переводам
const { t, locale } = useI18n()

// Определение интерфейса Job для типизации
interface Application {
  applicantId: number
  applicantName: string
  appliedAt: string
  status: string
}

interface User {
  fullName?: string
  name?: string
  phone?: string
  email?: string
  skills?: string[]
  experience?: string
  userType?: string
}

interface JobFormErrors {
  title: string
  description: string
  salary: string
  location: string
  phone: string
  category: string
  [key: string]: string // Индексированный тип для динамического доступа
}

interface JobForm {
  id: number | null
  title: string
  description: string
  salary: string
  location: string
  phone: string
  category: string
  date: string
  [key: string]: string | number | null // Индексированный тип для динамического доступа
}

const jobs = ref<Job[]>([])
const loading = ref(true)
const error = ref('')

// Загрузка вакансий с backend
async function loadJobs() {
  loading.value = true
  error.value = ''
  try {
    console.log('Начинаем загрузку вакансий...')
    console.log('API URL:', import.meta.env.VITE_API_URL)
    
    // Пробуем прямой fetch для отладки
    console.log('Пробуем прямой fetch запрос...')
    const directResponse = await fetch(import.meta.env.VITE_API_URL + '/api/jobs')
    console.log('Статус ответа:', directResponse.status)
    const directData = await directResponse.json()
    console.log('Данные от прямого fetch:', directData)
    
    // Пробуем через jobsAPI
    console.log('Пробуем через jobsAPI...')
    const result = await jobsAPI.getJobs()
    console.log('Получен ответ от jobsAPI:', result)
    
    if (Array.isArray(result)) {
      jobs.value = result
      console.log(`Загружено ${jobs.value.length} вакансий`)
    } else {
      console.error('Неверный формат данных:', result)
      error.value = 'Неверный формат данных от сервера'
      // Используем демо-данные
      jobs.value = [
        {
          id: 1,
          title: 'Демо вакансия',
          description: 'Это демо-вакансия, созданная из-за ошибки загрузки',
          salary: '1000 сом',
          location: 'Бишкек',
          phone: '+996 555 123456',
          date: new Date().toISOString(),
          category: 'Разное',
          requirements: ['Демо-требование'],
          employer: 'Демо-работодатель',
          urgency: 'medium',
          employment_type: 'part-time',
          user_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  } catch (e: any) {
    console.error('Ошибка при загрузке вакансий:', e)
    console.error('Детали ошибки:', {
      message: e.message,
      status: e.response?.status,
      data: e.response?.data,
      url: e.config?.url
    })
    error.value = `Ошибка при загрузке вакансий: ${e.message || 'Неизвестная ошибка'}`
    // Используем демо-данные при ошибке
    jobs.value = [
      {
        id: 1,
        title: 'Демо вакансия при ошибке',
        description: 'Это демо-вакансия, созданная из-за ошибки загрузки',
        salary: '1000 сом',
        location: 'Бишкек',
        phone: '+996 555 123456',
        date: new Date().toISOString(),
        category: 'Разное',
        requirements: ['Демо-требование'],
        employer: 'Демо-работодатель',
        urgency: 'medium',
        employment_type: 'part-time',
        user_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  } finally {
    loading.value = false
  }
}

// Используем переводы для категорий
const categoryKeys = ['all', 'cleaning', 'construction', 'delivery', 'repair', 'nanny', 'other']
const categories = ref(categoryKeys.map((key) => t(`categories.${key}`)))

// Карта для маппинга переведенных категорий на их ключи
const categoryMap = computed(() => {
  const map = new Map()
  categoryKeys.forEach((key) => {
    map.set(t(`categories.${key}`), key)
  })
  return map
})

// Обратная карта для сопоставления ключей с переведенными категориями
const reverseCategoryMap = computed(() => {
  const map = new Map()
  categoryKeys.forEach((key) => {
    map.set(key, t(`categories.${key}`))
  })
  return map
})

const selectedCategory = ref(t('categories.all'))
const searchQuery = ref('')

// Проверка, авторизован ли пользователь и его тип
const isLoggedIn = ref(false)
const userType = ref('')

// Состояние для модального окна добавления вакансии
const showAddJobModal = ref(false)
const showEditJobModal = ref(false)
const currentJobId = ref<number | null>(null)
const newJob = ref<JobForm>({
  id: null,
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  category: t('categories.other'),
  date: new Date().toISOString().split('T')[0], // Текущая дата
})
const editJob = ref<JobForm>({
  // Для редактирования состояния модального окна
  id: null,
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  category: t('categories.other'),
  date: '',
})
const addJobErrors = ref<JobFormErrors>({
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  category: '',
})
const editJobErrors = ref<JobFormErrors>({
  title: '',
  description: '',
  salary: '',
  location: '',
  phone: '',
  category: '',
})

const applyMessage = ref('')

onMounted(async () => {
  // Проверка авторизации пользователя
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      console.log('Пользователь авторизован:', user) // Для отладки
      isLoggedIn.value = true
      userType.value = user.userType || 'worker'
      console.log('Тип пользователя:', userType.value) // Для отладки

      if (user.phone) {
        newJob.value.phone = user.phone
      }
    } catch (error) {
      console.error('Ошибка при парсинге данных пользователя:', error)
    }
  } else {
    console.log('Пользователь не авторизован') // Для отладки
  }

  // Всегда загружаем вакансии, даже если нет авторизации
  console.log('Загружаем вакансии...');
  await loadJobs();
  console.log('Загружено вакансий:', jobs.value.length);
  
  // Для отладки выводим первую вакансию
  if (jobs.value.length > 0) {
    console.log('Пример вакансии:', jobs.value[0]);
  }
})

// Обновляем категории при изменении языка
watch(locale, () => {
  // Обновляем категории
  categories.value = categoryKeys.map((key) => t(`categories.${key}`))
  // Обновляем выбранную категорию
  if (selectedCategory.value !== t('categories.all')) {
    // Находим соответствующую категорию на новом языке
    const oldCategory = selectedCategory.value
    const oldKey = categoryMap.value.get(oldCategory)
    if (oldKey) {
      selectedCategory.value = t(`categories.${oldKey}`)
    } else {
      selectedCategory.value = t('categories.all')
    }
  } else {
    selectedCategory.value = t('categories.all')
  }
})

const filteredJobs = computed(() => {
  return jobs.value.filter((job) => {
    // Filter by category
    if (
      selectedCategory.value !== t('categories.all') &&
      reverseCategoryMap.value.get(job.category) !== selectedCategory.value
    ) {
      return false
    }

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      return (
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      )
    }

    return true
  })
})

// Функции для установки режимов были удалены, т.к. они создавали эффект автологина
// Добавляем пустые функции, чтобы не было ошибок типизации
function setEmployerMode() {
  // Функционал был удален
  alert('Функция отключена')
}

function setWorkerMode() {
  // Функционал был удален
  alert('Функция отключена')
}

function setCategory(category: string) {
  selectedCategory.value = category
}

// Функция для сброса всех фильтров
function resetFilters() {
  selectedCategory.value = t('categories.all')
  searchQuery.value = ''
}

// Функция для модального окна добавления вакансии
const openAddJobModal = () => {
  showAddJobModal.value = true
  showEditJobModal.value = false // Закрываем модальное окно редактирования, если оно открыто
  // Очистка ошибок
  Object.keys(addJobErrors.value).forEach((key) => (addJobErrors.value[key] = ''))

  // Заполнение даты и телефона
  newJob.value.date = new Date().toISOString().split('T')[0]

  // Если пользователь указал телефон, используем его
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      if (user.phone) {
        newJob.value.phone = user.phone
      }
    } catch (e) {
      console.error('Ошибка при получении данных пользователя', e)
    }
  }
}

const closeAddJobModal = () => {
  showAddJobModal.value = false
}

const handleAddJob = async () => {
  // Валидация
  let valid = true
  Object.keys(addJobErrors.value).forEach((key) => (addJobErrors.value[key] = ''))

  if (!newJob.value.title) {
    addJobErrors.value.title = 'Введите название'
    valid = false
  }
  if (!newJob.value.description) {
    addJobErrors.value.description = 'Введите описание'
    valid = false
  }
  if (!newJob.value.salary) {
    addJobErrors.value.salary = 'Введите зарплату'
    valid = false
  }
  if (!newJob.value.location) {
    addJobErrors.value.location = 'Введите локацию'
    valid = false
  }
  if (!newJob.value.phone) {
    addJobErrors.value.phone = 'Введите телефон'
    valid = false
  }
  if (!newJob.value.category) {
    addJobErrors.value.category = 'Выберите категорию'
    valid = false
  }

  if (!valid) return

  try {
    const res = await jobsAPI.createJob({
      ...newJob.value,
      id: undefined // id не должен быть null
    })
    if (res.message) throw new Error(res.message)
    showAddJobModal.value = false
    await loadJobs()
  } catch (e: any) {
    error.value = e.message || 'Ошибка при добавлении вакансии'
  }
}

// Функция для модального окна редактирования вакансии
const openEditJobModal = (job: Job) => {
  console.log('openEditJobModal вызван с job:', job)

  showAddJobModal.value = false // Закрываем модальное окно добавления, если оно открыто
  showEditJobModal.value = true

  // Очистка ошибок
  Object.keys(editJobErrors.value).forEach((key) => (editJobErrors.value[key] = ''))

  // Копирование данных редактируемой вакансии
  // Исключаем applications из копирования, т.к. этого поля нет в JobForm
  const { applications, ...jobData } = job
  editJob.value = { id: job.id, title: job.title, description: job.description, salary: job.salary, location: job.location, phone: job.phone, category: job.category, date: job.date }

  currentJobId.value = job.id

  console.log('editJob.value после заполнения:', editJob.value)
  console.log('currentJobId.value после заполнения:', currentJobId.value)
}

const closeEditJobModal = () => {
  showEditJobModal.value = false
  currentJobId.value = null
}

const handleEditJob = async () => {
  // Валидация
  let valid = true
  Object.keys(editJobErrors.value).forEach((key) => (editJobErrors.value[key] = ''))

  if (!editJob.value.title) {
    editJobErrors.value.title = 'Введите название'
    valid = false
  }
  if (!editJob.value.description) {
    editJobErrors.value.description = 'Введите описание'
    valid = false
  }
  if (!editJob.value.salary) {
    editJobErrors.value.salary = 'Введите зарплату'
    valid = false
  }
  if (!editJob.value.location) {
    editJobErrors.value.location = 'Введите локацию'
    valid = false
  }
  if (!editJob.value.phone) {
    editJobErrors.value.phone = 'Введите телефон'
    valid = false
  }
  if (!editJob.value.category) {
    editJobErrors.value.category = 'Выберите категорию'
    valid = false
  }

  if (!valid) return

  try {
    const { id, ...rest } = editJob.value;
    const jobData = id === null ? { ...rest } : { ...editJob.value, id };
    const res = await jobsAPI.updateJob(currentJobId.value!, jobData);
    if (res.message) throw new Error(res.message);
    showEditJobModal.value = false;
    currentJobId.value = null;
    await loadJobs();
  } catch (e: any) {
    error.value = e.message || 'Ошибка при редактировании вакансии';
  }
}

// Функция для удаления вакансии
const handleDeleteJob = async (jobId: number) => {
  console.log('handleDeleteJob вызван с jobId:', jobId)

  try {
    const res = await jobsAPI.deleteJob(jobId)
    if (res.message) throw new Error(res.message)
    await loadJobs()
  } catch (e: any) {
    error.value = e.message || 'Ошибка при удалении вакансии'
  }
}

// Обработчик отклика на вакансию
const handleApply = async (job: Job) => {
  applyMessage.value = ''
  if (!isLoggedIn.value) {
    alert('Для отклика на вакансию необходимо авторизоваться')
    return
  }
  if (userType.value !== 'worker') {
    alert('Только работники могут откликаться на вакансию')
    return
  }
  try {
    const res = await jobsAPI.apply(job.id)
    if (res.message) {
      applyMessage.value = res.message
      alert(res.message)
    } else {
      applyMessage.value = 'Вы успешно откликнулись!'
      alert('Вы успешно откликнулись!')
    }
  } catch (e) {
    applyMessage.value = 'Ошибка при отклике'
    alert('Ошибка при отклике')
  }
}
</script>

<template>
  <div class="jobs-view">
    <div class="container">
      <section class="jobs-header">
        <h1 class="text-center">{{ t('jobs.header.title') }}</h1>
        <p class="text-center subtitle">
          {{ t('jobs.header.subtitle') }}
        </p>

        <!-- Тестовая панель была удалена -->

        <div class="search-section">
          <div class="search-container">
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="t('jobs.search.placeholder')"
              class="search-input"
            />
            <button class="search-button">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>

        <div class="categories-section">
          <div class="categories-wrapper">
            <button
              v-for="category in categories"
              :key="category"
              class="category-btn"
              :class="{ active: selectedCategory === category }"
              @click="setCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div class="jobs-actions" v-if="isLoggedIn && userType === 'employer'">
          <button @click="openAddJobModal" class="btn btn-primary add-job-btn">
            <i class="fas fa-plus"></i> {{ t('jobs.actions.addJob') }}
          </button>
        </div>
      </section>

      <section class="jobs-results">
        <div v-if="loading" class="text-center py-5">Загрузка...</div>
        <div v-else-if="error" class="text-center text-danger py-5">{{ error }}</div>
        <div v-else>
          <div class="jobs-filter-info">
            <span class="jobs-count"
              >{{ t('jobs.filterInfo.jobsCount') }}: {{ filteredJobs.length }}</span
            >
            <div
              class="active-filters"
              v-if="selectedCategory !== t('categories.all') || searchQuery"
            >
              <div class="filter-tag" v-if="selectedCategory !== t('categories.all')">
                {{ selectedCategory }}
                <button class="clear-filter" @click="setCategory(t('categories.all'))">×</button>
              </div>
              <div class="filter-tag" v-if="searchQuery">
                {{ t('jobs.filterInfo.searchQuery') }}: {{ searchQuery }}
                <button class="clear-filter" @click="searchQuery = ''">×</button>
              </div>
            </div>
          </div>

          <div class="jobs-grid">
            <job-card
              v-for="job in filteredJobs"
              :key="job.id"
              :job="job"
              :isEmployer="isLoggedIn && userType === 'employer'"
              @edit="openEditJobModal"
              @delete="handleDeleteJob"
              @apply="handleApply"
            />
          </div>

          <div v-if="filteredJobs.length === 0" class="no-jobs">
            <i class="fas fa-search job-icon"></i>
            <h3>{{ t('jobs.noJobs.title') }}</h3>
            <p>
              {{ t('jobs.noJobs.text') }}
              <button class="reset-btn" @click="resetFilters">{{ t('jobs.noJobs.resetBtn') }}</button>
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- Модальное окно добавления вакансии -->
    <div v-if="showAddJobModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ t('jobs.modal.addJobTitle') }}</h2>
        <form @submit.prevent="handleAddJob">
          <div class="form-group">
            <label>{{ t('jobs.form.title') }} *</label>
            <input
              type="text"
              v-model="newJob.title"
              class="form-control"
              :class="{ 'has-error': addJobErrors.title }"
            />
            <div class="error-message" v-if="addJobErrors.title">{{ addJobErrors.title }}</div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.description') }} *</label>
            <textarea
              v-model="newJob.description"
              class="form-control"
              :class="{ 'has-error': addJobErrors.description }"
              rows="4"
            ></textarea>
            <div class="error-message" v-if="addJobErrors.description">
              {{ addJobErrors.description }}
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.salary') }} *</label>
            <input
              type="text"
              v-model="newJob.salary"
              class="form-control"
              :class="{ 'has-error': addJobErrors.salary }"
              :placeholder="t('jobs.form.salaryPlaceholder')"
            />
            <div class="error-message" v-if="addJobErrors.salary">{{ addJobErrors.salary }}</div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.location') }} *</label>
            <input
              type="text"
              v-model="newJob.location"
              class="form-control"
              :class="{ 'has-error': addJobErrors.location }"
              :placeholder="t('jobs.form.locationPlaceholder')"
            />
            <div class="error-message" v-if="addJobErrors.location">
              {{ addJobErrors.location }}
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.phone') }} *</label>
            <input
              type="tel"
              v-model="newJob.phone"
              class="form-control"
              :class="{ 'has-error': addJobErrors.phone }"
              :placeholder="t('jobs.form.phonePlaceholder')"
            />
            <div class="error-message" v-if="addJobErrors.phone">{{ addJobErrors.phone }}</div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.category') }} *</label>
            <select
              v-model="newJob.category"
              class="form-control"
              :class="{ 'has-error': addJobErrors.category }"
            >
              <option
                v-for="category in categoryKeys.filter((c) => c !== 'all')"
                :key="category"
                :value="t(`categories.${category}`)"
              >
                {{ t(`categories.${category}`) }}
              </option>
            </select>
            <div class="error-message" v-if="addJobErrors.category">
              {{ addJobErrors.category }}
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.date') }} *</label>
            <input type="date" v-model="newJob.date" class="form-control" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">{{ t('jobs.modal.addJobBtn') }}</button>
            <button type="button" class="btn btn-outline" @click="closeAddJobModal">
              {{ t('jobs.modal.cancelBtn') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно редактирования вакансии -->
    <div v-if="showEditJobModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ t('jobs.modal.editJobTitle') }}</h2>
        <form @submit.prevent="handleEditJob">
          <div class="form-group">
            <label>{{ t('jobs.form.title') }} *</label>
            <input
              type="text"
              v-model="editJob.title"
              class="form-control"
              :class="{ 'has-error': editJobErrors.title }"
            />
            <div class="error-message" v-if="editJobErrors.title">{{ editJobErrors.title }}</div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.description') }} *</label>
            <textarea
              v-model="editJob.description"
              class="form-control"
              :class="{ 'has-error': editJobErrors.description }"
              rows="4"
            ></textarea>
            <div class="error-message" v-if="editJobErrors.description">
              {{ editJobErrors.description }}
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.salary') }} *</label>
            <input
              type="text"
              v-model="editJob.salary"
              class="form-control"
              :class="{ 'has-error': editJobErrors.salary }"
              :placeholder="t('jobs.form.salaryPlaceholder')"
            />
            <div class="error-message" v-if="editJobErrors.salary">{{ editJobErrors.salary }}</div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.location') }} *</label>
            <input
              type="text"
              v-model="editJob.location"
              class="form-control"
              :class="{ 'has-error': editJobErrors.location }"
              :placeholder="t('jobs.form.locationPlaceholder')"
            />
            <div class="error-message" v-if="editJobErrors.location">
              {{ editJobErrors.location }}
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.phone') }} *</label>
            <input
              type="tel"
              v-model="editJob.phone"
              class="form-control"
              :class="{ 'has-error': editJobErrors.phone }"
              :placeholder="t('jobs.form.phonePlaceholder')"
            />
            <div class="error-message" v-if="editJobErrors.phone">{{ editJobErrors.phone }}</div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.category') }} *</label>
            <select
              v-model="editJob.category"
              class="form-control"
              :class="{ 'has-error': editJobErrors.category }"
            >
              <option
                v-for="category in categoryKeys.filter((c) => c !== 'all')"
                :key="category"
                :value="t(`categories.${category}`)"
              >
                {{ t(`categories.${category}`) }}
              </option>
            </select>
            <div class="error-message" v-if="editJobErrors.category">
              {{ editJobErrors.category }}
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('jobs.form.date') }} *</label>
            <input type="date" v-model="editJob.date" class="form-control" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">{{ t('jobs.modal.editJobBtn') }}</button>
            <button type="button" class="btn btn-outline" @click="closeEditJobModal">
              {{ t('jobs.modal.cancelBtn') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section {
  padding: var(--spacing-xl) 0;
}

h1 {
  margin-bottom: var(--spacing-xl);
  color: var(--primary-color);
}

/* Обновленные стили поиска */
.search-container {
  max-width: 800px;
  margin: 0 auto var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.search-bar {
  flex-basis: 600px;
  flex-grow: 1;
}

.search-input-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  font-size: 1rem;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 14px 24px 14px 48px;
  border: 1px solid var(--border-color);
  border-radius: 30px;
  font-size: 1rem;
  font-family: var(--font-family-body);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  color: var(--text-color);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(62, 104, 255, 0.1);
}

.add-job-button {
  display: flex;
  justify-content: center;
}

.btn-add-job {
  background-color: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn-add-job:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(62, 104, 255, 0.2);
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.category-btn {
  padding: 10px 20px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-color);
  font-family: var(--font-family-body);
  font-size: 0.95rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 3px 8px rgba(62, 104, 255, 0.2);
}

.category-btn:hover:not(.active) {
  background-color: var(--bg-light);
  transform: translateY(-2px);
}

.jobs-count {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-lg);
  font-family: var(--font-family-body);
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.job-card-wrapper {
  height: 100%;
}

.no-jobs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  background-color: var(--bg-light);
  border-radius: var(--radius-lg);
  margin: var(--spacing-xl) 0;
  text-align: center;
}

.no-jobs .job-icon {
  font-size: 3rem;
  color: var(--text-color-lighter);
  margin-bottom: var(--spacing-md);
}

.no-jobs h3 {
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
}

.no-jobs p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.reset-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: underline;
}

.reset-btn:hover {
  color: var(--primary-hover);
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  padding: 32px 28px;
  max-width: 500px;
  width: 100%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: var(--primary-color);
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
}

.modal .form-group {
  margin-bottom: 20px;
}

.modal .form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: var(--font-weight-medium);
  color: var(--text-color);
}

/* Override for dark mode to make labels black */
[data-theme='dark'] .modal .form-group label {
  color: #000000;
}

.modal .form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-family: var(--font-family-body);
  color: var(--text-color);
}

.modal .form-control.has-error {
  border-color: var(--danger-color);
}

.modal .error-message {
  color: var(--danger-color);
  font-size: 13px;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
}

.btn-outline {
  background-color: var(--card-bg);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: rgba(62, 104, 255, 0.05);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: stretch;
    margin-left: var(--spacing-md);
    margin-right: var(--spacing-md);
  }

  .search-bar {
    max-width: 100%;
  }

  .add-job-button {
    width: 100%;
  }

  .categories {
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
  }

  .category-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .jobs-grid {
    grid-template-columns: 1fr;
  }

  .search-input {
    padding: 12px 20px 12px 40px;
  }

  .search-icon {
    left: 16px;
  }

  .modal {
    padding: 24px 20px;
    max-width: 90%;
  }
}

.search-section {
  margin: var(--spacing-lg) 0;
}

.search-container {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  display: flex;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-family: var(--font-family-body);
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  color: var(--text-color);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(62, 104, 255, 0.15);
}

.search-button {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-color-light);
  font-size: 1.2rem;
  cursor: pointer;
}

.categories-section {
  margin: var(--spacing-lg) 0;
}

.categories-wrapper {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.category-btn {
  padding: 10px 20px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-color);
  font-family: var(--font-family-body);
  font-size: 0.95rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(62, 104, 255, 0.2);
}

.category-btn:hover:not(.active) {
  background-color: var(--bg-light);
  transform: translateY(-2px);
}

.jobs-actions {
  margin: var(--spacing-lg) 0;
  text-align: center;
}

.add-job-btn {
  padding: 12px 24px;
  font-weight: var(--font-weight-medium);
}

.jobs-filter-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.jobs-count {
  font-size: 1rem;
  color: var(--text-color-light);
}

.active-filters {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-tag {
  background-color: var(--bg-light);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-filter {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--text-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-filter:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--danger-color);
}

/* Стили для тестовой панели были удалены */
</style>
