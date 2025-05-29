import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n } from './utils/i18n'
import { applyTheme, getPreferredTheme } from './utils/theme'

// Apply theme early to prevent flash of wrong theme
applyTheme(getPreferredTheme())

// Глобальный обработчик ошибок для игнорирования ошибок расширений Chrome
window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('runtime.lastError') ||
      event.message.includes('Extension context invalidated') ||
      event.message.includes('message channel closed'))
  ) {
    console.log('Игнорируем ошибку расширения Chrome:', event.message)
    event.preventDefault() // Предотвращаем распространение ошибки
    return false
  }
})

const app = createApp(App)

// Глобальный обработчик ошибок Vue
app.config.errorHandler = (err, instance, info) => {
  if (
    err instanceof Error &&
    (err.message.includes('runtime.lastError') ||
      err.message.includes('Extension context invalidated') ||
      err.message.includes('message channel closed'))
  ) {
    console.log('Игнорируем ошибку расширения Chrome в компоненте Vue:', err.message)
    return
  }
  console.error('Глобальная ошибка Vue:', err, info)
}

app.use(router)
app.use(i18n)
app.mount('#app')
