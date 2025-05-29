<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// Use the global i18n instance
const { t } = useI18n()
</script>

<template>
  <div class="about">
    <section class="section">
      <div class="container">
        <h1 class="text-center">{{ t('aboutTitle') }}</h1>
        <div class="about-content mt-5">
          <div class="about-image">
            <img src="/img/logo.jpg" alt="Tez Jumush" width="200" />
          </div>
          <div class="about-text">
            <h2>Что такое Tez Jumush?</h2>
            <p>
              Tez Jumush - это инновационная платформа, которая соединяет людей, ищущих временную
              работу, с работодателями, которым требуется выполнение разовых задач.
            </p>
            <p>
              Мы стремимся упростить процесс поиска работы и работников, делая его быстрым,
              прозрачным и эффективным.
            </p>

            <h3 class="mt-4">Наша миссия</h3>
            <p>
              Мы верим, что каждый человек должен иметь возможность быстро найти работу и
              заработать, когда это необходимо. Наша миссия - создать самую доступную и удобную
              платформу для поиска временной работы.
            </p>

            <h3 class="mt-4">Как это работает?</h3>
            <ul>
              <li>Работодатели размещают объявления о работе в нашем Telegram канале</li>
              <li>Мы публикуем эти объявления на нашем сайте</li>
              <li>Соискатели могут просматривать вакансии и откликаться на них</li>
              <li>Работодатели и соискатели договариваются напрямую</li>
            </ul>

            <h3 class="mt-4">Наши преимущества</h3>
            <ul>
              <li>Быстрый поиск работы и работников</li>
              <li>Простая и понятная система</li>
              <li>Прямое общение между работодателем и соискателем</li>
              <li>Широкий выбор вакансий и соискателей</li>
              <li>Полностью бесплатно для всех пользователей</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section team-section">
      <div class="container">
        <h2 class="text-center">{{ t('aboutTeam') }}</h2>
        <p class="text-center">
          Tez Jumush - это проект, созданный энтузиастами, которые хотят сделать рынок труда более
          доступным и эффективным.
        </p>

        <div class="contact-us mt-5 text-center">
          <h3>{{ t('contactUs') }}</h3>
          <p>Если у вас есть вопросы или предложения, пожалуйста, свяжитесь с нами:</p>
          <a href="https://t.me/tezJumush" target="_blank" class="btn btn-primary mt-3"
            >Telegram канал</a
          >
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-content {
  display: flex;
  gap: 50px;
  align-items: flex-start;
}

.about-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.about-text {
  flex: 2;
}

.team-section {
  background-color: var(--bg-color);
}

ul {
  margin-left: 20px;
}

li {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .about-content {
    flex-direction: column;
  }

  .about-image {
    margin-bottom: 30px;
  }
}
</style>
