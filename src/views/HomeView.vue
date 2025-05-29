<script setup lang="ts">
import { ref, onMounted } from 'vue'
import JobCard from '@/components/JobCard.vue'
import { jobsAPI } from '@/utils/api'
// Импортируем логотип
import logoImg from '@/assets/img/logo.jpg'

// Состояния компонента
const isLoggedIn = ref(false)
const recentJobs = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const imageError = ref(false)

// Правильный путь к логотипу
const logoSrc = ref('/img/logo.jpg')
const fallbackLogoSrc = ref('/img/logo-fallback.png')

// Обработка ошибки загрузки изображения
const handleImageError = (event: Event) => {
  console.warn('Основное изображение не загрузилось, используем fallback')
  imageError.value = true
  
  // Пытаемся загрузить fallback изображение
  const img = event.target as HTMLImageElement
  if (img.src !== fallbackLogoSrc.value) {
    img.src = fallbackLogoSrc.value
  } else {
    // Если и fallback не загрузился, скрываем изображение
    img.style.display = 'none'
  }
}

// Загрузка последних вакансий
const loadRecentJobs = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const jobs = await jobsAPI.getJobs()
    // Берем только первые 3 вакансии для главной страницы
    recentJobs.value = jobs.slice(0, 3)
  } catch (e: any) {
    console.error('Ошибка при загрузке вакансий:', e)
    error.value = 'Не удалось загрузить вакансии'
    
    // В случае ошибки используем демо-данные
    recentJobs.value = [
      {
        id: 1,
        title: 'Курьер на день',
        description: 'Доставка документов по городу на 1 день',
        salary: '1000 сом',
        location: 'Бишкек',
        phone: '+996 555 123456',
        date: new Date().toISOString(),
        category: 'Доставка',
      },
      {
        id: 2,
        title: 'Помощник на мероприятие',
        description: 'Требуется помощник для организации мероприятия',
        salary: '1500 сом',
        location: 'Бишкек',
        phone: '+996 555 789012',
        date: new Date().toISOString(),
        category: 'Мероприятия',
      },
      {
        id: 3,
        title: 'Уборка помещения',
        description: 'Уборка офиса после ремонта',
        salary: '2000 сом',
        location: 'Бишкек',
        phone: '+996 555 345678',
        date: new Date().toISOString(),
        category: 'Уборка',
      }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Проверяем авторизацию пользователя
  isLoggedIn.value = !!localStorage.getItem('user')
  loadRecentJobs()
})
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
      </div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">Найдите подработку<br /><span>прямо сейчас</span></h1>
            <p class="hero-subtitle">
              TEZ JUMUSH - платформа для быстрого поиска временной работы и надежных исполнителей в
              Кыргызстане
            </p>
            <div class="hero-buttons">
              <router-link to="/jobs" class="btn btn-primary btn-lg">
                <i class="fas fa-search"></i> Найти работу
              </router-link>
              <a href="https://t.me/tezJumush" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-lg">
                <i class="fab fa-telegram-plane"></i> Выложить работу
              </a>
            </div>

            <!-- Информация для неавторизованных пользователей -->
            <div v-if="!isLoggedIn" class="auth-notice">
              <i class="fas fa-info-circle"></i>
              <p>
                Для доступа к вакансиям необходимо
                <router-link to="/login" class="auth-link">войти</router-link>
                или
                <router-link to="/register" class="auth-link">зарегистрироваться</router-link>
              </p>
            </div>

            <div class="hero-stats">
              <div class="hero-stat">
                <span class="hero-stat-number">500+</span>
                <span class="hero-stat-label">Вакансий</span>
              </div>
              <div class="hero-stat">
                <span class="hero-stat-number">1000+</span>
                <span class="hero-stat-label">Работников</span>
              </div>
              <div class="hero-stat">
                <span class="hero-stat-number">200+</span>
                <span class="hero-stat-label">Компаний</span>
              </div>
            </div>
          </div>
          <div class="hero-image">
            <img 
              :src="logoSrc" 
              alt="Tez Jumush"
              @error="handleImageError"
              v-show="!imageError"
              loading="lazy"
            />
            <!-- Fallback для случая, когда изображения не загружаются -->
            <div v-if="imageError" class="logo-fallback">
              <div class="logo-text">TEZ JUMUSH</div>
              <div class="logo-subtitle">Быстрый поиск работы</div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fill-opacity="1"
            d="M0,96L48,112C96,128,192,160,288,170.7C384,181,480,171,576,144C672,117,768,75,864,69.3C960,64,1056,96,1152,106.7C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>

    <!-- About Section -->
    <section class="section about-section" id="about">
      <div class="container">
        <h2 class="text-center">О нас</h2>
        <div class="about-content mt-4">
          <div class="about-text">
            <p>
              Tez Jumush - это платформа, которая соединяет людей, ищущих временную работу, с теми,
              кто ищет работников для выполнения разовых задач.
            </p>
            <p>Наша миссия - помочь людям найти подработку быстро и без лишних сложностей.</p>
            <p>
              Мы предлагаем широкий спектр вакансий: от уборки и курьерской доставки до строительных
              работ и помощи по дому.
            </p>
          </div>
          <div class="about-image">
            <img 
              :src="logoSrc" 
              alt="Tez Jumush" 
              width="200"
              @error="handleImageError"
              v-show="!imageError"
              loading="lazy"
            />
            <div v-if="imageError" class="logo-fallback-small">
              <div class="logo-text-small">TEZ JUMUSH</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Jobs Section -->
    <section class="section recent-jobs-section">
      <div class="container">
        <h2 class="text-center">Последние вакансии</h2>
        
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p>Загрузка вакансий...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <p class="error-message">{{ error }}</p>
          <button @click="loadRecentJobs" class="retry-button">
            <i class="fas fa-redo"></i> Попробовать снова
          </button>
        </div>
        
        <div v-else class="jobs-grid mt-4">
          <JobCard 
            v-for="job in recentJobs" 
            :key="job.id" 
            :job="job"
            @error="(err: any) => console.warn('Job card error:', err)"
          />
        </div>
        
        <div class="text-center mt-4">
          <router-link to="/jobs" class="btn btn-primary">
            <i class="fas fa-briefcase"></i> Смотреть все вакансии
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section cta-section">
      <div class="cta-background"></div>
      <div class="container">
        <div class="cta-content">
          <div class="cta-icon">
            <i class="fas fa-bullhorn"></i>
          </div>
          <h2 class="cta-title">Нужны <span>работники?</span></h2>
          <p class="cta-text">
            Разместите вакансию бесплатно и найдите подходящих работников уже сегодня!
          </p>
          <div class="cta-actions">
            <a href="https://t.me/tezJumush" target="_blank" rel="noopener noreferrer" class="btn btn-cta">
              <i class="fab fa-telegram-plane"></i> Разместить вакансию
            </a>
            <div class="cta-guarantee">
              <i class="fas fa-shield-alt"></i>
              <span>Бесплатно и без регистрации</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-section {
  position: relative;
  padding: 120px 0 80px;
  overflow: hidden;
  background-color: var(--primary-color);
  color: white;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-xl);
}

