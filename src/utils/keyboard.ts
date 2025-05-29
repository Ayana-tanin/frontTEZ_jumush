import { onMounted, onUnmounted } from 'vue'
import { switchLanguage } from './i18n'
import type { TranslationLanguages } from './i18n'

export function useKeyboardShortcuts() {
  const handleKeypress = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
      event.preventDefault()
      // Получаем текущий язык из localStorage или используем 'ru' по умолчанию
      const currentLang = localStorage.getItem('locale') as TranslationLanguages || 'ru'
      // Переключаем на другой язык
      const nextLang: TranslationLanguages = currentLang === 'ru' ? 'kg' : 'ru'
      switchLanguage(nextLang)
    }
  }
  onMounted(() => {
    document.addEventListener('keydown', handleKeypress)
  })
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeypress)
  })
} 