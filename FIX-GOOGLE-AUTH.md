# Исправление ошибки Cross-Origin при авторизации через Google

Сообщение об ошибке `Cross-Origin-Opener-Policy policy would block the window.postMessage call` возникает из-за политик безопасности браузера, которые блокируют взаимодействие между окнами с разными доменами.

## 1. Проверьте настройки в Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите ваш проект
3. Перейдите в раздел "APIs & Services" > "Credentials"
4. Найдите и выберите ваш OAuth 2.0 Client ID
5. В разделе "Authorized JavaScript origins" убедитесь, что добавлены **ВСЕ** домены, которые вы используете:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `http://localhost:5173`
   - `http://127.0.0.1:3000`
   - `http://127.0.0.1:3001`
   - `http://127.0.0.1:5173`
   - Фактический URL вашего приложения в интернете (если есть)

## 2. Измените режим проверки CORS для локальной разработки

При локальной разработке можно использовать режим "dev" для Vite с дополнительными настройками:

1. Измените файл `vite.config.ts`:

```js
export default defineConfig({
  // другие настройки...
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  }
})
```

## 3. Используйте One Tap вместо Pop-up авторизации

В компоненте GoogleSignIn.vue можно изменить способ авторизации:

```js
window.google.accounts.id.initialize({
  client_id: clientId,
  callback: handleCredentialResponse,
  auto_select: false,
  cancel_on_tap_outside: true
});

// Использовать вместо renderButton для решения проблем с окнами
window.google.accounts.id.prompt(); 
```

## 4. Обход через локальное хранилище

В исключительных случаях можно использовать localStorage для передачи данных между страницами вместо postMessage.

## 5. Проверьте настройку HTTPS

Google OAuth требует правильно настроенного HTTPS для production-окружений. В локальной среде это не всегда требуется, но может вызывать проблемы в некоторых случаях.

---

Попробуйте эти подходы в указанном порядке. Первый шаг (настройка Google Cloud Console) обычно решает большинство проблем. 