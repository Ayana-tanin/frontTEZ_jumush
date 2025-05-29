// Утилиты для работы с аутентификацией Google
import { ref } from 'vue'

// Глобальное состояние для хранения данных аутентифицированного пользователя
export const currentUser = ref<any>(null)

// Получаем текущее origin приложения для использования в редиректах
const appOrigin = window.location.origin

// Конфигурация Google OAuth
export const googleConfig = {
  clientId:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '655912811217-9dvofthoehrkkgp547dltgb9qb8tnckr.apps.googleusercontent.com', // Получаем ID из переменных окружения или используем предоставленный ID
  scope: 'email profile',
  // Добавляем origin для отладки проблем с redirect_uri_mismatch
  redirectUri: appOrigin,
}

// Отладочная информация
console.log('Application Origin:', appOrigin)
console.log('Google Client ID:', googleConfig.clientId)
console.log('Redirect URI (should be allowed in Google Console):', googleConfig.redirectUri)
console.log('Environment VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)

// Загружаем скрипт Google API
export function loadGoogleScript(): Promise<void> {
  console.log('Загружаем Google API скрипт...')
  return new Promise((resolve, reject) => {
    // Проверяем, загружен ли уже скрипт Google API
    if (document.getElementById('google-api-script')) {
      console.log('Google API скрипт уже загружен')
      resolve()
      return
    }

    // Создаем скрипт для загрузки Google API
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.id = 'google-api-script'
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('Google API скрипт успешно загружен')
      resolve()
    }
    script.onerror = (error) => {
      console.error('Ошибка загрузки Google API скрипта:', error)
      reject(new Error(`Не удалось загрузить скрипт Google API: ${error}`))
    }

    document.head.appendChild(script)
    console.log('Google API скрипт добавлен в DOM')
  })
}

// Инициализируем Google Sign-In
export async function initGoogleAuth(): Promise<void> {
  console.log('Начинаем инициализацию Google Auth...')
  try {
    // Загружаем скрипт Google API
    await loadGoogleScript()
    console.log('Скрипт Google API загружен, проверяем наличие window.google:', !!window.google)
    console.log('Client ID для инициализации:', googleConfig.clientId)
    console.log('Текущий URL:', window.location.href)

    // Инициализируем Google Identity Services
    if (window.google && googleConfig.clientId) {
      console.log('Инициализация Google Identity Services...')

      try {
        // Инициализируем кнопку входа
        window.google.accounts.id.initialize({
          client_id: googleConfig.clientId,
          callback: handleCredentialResponse,
          auto_select: false, // Отключаем автоматический выбор учетной записи
          cancel_on_tap_outside: true, // Закрываем окно при нажатии вне его
        })

        // Отображаем кнопку Google, если она есть в DOM
        const googleBtnContainers = document.querySelectorAll('.g-signin-button')
        if (googleBtnContainers.length > 0) {
          console.log(`Найдено ${googleBtnContainers.length} контейнеров для кнопки Google`)

          // Определяем тип кнопки на основе текущего URL
          const isRegisterPage = window.location.pathname.includes('/register')
          const buttonText = isRegisterPage ? 'signup_with' : 'signin_with'
          console.log(
            `Используем текст кнопки: ${buttonText} на странице: ${window.location.pathname}`,
          )

          googleBtnContainers.forEach((container, index) => {
            try {
              // Очищаем контейнер перед рендерингом кнопки
              container.innerHTML = ''

              window.google.accounts.id.renderButton(container, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: buttonText,
                shape: 'rectangular',
                logo_alignment: 'center',
                locale: 'ru',
                width: 320, // Используем числовое значение вместо процентов
              })
              console.log(
                `Кнопка Google успешно отображена в контейнере #${index} с текстом "${buttonText}"`,
              )
            } catch (renderErr) {
              console.error(`Ошибка отображения кнопки Google в контейнере #${index}:`, renderErr)
            }
          })

          // Добавим сообщение о необходимости настройки OAuth в случае ошибок
          const errorMessage = document.createElement('div')
          errorMessage.style.display = 'none'
          errorMessage.style.color = 'red'
          errorMessage.style.fontSize = '12px'
          errorMessage.style.marginTop = '8px'
          errorMessage.style.textAlign = 'center'
          errorMessage.innerHTML = `
            Если возникает ошибка "redirect_uri_mismatch", необходимо добавить 
            <strong>${window.location.origin}</strong> в список разрешенных URI 
            в <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console</a>.
          `

          // Добавляем сообщение под первый контейнер с кнопкой
          if (googleBtnContainers[0]) {
            googleBtnContainers[0].parentNode?.appendChild(errorMessage)
          }

          // Автоматическая проверка на ошибку "redirect_uri_mismatch"
          window.addEventListener('error', (event) => {
            if (event.message && event.message.includes('redirect_uri_mismatch')) {
              errorMessage.style.display = 'block'
            }
          })
        } else {
          console.log('Контейнеры для кнопки Google не найдены в DOM')
        }

        console.log('Google Identity Services успешно инициализирован')

        // Попробуем также запустить автоматически один промпт для повышения шансов авторизации
        setTimeout(() => {
          try {
            window.google.accounts.id.prompt((notification: any) => {
              console.log('Запущен автоматический prompt:', notification)
            })
          } catch (e) {
            console.error('Ошибка при запуске автоматического prompt:', e)
          }
        }, 1000)
      } catch (error) {
        console.error('Ошибка при инициализации Google Identity Services:', error)
      }
    } else {
      console.error(
        'Google API не загружен или clientId не указан. Google API загружен:',
        !!window.google,
        'Client ID указан:',
        !!googleConfig.clientId,
      )
    }
  } catch (error) {
    console.error('Ошибка при инициализации Google Auth:', error)
  }
}

