<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const isMenuOpen = ref(false)
const isAuthenticated = ref(false)

// Получаем доступ к i18n
const { t } = useI18n()

// Проверка статуса авторизации
const checkAuth = () => {
  isAuthenticated.value = localStorage.getItem('user') !== null
}

// Проверяем статус авторизации при загрузке компонента
checkAuth()

// Слушаем изменения маршрута для обновления статуса аутентификации
watch(
  () => router.currentRoute.value,
  () => {
    checkAuth()
    // Закрываем мобильное меню при навигации
    isMenuOpen.value = false
  },
)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Имитация выхода из аккаунта
const logout = () => {
  localStorage.removeItem('user')
  isAuthenticated.value = false
  // В реальном приложении здесь будет перенаправление на главную страницу
  window.location.href = '/'
}
</script>

<template>
  <nav class="navbar">
    <div class="container navbar-container">
      <router-link to="/" class="navbar-logo">
        <img src="/img/logo.jpg" alt="Tez Jumush" class="logo-img" />
        <span class="logo-text">TEZ JUMUSH</span>
      </router-link>

      <div class="navbar-menu-toggle" :class="{ 'is-active': isMenuOpen }" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div class="navbar-links" :class="{ 'is-active': isMenuOpen }">
        <router-link to="/about" class="nav-link">
          <i class="fas fa-info-circle"></i> {{ t('about') }}
        </router-link>
        <router-link to="/jobs" class="nav-link">
          <i class="fas fa-briefcase"></i> {{ t('findJob') }}
        </router-link>

        <!-- Ссылки для авторизованных пользователей -->
        <template v-if="isAuthenticated">
          <router-link to="/dashboard" class="nav-link">
            <i class="fas fa-user-circle"></i> {{ t('dashboard') }}
          </router-link>
          <a href="#" @click.prevent="logout" class="nav-link">
            <i class="fas fa-sign-out-alt"></i> {{ t('logout') }}
          </a>
        </template>

        <!-- Ссылки для неавторизованных пользователей -->
        <template v-else>
          <router-link to="/login" class="nav-link">
            <i class="fas fa-sign-in-alt"></i> {{ t('login') }}
          </router-link>
          <router-link to="/register" class="nav-link btn-register">
            <i class="fas fa-user-plus"></i> {{ t('register') }}
          </router-link>
        </template>

        <a href="https://t.me/tezJumush" target="_blank" class="nav-link btn-telegram">
          <i class="fab fa-telegram-plane"></i> {{ t('postJob') }}
        </a>

        <!-- Добавляем переключатель языка -->
        <LanguageSwitcher class="language-switcher" />

        <!-- Добавляем переключатель темы -->
        <ThemeSwitcher class="theme-switcher" />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  padding: var(--spacing-md) 0;
  background-color: var(--navbar-bg);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background-color 0.3s;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
}

.logo-img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  object-fit: cover;
  margin-right: var(--spacing-sm);
}

.logo-text {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: 1.5rem;
  color: #0066b3;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-link {
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
}

.nav-link i {
  margin-right: 6px;
  font-size: 0.9em;
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  font-weight: var(--font-weight-bold);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.btn-register {
  background-color: var(--primary-color);
  color: white !important;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(62, 104, 255, 0.3);
  display: flex;
  align-items: center;
}

.btn-register i {
  margin-right: 6px;
}

.btn-register:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(62, 104, 255, 0.4);
}

.btn-telegram {
  background-color: #0088cc;
  color: white !important;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 136, 204, 0.3);
  display: flex;
  align-items: center;
  margin-left: var(--spacing-sm);
}

.btn-telegram i {
  margin-right: 6px;
  font-size: 1.1em;
}

.btn-telegram:hover {
  background-color: #0077b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);
}

.language-switcher {
  margin-left: var(--spacing-sm);
}

.theme-switcher {
  margin-left: var(--spacing-sm);
}

.navbar-menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: var(--spacing-xs);
}

.navbar-menu-toggle span {
  width: 25px;
  height: 3px;
  background-color: var(--text-color);
  margin: 2px 0;
  border-radius: 3px;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .navbar-menu-toggle {
    display: flex;
    z-index: 1001;
  }

  .navbar-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 250px;
    height: 100vh;
    background-color: white;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    flex-direction: column;
    align-items: flex-start;
    padding: 80px var(--spacing-lg) var(--spacing-lg);
    transition: right 0.3s ease;
    gap: var(--spacing-md);
    z-index: 999;
  }

  .navbar-links.is-active {
    right: 0;
  }

  .nav-link {
    width: 100%;
    padding: var(--spacing-sm) 0;
  }

  .navbar-menu-toggle.is-active span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }

  .navbar-menu-toggle.is-active span:nth-child(2) {
    opacity: 0;
  }

  .navbar-menu-toggle.is-active span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  .btn-register,
  .btn-telegram,
  .language-switcher,
  .theme-switcher {
    margin-top: var(--spacing-sm);
    text-align: center;
    margin-left: 0;
    justify-content: center;
  }
}
</style>
