<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { jobsAPI } from '@/utils/api'

const route = useRoute()
const jobId = parseInt(route.params.id as string)

const job = ref<any>(null)
const loading = ref(true)
const error = ref('')
const applyMessage = ref('')

const isLoggedIn = ref(!!localStorage.getItem('token'))

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    job.value = await jobsAPI.getJob(jobId)
    if (job.value && job.value.error) {
      error.value = job.value.error
      job.value = null
    }
  } catch (e) {
    error.value = 'Ошибка при загрузке вакансии'
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function applyToJob() {
  applyMessage.value = ''
  try {
    const res = await jobsAPI.apply(jobId)
    if (res.message) {
      applyMessage.value = res.message
    } else {
      applyMessage.value = 'Вы успешно откликнулись!'
    }
  } catch (e) {
    applyMessage.value = 'Ошибка при отклике'
  }
}
</script>

<template>
  <div class="job-detail">
    <div class="container">
      <div v-if="loading" class="text-center py-5">Загрузка...</div>
      <div v-else-if="error" class="not-found">
        <h2>Ошибка</h2>
        <p>{{ error }}</p>
        <router-link to="/jobs" class="btn btn-primary mt-3">Вернуться к списку вакансий</router-link>
      </div>
      <div v-else-if="job" class="job-detail-content">
        <div class="job-detail-header">
          <router-link to="/jobs" class="back-link">← Назад к списку вакансий</router-link>
          <h1>{{ job.title }}</h1>
          <div class="job-meta">
            <div class="job-category">{{ job.category }}</div>
            <div class="job-date">Опубликовано: {{ formatDate(job.date) }}</div>
          </div>
        </div>

        <div class="job-detail-body">
          <div class="job-detail-main">
            <div class="job-section">
              <h2>Описание</h2>
              <p>{{ job.description }}</p>
            </div>

            <div class="job-section" v-if="job.requirements">
              <h2>Требования</h2>
              <ul>
                <li v-for="(req, index) in job.requirements.split ? job.requirements.split(',') : job.requirements" :key="index">{{ req }}</li>
              </ul>
            </div>

            <div class="job-section">
              <h2>Работодатель</h2>
              <p>{{ job.employer }}</p>
            </div>
          </div>

          <div class="job-detail-sidebar">
            <div class="job-detail-card">
              <div class="job-info-item">
                <div class="label">Оплата:</div>
                <div class="value">{{ job.salary }}</div>
              </div>

              <div class="job-info-item">
                <div class="label">Место:</div>
                <div class="value">{{ job.location }}</div>
              </div>

              <div class="job-info-item">
                <div class="label">Телефон:</div>
                <div class="value phone">{{ job.phone }}</div>
              </div>

              <div class="job-actions">
                <a :href="`tel:${job.phone}`" class="btn btn-primary btn-block">Позвонить</a>
                <button v-if="isLoggedIn" @click="applyToJob" class="btn btn-success btn-block mt-2">Откликнуться</button>
                <div v-if="applyMessage" class="mt-2 text-success">{{ applyMessage }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="not-found">
        <h2>Вакансия не найдена</h2>
        <p>Извините, вакансия с ID {{ jobId }} не найдена.</p>
        <router-link to="/jobs" class="btn btn-primary mt-3">Вернуться к списку вакансий</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.job-detail {
  padding-top: 30px;
  padding-bottom: 50px;
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: var(--primary-color);
}

.job-detail-header {
  margin-bottom: 30px;
}

.job-meta {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.job-category {
  background-color: var(--primary-color);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.job-date {
  color: #666;
  font-size: 0.9rem;
}

.job-detail-body {
  display: flex;
  gap: 30px;
}

.job-detail-main {
  flex: 2;
}

.job-detail-sidebar {
  flex: 1;
}

.job-section {
  margin-bottom: 30px;
}

.job-section h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--primary-color);
}

.job-detail-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.job-info-item {
  display: flex;
  margin-bottom: 15px;
}

.job-info-item .label {
  font-weight: bold;
  width: 100px;
}

.job-info-item .value {
  flex: 1;
}

.phone {
  font-weight: bold;
  color: var(--primary-color);
}

.btn-block {
  display: block;
  width: 100%;
  text-align: center;
}

.btn-whatsapp {
  display: none; /* Hide WhatsApp button */
}

.not-found {
  text-align: center;
  padding: 50px 0;
}

@media (max-width: 768px) {
  .job-detail-body {
    flex-direction: column;
  }

  .job-detail-main {
    order: 2;
  }

  .job-detail-sidebar {
    order: 1;
    margin-bottom: 30px;
  }
}
</style>
