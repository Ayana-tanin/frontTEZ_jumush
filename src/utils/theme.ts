import { ref } from 'vue'

type ThemeType = 'light' | 'dark'

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined'

// State to track current theme
const currentTheme = ref<ThemeType>(getPreferredTheme())

// Function to get the preferred theme from localStorage or system preference
export function getPreferredTheme(): ThemeType {
  if (!isBrowser) return 'light' // Default for SSR

  // Check localStorage first
  const savedTheme = localStorage.getItem('preferredTheme') as ThemeType
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  // Default to light theme
  return 'light'
}

// Function to toggle between light and dark theme
export function toggleTheme() {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'

  // Update state
  currentTheme.value = newTheme

  // Save to localStorage
  if (isBrowser) {
    localStorage.setItem('preferredTheme', newTheme)
  }

  // Apply theme to document
  applyTheme(newTheme)
}

// Function to apply theme to document
export function applyTheme(theme: ThemeType) {
  if (!isBrowser) return // Skip for SSR

  document.documentElement.setAttribute('data-theme', theme)
}

// Function to initialize theme on app start
export function initTheme() {
  if (!isBrowser) return // Skip for SSR

  // Apply the current theme
  applyTheme(currentTheme.value)

  // Listen for system preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('preferredTheme')) {
        const newTheme = e.matches ? 'dark' : 'light'
        currentTheme.value = newTheme
        applyTheme(newTheme)
      }
    })
  }
}

// Export reactive current theme for components to use
export const theme = currentTheme
