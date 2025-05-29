<script setup lang="ts">
import { computed } from 'vue'
import { toggleTheme, theme } from '../utils/theme'

// Computed property for the icon to display
const themeIcon = computed(() => {
  return theme.value === 'light' ? 'fa-sun' : 'fa-moon'
})

// Computed property for the title to display on hover
const buttonTitle = computed(() => {
  return theme.value === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'
})
</script>

<template>
  <button @click="toggleTheme" class="theme-btn" :title="buttonTitle">
    <i :class="['fas', themeIcon]"></i>
  </button>
</template>

<style scoped>
.theme-btn {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 8px;
}

.theme-btn:hover {
  background-color: var(--bg-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.theme-btn i {
  font-size: 18px;
}

@media (max-width: 768px) {
  .theme-btn {
    width: 32px;
    height: 32px;
  }

  .theme-btn i {
    font-size: 16px;
  }
}
</style>
