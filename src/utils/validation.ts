import { useI18n } from 'vue-i18n'

export function useValidation() {
  const { t } = useI18n()
  const validatePhone = (phone: string): string => {
    if (!phone) return t('errors.enterPhone')
    const kgPhoneRegex = /^\+?996\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/
    if (!kgPhoneRegex.test(phone.replace(/\s/g, ''))) {
      return t('errors.invalidPhoneFormat')
    }
    return ''
  }
  const validateEmail = (email: string): string => {
    if (!email) return t('errors.enterEmail')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return t('errors.invalidEmailFormat')
    }
    return ''
  }
  return { validatePhone, validateEmail }
} 