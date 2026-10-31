<script setup lang="ts">
import AppLogo from '../common/AppLogo.vue'

// Les 6 états du workflow métier : DÉPOSÉ → VALIDÉ → PLANIFIÉ → SOUTENU → NOTÉ → CLOS
const steps = ['Déposé', 'Validé', 'Planifié', 'Soutenu', 'Noté', 'Clos']
</script>

<template>
  <aside
    class="relative hidden overflow-hidden bg-navy-900 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16"
  >
    <!-- Grille discrète façon papier millimétré, estompée vers le bas -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_20%_30%,black,transparent_70%)]"
    />
    <!-- Halo chaud, très léger -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-40 -right-40 size-112 rounded-full bg-brass/20 blur-3xl"
    />

    <AppLogo variant="onDark" class="relative h-14 motion-safe:animate-fade-up"/>

    <div class="relative max-w-xl xl:max-w-2xl">
      <p
        class="flex items-center gap-3 text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-brass-light motion-safe:animate-fade-up [animation-delay:150ms]"
      >
        <span class="h-px w-8 bg-brass-light" aria-hidden="true" />
        Portail universitaire
      </p>

      <h2
        class="mt-6 font-display text-5xl font-normal leading-[1.08] tracking-tight motion-safe:animate-fade-up [animation-delay:300ms] xl:text-6xl"
      >
        Organisez <em class="italic text-brass-light">l’excellence</em>, du projet à la
        soutenance.
      </h2>

      <p
        class="mt-6 max-w-md text-base leading-relaxed text-white/70 motion-safe:animate-fade-up [animation-delay:450ms]"
      >
        Une plateforme unifiée pour coordonner chaque étape des projets de fin d’études.
      </p>
    </div>

    <div class="relative motion-safe:animate-fade-up [animation-delay:600ms]">
      <p class="mb-5 text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-white/50">
        Le parcours d’une soutenance
      </p>

      <ol class="grid grid-cols-6 gap-2">
        <li
          v-for="(step, index) in steps"
          :key="step"
          class="relative border-t border-white/20 pt-4"
          :style="{ '--i': index }"
        >
          <span
            class="absolute -top-1 left-0 h-2 w-2 rounded-full bg-brass-light motion-safe:animate-step [animation-delay:calc(var(--i)*2s)]"
            aria-hidden="true"
          />
          <div class="motion-safe:animate-step [animation-delay:calc(var(--i)*2s)]">
            <p class="text-[0.625rem] font-semibold tracking-[0.18em] text-white/60">
              {{ String(index + 1).padStart(2, '0') }}
            </p>
            <p class="mt-1 text-[0.8125rem] font-semibold">{{ step }}</p>
          </div>
        </li>
      </ol>
    </div>
  </aside>
</template>