.hero-text {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin-bottom: var(--spacing-md);
  font-family: var(--font-family-heading);
  animation: fadeInUp 0.8s ease-out;
}

.hero-title span {
  color: var(--accent-color);
  position: relative;
  display: inline-block;
}

.hero-title span::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 6px;
  background-color: var(--accent-color);
  opacity: 0.3;
  border-radius: 3px;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-lg);
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--font-family-body);
  animation: fadeInUp 0.8s ease-out 0.2s both;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-outline {
  background-color: transparent;
  border: 2px solid white;
  color: white;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: white;
  color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.btn-primary {
  background-color: var(--accent-color);
  border: none;
  color: var(--primary-color);
  font-weight: var(--font-weight-bold);
  box-shadow: 0 4px 12px rgba(255, 209, 102, 0.3);
}

.btn-primary:hover {
  background-color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.4);
}

.hero-stats {
  display: flex;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-stat-number {
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  color: white;
  font-family: var(--font-family-heading);
}

.hero-stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: var(--spacing-xs);
}

.hero-image {
  flex: 1;
  max-width: 500px;
  animation:
    floatAnimation 6s ease-in-out infinite,
    fadeIn 1s ease-out;
  display: flex;
  justify-content: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
}

.hero-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.hero-wave svg {
  position: relative;
  display: block;
  width: 100%;
  height: 150px;
}