// Обработчик ответа от Google
function handleCredentialResponse(response: any) {
  console.log('Получен ответ от Google:', response)

  try {
    // Обрабатываем JWT токен от Google
    if (response && response.credential) {
      try {
        // Декодируем JWT токен (простой вариант без библиотеки)
        const payload = JSON.parse(atob(response.credential.split('.')[1]))
        console.log('Декодированные данные пользователя:', payload)

        // Получаем информацию о текущей странице (регистрация или вход)
        const isRegisterPage = window.location.pathname.includes('/register')
        console.log('Текущая страница - регистрация:', isRegisterPage)

        // Сохраняем пользователя
        const user = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          fullName: payload.name,
          picture: payload.picture,
          photo: payload.picture, // Добавляем фото в формате photo для совместимости
          authProvider: 'google',
          userType: 'worker', // По умолчанию - работник
          age: 0, // Default value, can be updated in profile
          hasOtherJobs: false,
          skills: [],
          experience: '',
          phone: '', // Добавляем пустой телефон по умолчанию
        }

        // Получаем текущий список зарегистрированных пользователей
        const usersData = localStorage.getItem('registeredUsers') || '[]'
        const users = JSON.parse(usersData)

        // Проверяем, существует ли уже пользователь с таким email
        const existingUserIndex = users.findIndex((u: any) => u.email === user.email)

        // Добавляем или обновляем пользователя в registeredUsers
        if (existingUserIndex !== -1) {
          // Если пользователь уже существует, обновляем его данные
          users[existingUserIndex] = {
            ...users[existingUserIndex],
            ...user,
            // Сохраняем пароль, если он был
            password: users[existingUserIndex].password,
          }
          console.log('Обновлены данные существующего пользователя Google в registeredUsers')
        } else {
          // Добавляем нового пользователя с временным паролем (для возможности входа без Google)
          const userWithPassword = {
            ...user,
            password: 'google_' + Math.random().toString(36).substring(2, 15),
          }
          users.push(userWithPassword)
          console.log('Добавлен новый пользователь Google в registeredUsers')
        }

        // Сохраняем обновленный список пользователей
        localStorage.setItem('registeredUsers', JSON.stringify(users))

        // Сохраняем данные в user для текущей сессии
        saveUserToLocalStorage(user)
        currentUser.value = user

        console.log('Перенаправление на dashboard...')

        // Используем безопасное перенаправление с задержкой, чтобы избежать ошибок Chrome extensions
        const baseUrl = window.location.origin
        console.log('Base URL:', baseUrl)

        setTimeout(() => {
          try {
            window.location.href = `${baseUrl}/dashboard`
          } catch (e) {
            console.error('Ошибка при перенаправлении:', e)
            // Запасной вариант, если первый метод не сработал
            window.location.replace(`${baseUrl}/dashboard`)
          }
        }, 100)
      } catch (error) {
        console.error('Ошибка при обработке JWT токена:', error)
        alert('Произошла ошибка при обработке данных от Google. Пожалуйста, попробуйте снова.')
      }
    } else {
      console.error('Не получен credential от Google')
      alert('Не получены данные аутентификации от Google. Пожалуйста, попробуйте снова.')
    }
  } catch (error: any) {
    console.error('Неожиданная ошибка при обработке ответа Google:', error)

    // Проверяем на ошибку redirect_uri_mismatch
    if (error.message && error.message.includes('redirect_uri_mismatch')) {
      const errorDiv = document.createElement('div')
      errorDiv.style.position = 'fixed'
      errorDiv.style.top = '20px'
      errorDiv.style.left = '50%'
      errorDiv.style.transform = 'translateX(-50%)'
      errorDiv.style.backgroundColor = '#f8d7da'
      errorDiv.style.color = '#721c24'
      errorDiv.style.padding = '15px 20px'
      errorDiv.style.borderRadius = '5px'
      errorDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
      errorDiv.style.zIndex = '9999'
      errorDiv.style.maxWidth = '80%'
      errorDiv.style.textAlign = 'center'

      errorDiv.innerHTML = `
        <strong>Ошибка настройки Google OAuth:</strong><br>
        Необходимо добавить <b>${window.location.origin}</b> в список разрешенных Redirect URI<br>
        в Google Cloud Console. <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color: #721c24; text-decoration: underline;">Открыть настройки</a>
      `

      document.body.appendChild(errorDiv)

      setTimeout(() => {
        errorDiv.style.opacity = '0'
        errorDiv.style.transition = 'opacity 0.5s'
        setTimeout(() => document.body.removeChild(errorDiv), 500)
      }, 10000)
    } else {
      alert(
        'Произошла неожиданная ошибка при авторизации через Google. Пожалуйста, попробуйте снова позже или используйте другой способ входа.',
      )
    }
  }
}

