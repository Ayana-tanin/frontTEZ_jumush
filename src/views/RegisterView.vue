<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GoogleSignIn from '@/components/GoogleSignIn.vue'
import { authAPI } from '@/utils/api'

const router = useRouter()

// Данные формы
const formData = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  userType: 'worker',
  termsAccepted: false,
})

// Фотография профиля
const profilePhoto = reactive({
  file: null as File | null,
  preview: '',
  error: '',
})

// Обработчик выбора фото
const handlePhotoChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) {
    return
  }

  const file = input.files[0]

  // Проверка на тип файла (только изображения)
  if (!file.type.match('image.*')) {
    profilePhoto.error = 'Пожалуйста, выберите изображение'
    profilePhoto.file = null
    profilePhoto.preview = ''
    return
  }

  // Проверка на размер файла (не более 5МБ)
  if (file.size > 5 * 1024 * 1024) {
    profilePhoto.error = 'Размер файла не должен превышать 5МБ'
    profilePhoto.file = null
    profilePhoto.preview = ''
    return
  }

  // Сохраняем файл и создаем превью
  profilePhoto.file = file
  profilePhoto.error = ''

  // Создаем URL для превью
  const reader = new FileReader()
  reader.onload = (e) => {
    profilePhoto.preview = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Убираем выбранное фото
const removePhoto = () => {
  profilePhoto.file = null
  profilePhoto.preview = ''
  profilePhoto.error = ''
}

// Типы ошибок валидации
interface ValidationErrors {
  [key: string]: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: string;
}

// Валидация
const errors = ref<ValidationErrors>({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  termsAccepted: '',
})

const isLoading = ref(false)

// Добавляем проверку на наличие ошибки redirect_uri_mismatch в URL
const urlParams = new URLSearchParams(window.location.search)
const hasRedirectError = urlParams.get('error') === 'redirect_uri_mismatch'
const showRedirectError = ref(hasRedirectError)

// Возвращаем origin для использования в шаблоне
const currentOrigin = computed(() => window.location.origin)

// Функция для отображения инструкций по исправлению ошибки redirect_uri_mismatch
const showGoogleOAuthInstructions = () => {
  showRedirectError.value = true
}

// Функция для скрытия инструкций
const hideGoogleOAuthInstructions = () => {
  showRedirectError.value = false
}

const isOnlineMode = ref(false)

onMounted(async () => {
  try {
    await fetch(import.meta.env.VITE_API_URL + '/health')
    isOnlineMode.value = true
  } catch (e) {
    isOnlineMode.value = false
  }
})

// Обработка отправки формы
const handleSubmit = async () => {
  // Сбросить ошибки
  Object.keys(errors.value).forEach((key) => {
    const field = key as keyof ValidationErrors
    errors.value[field] = ''
  })

  // Валидация полей
  let isValid = true

  if (!formData.value.name) {
    errors.value.name = 'Пожалуйста, введите ваше имя'
    isValid = false
  }

  if (!formData.value.email) {
    errors.value.email = 'Пожалуйста, введите email'
    isValid = false
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.value.email)) {
    errors.value.email = 'Пожалуйста, введите корректный email'
    isValid = false
  }

  if (!formData.value.phone) {
    errors.value.phone = 'Пожалуйста, введите номер телефона'
    isValid = false
  } else if (!/^\+?\d{10,13}$/.test(formData.value.phone.replace(/\s/g, ''))) {
    errors.value.phone = 'Пожалуйста, введите корректный номер телефона'
    isValid = false
  }

  if (!formData.value.password) {
    errors.value.password = 'Пожалуйста, введите пароль'
    isValid = false
  } else if (formData.value.password.length < 6) {
    errors.value.password = 'Пароль должен содержать минимум 6 символов'
    isValid = false
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Пароли не совпадают'
    isValid = false
  }

  if (!formData.value.termsAccepted) {
    errors.value.termsAccepted = 'Пожалуйста, примите пользовательское соглашение'
    isValid = false
  }

  if (isValid) {
    isLoading.value = true
    if (isOnlineMode.value) {
      try {
        let photoData = ''
        if (profilePhoto.preview) {
          photoData = profilePhoto.preview
        }
        const response = await authAPI.register({
          name: formData.value.name,
          email: formData.value.email,
          phone: formData.value.phone,
          password: formData.value.password,
          userType: formData.value.userType,
          photo: photoData
        })
        // Сохраняем пользователя с токеном
        const userData = {
          ...response.data.user,
          token: response.data.token
        }
        localStorage.setItem('user', JSON.stringify(userData))
        isLoading.value = false
        router.push('/')
      } catch (err: any) {
        isLoading.value = false
        if (err.response?.data?.error) {
          errors.value.email = err.response.data.error
        } else {
          errors.value.email = 'Ошибка регистрации'
        }
      }
    } else {
      isLoading.value = false
      errors.value.email = 'Регистрация недоступна в демо-режиме. Используйте тестовые аккаунты.'
    }
  }
}