.auth-notice {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  animation: fadeInUp 0.8s ease-out 0.6s both;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.auth-notice i {
  font-size: 1.5rem;
  color: var(--accent-color);
}

.auth-notice p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.auth-link {
  color: var(--accent-color);
  font-weight: var(--font-weight-bold);
  text-decoration: underline;
  transition: all 0.3s;
}

.auth-link:hover {
  color: white;
  text-decoration: none;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes floatAnimation {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Responsive styles */
@media (max-width: 992px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-text {
    max-width: 100%;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-image {
    margin-top: var(--spacing-xl);
  }

  .hero-title {
    font-size: 2.8rem;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 0 60px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn-lg {
    width: 100%;
  }

  .hero-stats {
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }
}

/* Keep existing styles for the other sections */
.about-content {
  display: flex;
  align-items: center;
  gap: 40px;
}

.about-text {
  flex: 1;
  color: var(--text-color);
}

.about-text p {
  color: var(--text-color);
  margin-bottom: 1rem;
}

.about-image {
  flex: 1;
  display: flex;
  justify-content: center;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.cta-section {
  position: relative;
  background-color: #f8f9fa;
  color: var(--text-color);
  padding: 100px 0;
  text-align: center;
  overflow: hidden;
}

.cta-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  opacity: 0.8;
  z-index: 0;
}

.cta-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230066B3' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.cta-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  background-color: var(--card-bg);
  padding: 60px;
  border-radius: var(--radius-lg);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.8s ease-out;
}

.cta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: rgba(62, 104, 255, 0.1);
  border-radius: 50%;
  margin-bottom: var(--spacing-lg);
}

.cta-icon i {
  font-size: 32px;
  color: var(--primary-color);
}

.cta-title {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
  color: var(--text-color);
  font-family: var(--font-family-heading);
  line-height: 1.2;
}

.cta-title span {
  color: #0066b3;
  position: relative;
}

.cta-title span::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 6px;
  background-color: #0066b3;
  opacity: 0.2;
  border-radius: 3px;
}

.cta-text {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-xl);
  color: var(--text-secondary);
  font-family: var(--font-family-body);
  line-height: 1.6;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.btn-cta {
  background-color: #0088cc;
  color: white;
  padding: 16px 32px;
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  font-weight: var(--font-weight-bold);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 6px 15px rgba(0, 136, 204, 0.3);
}

.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 136, 204, 0.4);
  background-color: #0077b3;
}

.btn-cta i {
  font-size: 1.3rem;
}

.cta-guarantee {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666666;
  font-size: 0.9rem;
}

.cta-guarantee i {
  color: var(--success-color);
}

.cta-guarantee span {
  color: var(--text-color);
}

@media (max-width: 768px) {
  .cta-section {
    padding: 60px 0;
  }

  .cta-content {
    padding: 40px 20px;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-text {
    font-size: 1rem;
    max-width: 100%;
  }

  .btn-cta {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
  }

  .about-content {
    flex-direction: column;
  }

  .about-image {
    margin-top: 20px;
  }

  .about-image img {
    max-width: 200px;
  }
}

.about-section {
  background-color: var(--card-bg);
}
</style>
