import { useI18n } from 'vue-i18n'
import { useHead } from '@vueuse/head'
import { computed } from 'vue'

export function useLocalizedSEO() {
  const { t, locale } = useI18n()
  const setPageMeta = (pageKey: string) => {
    useHead({
      title: computed(() => t(`seo.${pageKey}.title`)),
      meta: [
        { name: 'description', content: computed(() => t(`seo.${pageKey}.description`)) },
        { property: 'og:title', content: computed(() => t(`seo.${pageKey}.title`)) },
        { property: 'og:description', content: computed(() => t(`seo.${pageKey}.description`)) },
        { name: 'language', content: computed(() => locale.value) }
      ]
    })
  }
  return { setPageMeta }
} 