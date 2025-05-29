<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { switchLanguage } from '../utils/i18n'
import type { TranslationLanguages } from '../utils/i18n'
import { useRouter } from 'vue-router'

const { locale } = useI18n()
const router = useRouter()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const languages = [
  { code: 'ru', name: 'Русский', flag: 'flag-ru' },
  { code: 'kg', name: 'Кыргызча', flag: 'flag-kg' }
]

const currentLocale = computed(() => locale.value)
const currentLang = computed(() => languages.find(lang => lang.code === currentLocale.value))
const currentFlag = computed(() => currentLang.value?.flag)
const currentLangName = computed(() => currentLang.value?.name)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectLanguage = (langCode: TranslationLanguages) => {
  if (langCode !== currentLocale.value) {
    switchLanguage(langCode)
    // Обновить URL с новым языком
    const currentPath = router.currentRoute.value.path.replace(/^\/(ru|kg)/, '')
    router.push(`/${langCode}${currentPath}`)
  }
  closeDropdown()
}

// Хоткей Ctrl+Shift+L
const handleKeypress = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
    event.preventDefault()
    const nextLang = (currentLocale.value === 'ru' ? 'kg' : 'ru') as TranslationLanguages
    selectLanguage(nextLang)
  }
}

// Обработчик клика вне компонента
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeypress)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeypress)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="language-selector" ref="dropdownRef">
    <button @click="toggleDropdown" class="lang-trigger">
      <span :class="['flag', currentFlag]"></span>
      <span class="lang-name">{{ currentLangName }}</span>
      <i class="fas fa-chevron-down"></i>
    </button>
    <div v-if="isOpen" class="lang-dropdown">
      <button v-for="lang in languages" :key="lang.code" @click="() => selectLanguage(lang.code as TranslationLanguages)" class="lang-option" :class="{ active: lang.code === currentLocale }">
        <span :class="['flag', lang.flag]"></span>
        <span class="lang-name">{{ lang.name }}</span>
        <span v-if="lang.code === currentLocale" class="checkmark">✓</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.language-selector {
  position: relative;
  display: inline-block;
}
.lang-trigger {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.flag {
  width: 18px;
  height: 12px;
  display: inline-block;
  background-size: cover;
  background-position: center;
  border-radius: 2px;
}
.flag-ru {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6"><rect fill="white" width="9" height="2"/><rect fill="blue" y="2" width="9" height="2"/><rect fill="red" y="4" width="9" height="2"/></svg>');
}
.flag-kg {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 18"><rect fill="%23FF0000" width="30" height="18"/><circle cx="15" cy="9" r="4.5" fill="%23FFCC00"/><circle cx="15" cy="9" r="3.6" fill="%23FF0000"/><g fill="%23FFCC00"><path d="M15,5.4 L15.5,9 L19,9 L16.2,11.3 L17.2,14.6 L15,12.5 L12.8,14.6 L13.8,11.3 L11,9 L14.5,9 z"/><path d="M9.5,9 a5.5,5.5 0 1,0 11,0 a5.5,5.5 0 1,0 -11,0 M10.5,9 a4.5,4.5 0 1,0 9,0 a4.5,4.5 0 1,0 -9,0"/></g></svg>');
}
.lang-dropdown {
  position: absolute;
  top: 110%;
  left: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  min-width: 120px;
  z-index: 10;
  padding: 6px 0;
}
.lang-option {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 15px;
}
.lang-option.active {
  background: var(--primary-color);
  color: white;
}
.checkmark {
  margin-left: auto;
  color: var(--success-color);
}
</style>