// Переключение между типами пользователей
const setUserType = (type: string) => {
  formData.value.userType = type
}
</script>

<template>
  <div class="register-view">
    <div class="container">
      <div class="register-container">
        <div class="register-header">
          <h1>Регистрация</h1>
          <p>Создайте учетную запись для доступа к вакансиям</p>
        </div>

        <div class="user-type-selector">
          <button
            class="user-type-btn"
            :class="{ active: formData.userType === 'worker' }"
            @click="setUserType('worker')"
          >
            Я ищу работу
          </button>
          <button
            class="user-type-btn"
            :class="{ active: formData.userType === 'employer' }"
            @click="setUserType('employer')"
          >
            Я ищу работников
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="register-form">
          <!-- Загрузка фото профиля -->
          <div class="form-group profile-photo-upload">
            <label>Фото профиля</label>
            <div class="photo-upload-container">
              <div class="photo-preview" :class="{ 'has-photo': profilePhoto.preview }">
                <img
                  v-if="profilePhoto.preview"
                  :src="profilePhoto.preview"
                  alt="Profile Preview"
                />
                <div v-else class="photo-placeholder">
                  <i class="fas fa-user"></i>
                </div>

                <button
                  v-if="profilePhoto.preview"
                  type="button"
                  class="remove-photo"
                  @click="removePhoto"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="photo-upload-controls">
                <label for="photo-upload" class="upload-btn">
                  <i class="fas fa-camera"></i>
                  {{ profilePhoto.preview ? 'Изменить фото' : 'Загрузить фото' }}
                </label>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  @change="handlePhotoChange"
                  class="photo-input"
                />
                <p class="photo-hint">JPG, PNG, GIF. Макс. размер 5МБ</p>
                <div v-if="profilePhoto.error" class="photo-error">
                  {{ profilePhoto.error }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="name">Имя</label>
            <input
              type="text"
              id="name"
              v-model="formData.name"
              class="form-control"
              :class="{ 'has-error': errors.name }"
              placeholder="Введите ваше имя"
            />
            <div class="error-message" v-if="errors.name">{{ errors.name }}</div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
              class="form-control"
              :class="{ 'has-error': errors.email }"
              placeholder="Введите ваш email"
            />
            <div class="error-message" v-if="errors.email">{{ errors.email }}</div>
          </div>

          <div class="form-group">
            <label for="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              v-model="formData.phone"
              class="form-control"
              :class="{ 'has-error': errors.phone }"
              placeholder="+996 XXX XXXXXX"
            />
            <div class="error-message" v-if="errors.phone">{{ errors.phone }}</div>
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              class="form-control"
              :class="{ 'has-error': errors.password }"
              placeholder="Минимум 6 символов"
            />
            <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Подтверждение пароля</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="formData.confirmPassword"
              class="form-control"
              :class="{ 'has-error': errors.confirmPassword }"
              placeholder="Повторите пароль"
            />
            <div class="error-message" v-if="errors.confirmPassword">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <!-- Пользовательское соглашение -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.termsAccepted" />
              <span class="checkbox-text">
                Я согласен с <a href="#" class="terms-link">условиями использования</a> и
                <a href="#" class="terms-link">политикой конфиденциальности</a>
              </span>
            </label>
            <div class="error-message" v-if="errors.termsAccepted">
              {{ errors.termsAccepted }}
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
            </button>
          </div>

          <!-- Google auth button -->
          <div class="social-login">
            <div class="divider">
              <span>или</span>
            </div>
            <GoogleSignIn :isRegister="true" />
          </div>

          <div class="login-link">
            Уже есть аккаунт? <router-link to="/login">Войти</router-link>
          </div>
        </form>

        <!-- Ошибка "redirect_uri_mismatch" с инструкциями по исправлению -->
        <div v-if="showRedirectError" class="oauth-error-container">
          <div class="oauth-error-card">
            <div class="oauth-error-header">
              <h3>Ошибка настройки Google OAuth</h3>
              <button class="close-btn" @click="hideGoogleOAuthInstructions">&times;</button>
            </div>
            <div class="oauth-error-content">
              <p>
                <strong>Проблема:</strong> Ошибка "redirect_uri_mismatch" возникает, когда URI
                перенаправления не настроен корректно в Google Cloud Console.
              </p>

              <div class="error-details">
                <p>
                  Текущий URI перенаправления: <code>{{ currentOrigin }}</code>
                </p>
              </div>

              <h4>Шаги для исправления:</h4>
              <ol>
                <li>
                  Откройте
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank"
                    >Google Cloud Console</a
                  >
                </li>
                <li>Найдите и выберите ваш проект</li>
                <li>Перейдите в раздел "Credentials" (Учетные данные)</li>
                <li>Найдите и отредактируйте ваш OAuth 2.0 Client ID</li>
                <li>
                  В разделе "Authorized redirect URIs" добавьте следующие URI:
                  <ul>
                    <li>
                      <code>{{ currentOrigin }}</code>
                    </li>
                    <li>
                      <code>{{ currentOrigin }}/</code>
                    </li>
                    <li>
                      <code>{{ currentOrigin }}/login</code>
                    </li>
                    <li>
                      <code>{{ currentOrigin }}/register</code>
                    </li>
                    <li>
                      <code>{{ currentOrigin }}/dashboard</code>
                    </li>
                  </ul>
                </li>
                <li>Нажмите "Save" (Сохранить)</li>
                <li>Изменения могут вступить в силу через несколько минут</li>
              </ol>

              <p class="note">
                Примечание: Если вы используете локальную разработку, также добавьте URIs для других
                портов (например, http://localhost:3000, http://localhost:5173 и т.д.)
              </p>

              <div class="oauth-error-actions">
                <button class="btn btn-primary" @click="hideGoogleOAuthInstructions">
                  Понятно
                </button>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  class="btn btn-outline"
                  >Открыть Google Cloud Console</a
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Ссылка для показа инструкций по настройке Google OAuth -->
        <div class="oauth-help">
          <button class="text-link" @click="showGoogleOAuthInstructions">
            Проблемы с регистрацией через Google? Нажмите здесь
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-view {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.register-container {
  max-width: 600px;
  margin: 0 auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.register-header p {
  color: var(--text-color);
}

.user-type-selector {
  display: flex;
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.user-type-btn {
  flex: 1;
  padding: 12px;
  text-align: center;
  background: var(--card-bg);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  color: var(--text-color);
}

.user-type-btn.active {
  background-color: var(--primary-color);
  color: white;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Стили для загрузки фото */
.profile-photo-upload {
  margin-bottom: 10px;
}

.photo-upload-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.photo-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: 1px solid var(--border-color);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  font-size: 40px;
  color: #ccc;
}

.remove-photo {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
}

.remove-photo:hover {
  background: rgba(255, 0, 0, 0.9);
}

.photo-upload-controls {
  flex: 1;
}

.upload-btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.upload-btn i {
  margin-right: 6px;
}

.upload-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
}

.photo-input {
  display: none;
}

.photo-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.photo-error {
  color: var(--danger-color);
  font-size: 14px;
  margin-top: 8px;
}

.social-login {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 10px 0;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 15px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.divider span {
  padding: 0 10px;
  color: var(--text-secondary);
  font-size: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.checkbox-group {
  margin: 10px 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  margin-top: 3px;
}

.checkbox-text {
  font-size: 14px;
  color: var(--text-color);
}

.terms-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
}

.form-control {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
  color: var(--text-color);
}

.form-control::placeholder {
  color: #777777;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(62, 104, 255, 0.1);
}

.form-control.has-error {
  border-color: var(--danger-color);
}

.error-message {
  color: var(--danger-color);
  font-size: 14px;
  padding: 8px 12px;
  margin-top: 5px;
  background-color: rgba(255, 0, 0, 0.05);
  border-radius: 4px;
  border-left: 3px solid var(--danger-color);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  color: var(--text-secondary);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

.oauth-help {
  text-align: center;
  margin-top: 15px;
}

.text-link {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
}

.text-link:hover {
  color: var(--primary-hover);
}

@media (max-width: 600px) {
  .register-container {
    padding: 30px 20px;
    margin: 0 20px;
  }

  .photo-upload-container {
    flex-direction: column;
    align-items: center;
  }

  .photo-upload-controls {
    text-align: center;
    width: 100%;
  }

  .register-card {
    margin: 20px;
    max-width: none;
  }

  .oauth-error-card {
    max-height: 85vh;
  }

  .oauth-error-actions {
    flex-direction: column;
  }
}

/* Стили для ошибки OAuth */
.oauth-error-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.oauth-error-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.oauth-error-header {
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
}

.oauth-error-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #721c24;
  cursor: pointer;
}

.oauth-error-content {
  padding: 20px;
  color: var(--text-color);
}

.error-details {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
  color: var(--text-color);
}

.oauth-error-content h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: var(--text-color);
}

.oauth-error-content ol {
  padding-left: 20px;
  color: var(--text-color);
}

.oauth-error-content ol li {
  margin-bottom: 8px;
}

.oauth-error-content ul {
  margin-top: 8px;
  color: var(--text-color);
}

.oauth-error-content code {
  background-color: #f0f0f0;
  padding: 3px 6px;
  border-radius: 3px;
  font-family: monospace;
  word-break: break-all;
}

.note {
  font-style: italic;
  color: #6c757d;
  margin-top: 15px;
}

.oauth-error-actions {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 20px;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: rgba(62, 104, 255, 0.1);
}

/* Dark mode form label override */
[data-theme='dark'] .form-group label,
[data-theme='dark'] label.checkbox-label,
[data-theme='dark'] .checkbox-text {
  color: #000000;
}
</style>
