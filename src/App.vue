<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import { useI18n } from 'vue-i18n'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { i18n as i18nInstance } from './utils/i18n'
import { initTheme } from './utils/theme'

// Получаем доступ к i18n
const { t, locale } = useI18n()

// Состояния приложения
const isOnline = ref(navigator.onLine)
const showOfflineMessage = ref(false)

// Инициализируем систему тем
onMounted(() => {
  // Инициализируем тему
  initTheme()

  // Проверяем и очищаем неактуальные данные пользователя
  try {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      
      // Проверяем валидность токена (простая проверка на истечение времени)
      if (user.token && user.token.startsWith('demo_google_token_')) {
        const tokenTimestamp = parseInt(user.token.split('_').pop() || '0')
        const dayInMs = 24 * 60 * 60 * 1000
        const weekAgo = Date.now() - 7 * dayInMs
        
        if (tokenTimestamp < weekAgo) {
          localStorage.removeItem('user')
          console.log('Устаревший демо-токен удален')
        }
      }
      
      // Удаляем старые тестовые аккаунты Google без дополнительной проверки
      if (user.authProvider === 'google' && user.email && user.email.includes('test')) {
        localStorage.removeItem('user')
        console.log('Тестовый пользователь Google был удален')
      }
    }
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error)
    // Если данные пользователя повреждены, удаляем их
    localStorage.removeItem('user')
  }

  // Добавляем слушатели событий
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOfflineStatus)
  window.addEventListener('error', handleGlobalError)
})

// Обработка изменений localStorage
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'preferredLanguage' && event.newValue) {
    if (locale.value !== event.newValue) {
      locale.value = event.newValue
    }
  }
  
  // Обработка удаления пользователя в другой вкладке
  if (event.key === 'user' && event.newValue === null) {
    // Пользователь был разлогинен в другой вкладке
    window.location.reload()
  }
}

// Обработка статуса подключения
const handleOnlineStatus = () => {
  isOnline.value = true
  showOfflineMessage.value = false
  console.log('Приложение онлайн')
}

const handleOfflineStatus = () => {
  isOnline.value = false
  showOfflineMessage.value = true
  console.log('Приложение оффлайн')
  
  // Автоматически скрываем сообщение через 5 секунд
  setTimeout(() => {
    showOfflineMessage.value = false
  }, 5000)
}

// Глобальная обработка ошибок
const handleGlobalError = (event: ErrorEvent) => {
  // Игнорируем ошибки расширений Chrome
  if (
    event.message &&
    (event.message.includes('runtime.lastError') ||
      event.message.includes('Extension context invalidated') ||
      event.message.includes('message channel closed') ||
      event.message.includes('ResizeObserver loop limit exceeded'))
  ) {
    console.log('Игнорируем ошибку расширения/браузера:', event.message)
    event.preventDefault()
    return false
  }
  
  // Обработка ошибок загрузки ресурсов
  if (event.message && event.message.includes('Loading chunk')) {
    console.warn('Ошибка загрузки чанка, рекомендуется обновить страницу')
    // Можно показать пользователю уведомление
  }
  
  // Логируем другие ошибки
  if (event.error) {
    console.error('Глобальная ошибка приложения:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    })
  }
}

// Удаляем слушатели при размонтировании
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('online', handleOnlineStatus)
  window.removeEventListener('offline', handleOfflineStatus)
  window.removeEventListener('error', handleGlobalError)
})

// Получение текущего года
const currentYear = new Date().getFullYear()

// Функция для закрытия оффлайн сообщения
const closeOfflineMessage = () => {
  showOfflineMessage.value = false
}
</script>

