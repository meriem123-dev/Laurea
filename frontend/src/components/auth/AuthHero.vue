<script setup lang="ts">
import { Award, CalendarDays } from '@lucide/vue'
import AppLogo from '../common/AppLogo.vue'

const features = [
  { icon: CalendarDays, title: 'Planning simplifié', description: 'Coordonnez salles et jurys' },
  { icon: Award, title: 'Évaluations fiables', description: 'Centralisez notes et résultats' },
]

// Carte purement décorative (illustration statique, pas de données réelles)
const previewEvent = {
  day: '18',
  month: 'JUN',
  title: 'Prochaine soutenance',
  details: '09:00 · Salle A12',
}
</script>

<template>
  <aside
    class="relative hidden overflow-hidden bg-linear-to-br from-navy-900 from-40% via-navy-800 via-70% to-primary-700 p-12 text-white lg:flex lg:flex-col lg:justify-between"
  >
    <!-- Cercles décoratifs -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0">
      <div
        class="absolute -left-24 top-20 h-136 w-136 rounded-full border border-white/10 motion-safe:animate-breathe"
      />
      <div
        class="absolute left-4 top-44 h-88 w-88 rounded-full border border-white/10 motion-safe:animate-breathe [animation-delay:3s]"
      />
      <div
        class="absolute -bottom-32 -right-24 h-104 w-104 rounded-full bg-primary-500/30 motion-safe:animate-drift"
      />
    </div>

    <AppLogo variant="full" class="relative motion-safe:animate-fade-up" />

    <div class="relative">
      <!-- Carte flottante -->
      <div
        class="absolute -top-28 right-0 flex w-56 rotate-2 items-center gap-3 rounded-xl border border-sky-300/60 bg-white/10 px-4 py-3 shadow-lg backdrop-blur-sm motion-safe:animate-float"
        aria-hidden="true"
      >
        <div class="text-center leading-none">
          <p class="text-lg font-bold text-sky-300">{{ previewEvent.day }}</p>
          <p class="mt-1 text-[9px] font-medium text-sky-200/80">{{ previewEvent.month }}</p>
        </div>
        <div class="flex-1">
          <p class="text-xs font-semibold">{{ previewEvent.title }}</p>
          <p class="mt-0.5 text-[10px] text-sky-100/70">{{ previewEvent.details }}</p>
        </div>
        <span class="relative flex h-1.5 w-1.5">
          <span
            class="absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75 motion-safe:animate-ping"
          />
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-300" />
        </span>
      </div>

      <p
        class="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/80 motion-safe:animate-fade-up [animation-delay:150ms]"
      >
        Portail universitaire
      </p>

      <h2
        class="mt-6 text-5xl font-light leading-[1.1] tracking-tight motion-safe:animate-fade-up [animation-delay:300ms] xl:text-[3.5rem]"
      >
        <span class="block">Organisez</span>
        <span class="block">l’excellence,</span>
        <span class="block">du projet à la</span>
        <span class="block">soutenance.</span>
      </h2>

      <p
        class="mt-6 max-w-md text-base text-slate-200/90 motion-safe:animate-fade-up [animation-delay:450ms]"
      >
        Une plateforme unifiée pour coordonner chaque étape des projets de fin d’études.
      </p>
    </div>

    <ul class="relative grid grid-cols-2 gap-8">
      <li
        v-for="(feature, index) in features"
        :key="feature.title"
        class="group flex cursor-default items-start gap-3 transition-transform duration-300 hover:translate-x-1 motion-safe:animate-fade-up"
        :style="{ animationDelay: `${600 + index * 150}ms` }"
      >
        <component
          :is="feature.icon"
          class="mt-0.5 h-4 w-4 text-sky-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:scale-125"
          aria-hidden="true"
        />
        <div>
          <p class="text-sm font-semibold">{{ feature.title }}</p>
          <p class="mt-0.5 text-xs text-slate-300">{{ feature.description }}</p>
        </div>
      </li>
    </ul>
  </aside>
</template>