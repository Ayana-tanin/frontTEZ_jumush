// src/views/LoginView.vue - Обновленная версия с backend интеграцией
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import GoogleSignIn from '@/components/GoogleSignIn.vue'
import { authAPI } from '@/utils/api'

const router = useRouter()
const route = useRoute()

const loginForm = ref({
  email: '',
  password: ''
})

const error = ref('')
const isLoading = ref(false)
const isOnlineMode = ref(false)

// Проверяем доступность backend
onMounted(async () => {
  try {
    await fetch(import.meta.env.VITE_API_URL + '/health')
    isOnlineMode.value = true
    console.log('✅ Backend доступен - используем онлайн режим')
  } catch (e) {
    isOnlineMode.value = false
    console.log('⚠️ Backend недоступен - используем демо режим')
    // Только для демо-режима: тестовые аккаунты
    if (!localStorage.getItem('demoUsers')) {
      const demoUsers = [
        {
          email: 'worker@example.com',
          password: 'password123',
          userType: 'worker',
          name: 'Иван Рабочий',
          phone: '+996 555 123456',
          token: 'demo_worker_token'
        },
        {
          email: 'employer@example.com',
          password: 'password123',
          userType: 'employer',
          name: 'Алексей Работодатель',
          phone: '+996 700 654321',
          token: 'demo_employer_token'
        }
      ]
      localStorage.setItem('demoUsers', JSON.stringify(demoUsers))
    }
  }
})

// Онлайн вход через backend
async function handleOnlineLogin() {
  try {
    const response = await authAPI.login({
      email: loginForm.value.email,
      password: loginForm.value.password
    })
    const userData = {
      ...response.data.user,
      token: response.data.token
    }
    localStorage.setItem('user', JSON.stringify(userData))
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (err: any) {
    console.error('Login error:', err)
    if (err.response?.data?.error) {
      error.value = err.response.data.error
    } else {
      error.value = 'Ошибка подключения к серверу'
    }
  }
}

// Демо вход для оффлайн режима
function handleDemoLogin() {
  const usersData = localStorage.getItem('demoUsers') || '[]'
  const users = JSON.parse(usersData)
  const foundUser = users.find(
    (user: any) =>
      user.email === loginForm.value.email &&
      user.password === loginForm.value.password
  )
  if (foundUser) {
    localStorage.setItem('user', JSON.stringify(foundUser))
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } else {
    error.value = 'Неверный email или пароль'
  }
}

// Основная функция входа
async function handleLogin() {
  isLoading.value = true
  error.value = ''

  if (!loginForm.value.email || !loginForm.value.password) {
    error.value = 'Пожалуйста, заполните все поля'
    isLoading.value = false
    return
  }

  try {
    if (isOnlineMode.value) {
      await handleOnlineLogin()
    } else {
      // Имитация задержки для демо режима
      await new Promise(resolve => setTimeout(resolve, 500))
      handleDemoLogin()
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Произошла ошибка при входе'
  } finally {
    isLoading.value = false
  }
}

function handleRegister() {
  router.push('/register')
}
</script>

<template>
  <div class="login-view">
    <div class="container">
      <div class="login-container">
        <div class="login-header">
          <h1>Вход в систему</h1>
          <p>Войдите в систему, чтобы получить доступ к вакансиям</p>
          
          <!-- Индикатор режима работы -->
          <div class="mode-indicator" :class="{ online: isOnlineMode, demo: !isOnlineMode }">
            <i :class="isOnlineMode ? 'fas fa-cloud' : 'fas fa-laptop'"></i>
            {{ isOnlineMode ? 'Онлайн режим' : 'Демо режим' }}
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="loginForm.email"
              class="form-control"
              placeholder="Введите ваш email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <input
              type="password"
              id="password"
              v-model="loginForm.password"
              class="form-control"
              placeholder="Введите ваш пароль"
              required
            />
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="login-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? 'Вход...' : 'Войти' }}
            </button>

            <button
              type="button"
              class="btn btn-outline"
              @click="handleRegister"
              :disabled="isLoading"
            >
              Регистрация
            </button>
          </div>

          <!-- Google auth -->
          <div class="social-login">
            <div class="divider">
              <span>или</span>
            </div>
            <GoogleSignIn />
          </div>

          <!-- Демо-аккаунты -->
          <div v-if="!isOnlineMode" class="demo-accounts">
            <div class="demo-accounts-title">Тестовые аккаунты:</div>
            <div class="demo-account">
              <div><strong>Работник:</strong> worker@example.com</div>
              <div><strong>Пароль:</strong> password123</div>
            </div>
            <div class="demo-account">
              <div><strong>Работодатель:</strong> employer@example.com</div>
              <div><strong>Пароль:</strong> password123</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Предыдущие стили + новые для индикатора режима */

.mode-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 10px;
}

.mode-indicator.online {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.mode-indicator.demo {
  background-color: #fff3e0;
  color: #f57c00;
  border: 1px solid #ffcc02;
}

.mode-indicator i {
  font-size: 14px;
}

/* Остальные стили остаются прежними */
.login-view {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.login-container {
  max-width: 500px;
  margin: 0 auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.login-header p {
  color: var(--text-color);
}

/* Стили для блока социального входа */
.social-login {
  margin-top: 20px;
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
  border-bottom: 1px solid #e0e0e0;
}

.divider span {
  padding: 0 15px;
  font-size: 14px;
  color: #757575;
  background: #fff;
}

/* Улучшение внешнего вида демо-аккаунтов */
.demo-accounts {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px dashed #ddd;
}

.demo-accounts-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #555;
  font-size: 14px;
}

.demo-account {
  padding: 8px;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  border: 1px solid #eee;
}

.demo-account:last-child {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: var(--primary-color);
  outline: none;
}

.error-message {
  color: var(--danger-color);
  margin: 10px 0;
  padding: 10px;
  background-color: #fff0f0;
  border-radius: 4px;
  font-size: 14px;
}

.login-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-light);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>