<template>
  <!-- Уведомление об оффлайн режиме -->
  <div v-if="showOfflineMessage" class="offline-notification">
    <div class="offline-content">
      <i class="fas fa-wifi-slash"></i>
      <span>{{ t('offline.message', 'Нет подключения к интернету. Работаем в оффлайн режиме.') }}</span>
      <button @click="closeOfflineMessage" class="close-offline">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>

  <Navbar />
  
  <div class="app-container">
    <router-view />
  </div>
  
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-heading tez-jumush-text">TEZ JUMUSH</h3>
          <p class="footer-text">
            Платформа для быстрого поиска работы и надежных работников в Кыргызстане. Найдите
            подходящую работу или сотрудников для ваших задач уже сегодня!
          </p>
        </div>

        <div class="footer-section">
          <h3 class="footer-heading">{{ t('navigation') }}</h3>
          <ul class="footer-links">
            <li>
              <router-link to="/" class="footer-link">
                <i class="fas fa-home"></i> {{ t('home') }}
              </router-link>
            </li>
            <li>
              <router-link to="/jobs" class="footer-link">
                <i class="fas fa-briefcase"></i> {{ t('findJob') }}
              </router-link>
            </li>
            <li>
              <router-link to="/about" class="footer-link">
                <i class="fas fa-info-circle"></i> {{ t('about') }}
              </router-link>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h3 class="footer-heading">{{ t('contacts') }}</h3>
          <ul class="footer-links">
            <li>
              <a href="tel:+996551714547" class="footer-link">
                <i class="fas fa-phone"></i> +996 551 714 547
              </a>
            </li>
            <li>
              <a href="tel:+996556031224" class="footer-link">
                <i class="fas fa-phone"></i> +996 556 031 224
              </a>
            </li>
            <li>
              <a href="mailto:tezjumush.ksla@gmail.com" class="footer-link">
                <i class="fas fa-envelope"></i> tezjumush.ksla@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h3 class="footer-heading">{{ t('socials') }}</h3>
          <div class="social-links">
            <a href="https://t.me/tezJumush" target="_blank" class="social-link" rel="noopener noreferrer">
              <i class="fab fa-telegram"></i> Telegram
            </a>
            <a
              href="https://www.instagram.com/tezjumush.kg?igsh=b3NodHNpcDBrZ2V3&utm_source=qr"
              target="_blank"
              class="social-link"
              rel="noopener noreferrer"
            >
              <i class="fab fa-instagram"></i> Instagram
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">
          &copy; {{ currentYear }} <span class="tez-jumush-text">TEZ JUMUSH</span>.
          {{ t('copyright') }}.
        </p>
        <div class="footer-bottom-links">
          <a href="#" class="footer-link-small">
            <i class="fas fa-file-alt"></i> {{ t('termsOfUse') }}
          </a>
          <span class="footer-divider">|</span>
          <a href="#" class="footer-link-small">
            <i class="fas fa-shield-alt"></i> {{ t('privacyPolicy') }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style>
.app-container {
  min-height: calc(100vh - 280px);
}

.footer {
  background-color: var(--footer-bg);
  color: var(--footer-text);
  padding: var(--spacing-xl) 0 var(--spacing-lg);
  margin-top: var(--spacing-xl);
  transition:
    background-color 0.3s,
    color 0.3s;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-heading {
  color: var(--footer-heading-color);
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: 1.25rem;
  margin-bottom: var(--spacing-md);
  position: relative;
  padding-bottom: var(--spacing-xs);
}

.footer-heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.footer-text {
  color: var(--footer-text);
  font-family: var(--font-family-body);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-family: var(--font-family-body);
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.footer-link:hover {
  color: white;
  transform: translateX(3px);
}

.footer-link i {
  margin-right: var(--spacing-sm);
  width: 20px;
  text-align: center;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.social-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-family: var(--font-family-body);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  padding: var(--spacing-xs) 0;
}

.social-link:hover {
  color: white;
  transform: translateY(-2px);
}

.social-link i {
  margin-right: var(--spacing-sm);
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  padding: var(--spacing-md);
  transition: all 0.3s ease;
}

.social-link:hover i {
  background-color: var(--primary-color);
  transform: scale(1.1);
}

.social-link i.fa-telegram {
  background-color: rgba(0, 136, 204, 0.2);
}

.social-link:hover i.fa-telegram {
  background-color: #0088cc;
}

.social-link i.fa-instagram {
  background-color: rgba(225, 48, 108, 0.2);
}

.social-link:hover i.fa-instagram {
  background-color: #e1306c;
}

.social-link i.fa-facebook-f {
  background-color: rgba(66, 103, 178, 0.2);
}

.social-link:hover i.fa-facebook-f {
  background-color: #4267b2;
}

.social-link i.fa-whatsapp {
  background-color: rgba(37, 211, 102, 0.2);
}

.social-link:hover i.fa-whatsapp {
  background-color: #25d366;
}

.tez-jumush-text {
  color: #0066b3;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.copyright {
  color: rgba(255, 255, 255, 0.5);
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.footer-link-small {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.footer-link-small:hover {
  color: white;
}

.footer-link-small i {
  margin-right: 6px;
}

.footer-divider {
  color: rgba(255, 255, 255, 0.3);
  margin: 0 var(--spacing-xs);
}

@media (max-width: 768px) {
  .footer-content {
    gap: var(--spacing-lg);
  }

  .footer-bottom {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--spacing-sm);
  }

  .footer-bottom-links {
    justify-content: center;
  }
}
</style>
