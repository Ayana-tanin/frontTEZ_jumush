<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

// Get i18n instance for translations
const { t } = useI18n()

interface Job {
  id: number
  title: string
  description: string
  salary: string
  location: string
  phone: string
  date: string
  category?: string // Может быть добавлено из JobsView
  status?: string // Может быть добавлено из DashboardView
  applications?: any[] // Заявки на вакансию
}

const props = defineProps<{
  job: Job
  isEmployer?: boolean // Показывает, является ли текущий пользователь работодателем
}>()

// Определяем события для родительского компонента
const emit = defineEmits(['edit', 'delete', 'apply'])

// Логирование для отладки
onMounted(() => {
  console.log('JobCard isEmployer:', props.isEmployer)
  console.log('JobCard job:', props.job)
})

// Форматирование статуса
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    new: t('newStatus'),
    'in-progress': t('inProgressStatus'),
    completed: t('completedStatus'),
  }
  return statusMap[status] || status
}

// Обработчики событий
function handleEdit() {
  console.log('Edit button clicked for job:', props.job.id)
  emit('edit', props.job)
}

function handleDelete() {
  console.log('Delete button clicked for job:', props.job.id)
  if (confirm(t('deleteConfirmation'))) {
    emit('delete', props.job.id)
  }
}

function handleApply() {
  emit('apply', props.job)
}

// Определяем, есть ли активные заявки
const hasApplications = computed(() => {
  return props.job.applications && props.job.applications.length > 0
})

// Форматирование даты
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}
</script>

<template>
  <div class="job-card" :class="{ 'has-applications': hasApplications }">
    <div class="job-status-badge" v-if="job.status && job.status !== 'new'">
      {{ formatStatus(job.status) }}
    </div>

    <h3 class="job-title">{{ job.title }}</h3>
    <p class="job-description">{{ job.description }}</p>

    <div class="job-details">
      <div class="job-detail">
        <i class="fas fa-map-marker-alt"></i>
        <span>{{ job.location }}</span>
      </div>
      <div class="job-detail">
        <i class="fas fa-money-bill-wave"></i>
        <span>{{ job.salary }}</span>
      </div>
      <div class="job-detail">
        <i class="fas fa-phone"></i>
        <span>{{ job.phone }}</span>
      </div>
      <div class="job-detail" v-if="job.category">
        <i class="fas fa-tag"></i>
        <span>{{ job.category }}</span>
      </div>
      <div class="job-detail">
        <i class="fas fa-calendar-alt"></i>
        <span>{{ formatDate(job.date) }}</span>
      </div>
      <div class="job-applications" v-if="hasApplications && isEmployer">
        <i class="fas fa-user-check"></i>
        <span>{{ t('applicationCount') }}: {{ job.applications ? job.applications.length : 0 }}</span>
      </div>
    </div>

    <div class="job-footer">
      <div class="job-actions">
        <router-link :to="`/jobs/${job.id}`" class="btn btn-sm btn-primary">
          <i class="fas fa-info-circle"></i> {{ t('details') }}
        </router-link>

        <template v-if="isEmployer">
          <button @click="handleEdit" class="btn btn-sm btn-outline">
            <i class="fas fa-edit"></i> {{ t('modify') }}
          </button>
          <button @click="handleDelete" class="btn btn-sm btn-danger">
            <i class="fas fa-trash-alt"></i> {{ t('delete') }}
          </button>
        </template>

        <button
          v-if="!isEmployer && !job.status"
          @click="handleApply"
          class="btn btn-sm btn-success"
        >
          <i class="fas fa-check"></i> {{ t('apply') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.job-card {
  border-radius: var(--radius-lg);
  background-color: var(--card-bg);
  padding: var(--spacing-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-shadow);
}

.job-card.has-applications {
  border-left: 4px solid var(--primary-color);
}

.job-status-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--primary-color);
  color: white;
  padding: 4px 12px;
  font-size: 0.8rem;
  border-bottom-left-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
}

.job-status-badge:after {
  content: '';
  position: absolute;
  left: -8px;
  bottom: 0;
  width: 0;
  height: 0;
  border-right: 8px solid var(--primary-color);
  border-top: 8px solid transparent;
}

.job-title {
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  line-height: 1.3;
  height: 2.6rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.job-description {
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  font-size: 0.95rem;
  line-height: 1.5;
  height: 4.5rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.job-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  flex-grow: 1;
}

.job-detail {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  padding: var(--spacing-xs) 0;
}

.job-detail span {
  color: var(--text-color);
}

.job-detail i,
.job-applications i {
  width: 20px;
  margin-right: var(--spacing-sm);
  color: var(--primary-color);
  text-align: center;
}

.job-applications {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) 0;
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
  color: var(--primary-color);
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
}

.job-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .job-actions {
    flex-wrap: wrap;
  }

  .btn-sm {
    padding: 8px 12px;
    font-size: 0.9rem;
    flex: 1;
    text-align: center;
  }
}
</style>
