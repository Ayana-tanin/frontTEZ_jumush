import { useI18n } from 'vue-i18n'

export function useFormatters() {
  const { locale } = useI18n()
  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (locale.value === 'kg') {
      const months = [
        'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
        'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
      ]
      const day = dateObj.getDate()
      const month = months[dateObj.getMonth()]
      const year = dateObj.getFullYear()
      return `${day} ${month} ${year}`
    }
    return dateObj.toLocaleDateString('ru-RU')
  }
  const formatCurrency = (amount: number): string => {
    return `${amount} сом`
  }
  return { formatDate, formatCurrency }
} 