// Функция для определения URL для перенаправления после авторизации
function getRedirectUrl(): string {
  // Всегда перенаправляем на dashboard для Google авторизации
  return '/dashboard'
}

// Функция для запуска авторизации через Google - улучшенная реализация
export function signInWithGoogle(): void {
  console.log('Вызвана функция signInWithGoogle')

  try {
    if (!window.google?.accounts?.id) {
      console.warn('Google API не инициализирован при попытке входа, повторная инициализация...')
      // Пробуем инициализировать API Google снова
      initGoogleAuth()
        .then(() => {
          // Повторяем попытку входа после инициализации
          if (window.google?.accounts?.id) {
            console.log('Google API инициализирован, запускаем prompt...')
            try {
              window.google.accounts.id.prompt((notification: any) => {
                console.log(
                  'Отображение Google prompt после повторной инициализации:',
                  notification,
                )
              })
            } catch (e) {
              console.error('Ошибка при вызове prompt после инициализации:', e)
              // Если prompt не сработал, пробуем прямо кликнуть по кнопке
              tryClickGoogleButton()
            }
          } else {
            throw new Error('Google API не удалось инициализировать')
          }
        })
        .catch((err) => {
          console.error('Не удалось инициализировать Google API при попытке входа:', err)
          alert('Ошибка инициализации Google. Пожалуйста, обновите страницу и попробуйте снова.')
        })
      return
    }

    // Если API инициализирован, запускаем окно авторизации
    console.log('Запускаем Google prompt...')
    try {
      window.google.accounts.id.prompt((notification: any) => {
        console.log('Отображение Google prompt:', notification)

        // Если prompt был закрыт или произошла ошибка момента, попробуем еще раз
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn(
            'Google prompt не был отображен или был пропущен:',
            notification.getNotDisplayedReason() || notification.getSkippedReason(),
          )

          // Пробуем кликнуть по видимым кнопкам Google
          tryClickGoogleButton()
        }
      })
    } catch (e) {
      console.error('Ошибка при вызове Google prompt:', e)
      tryClickGoogleButton()
    }
  } catch (error) {
    console.error('Ошибка при вызове Google аутентификации:', error)
    alert(
      'Произошла ошибка при попытке авторизации через Google. Пожалуйста, попробуйте снова позже.',
    )
  }
}

// Вспомогательная функция для клика по кнопке Google
function tryClickGoogleButton(): void {
  try {
    const visibleGoogleBtn = document.querySelector('[role="button"][data-is-signin-button="true"]')
    if (visibleGoogleBtn) {
      console.log('Найдена кнопка Google, инициируем клик')
      // @ts-ignore
      visibleGoogleBtn.click()
    } else {
      console.warn('Кнопка Google не найдена')
      // Последняя попытка - перезагрузить страницу
      window.location.reload()
    }
  } catch (e) {
    console.error('Ошибка при попытке клика по кнопке Google:', e)
  }
}

// Сохраняем пользователя в localStorage
export function saveUserToLocalStorage(user: any): void {
  localStorage.setItem('user', JSON.stringify(user))
}

// Получаем пользователя из localStorage
export function getUserFromLocalStorage(): any {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      return JSON.parse(userData)
    } catch (error) {
      console.error('Ошибка при парсинге данных пользователя:', error)
    }
  }
  return null
}

// Выход из аккаунта
export function logoutUser(): void {
  localStorage.removeItem('user')
  currentUser.value = null

  // Перезагружаем страницу для применения изменений
  window.location.reload()
}

// Объявление глобальных типов для TypeScript
declare global {
  interface Window {
    google?: any;
  }
}
