/**
 * Утилита для проверки настройки Google аутентификации
 * Запустите эту функцию в консоли браузера для проверки настроек
 */

interface GoogleSetupCheckResult {
  clientIdConfigured: boolean
  googleApiLoaded: boolean
  googleAccountsApiAvailable: boolean
  googleIdApiAvailable: boolean
  containersFound: boolean
  buttonsRendered: boolean
}

// Объявляем тип для window.google
declare global {
  interface Window {
    google?: any;
    checkGoogleSetup?: () => GoogleSetupCheckResult;
  }
}

export function checkGoogleSetup(): GoogleSetupCheckResult {
  console.group('Проверка настройки Google аутентификации')

  // Проверяем Client ID
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  console.log('Client ID из переменных окружения:', clientId || 'Не найден в переменных окружения')

  // Проверяем наличие Google API
  console.log('Google API загружен:', !!window.google)

  // Проверяем наличие объекта accounts
  console.log('Google accounts API доступен:', !!(window.google && window.google.accounts))

  // Проверяем наличие метода initialize
  console.log(
    'Google accounts.id API доступен:',
    !!(window.google && window.google.accounts && window.google.accounts.id),
  )

  // Проверяем наличие контейнеров для кнопок
  const googleBtnContainers = document.querySelectorAll('.g-signin-button')
  console.log(`Найдено контейнеров для кнопок Google: ${googleBtnContainers.length}`)

  // Проверяем наличие отрендеренных кнопок
  const googleBtns = document.querySelectorAll('[role="button"][data-is-signin-button="true"]')
  console.log(`Найдено отрендеренных кнопок Google: ${googleBtns.length}`)

  // Помощь по устранению проблем
  if (!clientId) {
    console.warn('ПРОБЛЕМА: Client ID не настроен в переменных окружения')
    console.log(
      'РЕШЕНИЕ: Добавьте VITE_GOOGLE_CLIENT_ID в файл .env.local или используйте hardcoded значение в googleAuth.ts',
    )
  }

  if (!window.google) {
    console.warn('ПРОБЛЕМА: Google API не загружен')
    console.log(
      'РЕШЕНИЕ: Проверьте, что функция loadGoogleScript успешно выполнилась и скрипт был добавлен в DOM',
    )
  }

  if (googleBtnContainers.length === 0) {
    console.warn('ПРОБЛЕМА: Контейнеры для кнопок Google не найдены в DOM')
    console.log(
      'РЕШЕНИЕ: Добавьте элементы с классом g-signin-button в компоненты, где нужны кнопки Google',
    )
  }

  if (googleBtnContainers.length > 0 && googleBtns.length === 0) {
    console.warn('ПРОБЛЕМА: Кнопки Google не отрендерились, хотя контейнеры есть')
    console.log('РЕШЕНИЕ: Проверьте, что метод renderButton вызывается и не вызывает ошибок')
  }

  console.groupEnd()

  return {
    clientIdConfigured: !!clientId,
    googleApiLoaded: !!window.google,
    googleAccountsApiAvailable: !!(window.google && window.google.accounts),
    googleIdApiAvailable: !!(window.google && window.google.accounts && window.google.accounts.id),
    containersFound: googleBtnContainers.length > 0,
    buttonsRendered: googleBtns.length > 0,
  }
}

// Добавляем функцию в window для удобного вызова из консоли
if (typeof window !== 'undefined') {
  window.checkGoogleSetup = checkGoogleSetup
}
