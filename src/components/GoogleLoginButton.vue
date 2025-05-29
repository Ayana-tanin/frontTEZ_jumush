<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { initGoogleAuth } from '../utils/googleAuth'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

// Определяем тип для данных пользователя
interface UserInfo {
  id: string
  email: string
  name: string
  fullName: string
  picture: string
  authProvider: string
  userType: string
}

const { t } = useI18n()
const route = useRoute()
const authStatus = ref('Ожидание инициализации...')
const isDev = ref(import.meta.env.DEV || false)
const userInfo = ref<UserInfo | null>(null)

// Определяем текст для логирования в зависимости от текущего маршрута
const authType = computed(() => {
  return route.path === '/register' ? 'регистрации' : 'входа'
})

// Функция для проверки статуса аутентификации
function checkAuthStatus() {
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      userInfo.value = userData
      authStatus.value = 'Авторизован'
      console.log('Пользователь авторизован:', userData)
    } catch (e) {
      authStatus.value = 'Ошибка данных пользователя'
      userInfo.value = null
      console.error('Ошибка при парсинге данных пользователя:', e)
    }
  } else {
    authStatus.value = 'Не авторизован'
    userInfo.value = null
    console.log('Пользователь не авторизован')
  }
}

// Инициализация Google Auth при монтировании компонента
onMounted(() => {
  // Выводим текущий URL для отладки
  console.log('Текущий URL приложения:', window.location.origin)
  console.log('Полный путь:', window.location.href)
  console.log('Маршрут для GoogleLoginButton:', route.path)
  console.log('Тип аутентификации:', route.path.includes('/register') ? 'регистрация' : 'вход')

  // Проверяем текущий статус авторизации
  checkAuthStatus()

  console.log(`GoogleLoginButton компонент смонтирован для ${authType.value}`)
  authStatus.value = 'Инициализация Google Auth...'

  // Обработка ошибок Chrome extensions
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('runtime.lastError')) {
      console.log('Игнорируем ошибку Chrome extensions:', event.message)
      event.preventDefault() // Предотвращаем распространение ошибки
    }
  })

  // Добавляем небольшую задержку перед инициализацией Google Auth
  // Это дает DOM время полностью загрузиться
  setTimeout(() => {
    initGoogleAuth()
      .then(() => {
        authStatus.value = 'Google Auth инициализирован'
        console.log('Google Auth успешно инициализирован')
      })
      .catch((err) => {
        authStatus.value = 'Ошибка инициализации Google Auth'
        console.error('Ошибка в initGoogleAuth:', err)

        // Попробуем еще раз через большую задержку, если первая попытка не удалась
        setTimeout(() => {
          console.log('Повторная попытка инициализации Google Auth...')
          initGoogleAuth()
            .then(() => console.log('Повторная инициализация Google Auth успешна'))
            .catch((e) => console.error('Повторная инициализация Google Auth не удалась:', e))
        }, 2000)
      })
  }, 1000)

  // Отслеживаем изменения авторизации
  window.addEventListener('storage', (event) => {
    if (event.key === 'user') {
      console.log('Изменение статуса авторизации')
      checkAuthStatus()
    }
  })
})
</script>

<template>
  <div class="auth-container">
    <!-- Container for Google's rendered button -->
    <div class="g-signin-button"></div>

    <!-- Debug info (в более компактном виде) -->
    <div v-if="isDev" class="auth-status" :class="{ 'auth-status-success': userInfo }">
      <div v-if="!userInfo" class="status-text">{{ authStatus }}</div>
      <div v-else class="user-info">
        <div class="status-badge">✓</div>
        <div class="user-name">{{ userInfo.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 15px 0;
}

/* Стили для контейнера кнопки Google */
.g-signin-button {
  width: 100%;
  max-width: 320px; /* Ограничиваем максимальную ширину для лучшего вида */
  min-height: 42px; /* Минимальная высота для контейнера */
  display: flex;
  justify-content: center;
}

/* Статус аутентификации для отладки */
.auth-status {
  margin-top: 6px;
  font-size: 10px;
  color: var(--text-color);
  text-align: center;
  padding: 3px 6px;
  border-radius: 3px;
  background-color: #f5f5f5;
  max-width: 180px;
  width: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid #e0e0e0;
}

.auth-status-success {
  background-color: #e8f5e9;
  border-color: #a5d6a7;
}

.status-text {
  font-style: italic;
  color: var(--text-color);
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.status-badge {
  color: #4caf50;
  font-weight: bold;
}

.user-name {
  color: var(--text-color);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Стилизуем отрендеренную Google кнопку */
:global([role='button'][data-is-signin-button='true']) {
  width: 100% !important;
  max-width: 320px !important;
  margin: 0 auto !important;
  height: 42px !important;
  border-radius: 4px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12) !important;
  transition: box-shadow 0.3s ease !important;
}

:global([role='button'][data-is-signin-button='true']:hover) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
}

@media (max-width: 768px) {
  .auth-container {
    margin: 10px 0;
  }

  .g-signin-button {
    max-width: 280px; /* Чуть меньше на мобильных */
  }

  .auth-status {
    max-width: 150px;
    font-size: 9px;
  }

  .user-name {
    max-width: 120px;
  }
}
</style>
