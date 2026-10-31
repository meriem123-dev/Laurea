<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppLogo from '../common/AppLogo.vue'
import type { NavSection } from '../../types/navigation'

withDefaults(
  defineProps<{
    sections: NavSection[]
    open?: boolean // mobile : tiroir ouvert/fermé
  }>(),
  { open: false },
)

const baseLink =
  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.8125rem] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30'
const activeLink = 'bg-ink text-white'
const idleLink = 'text-text-body hover:bg-surface-muted hover:text-ink'
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-border bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
    :class="open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'"
  >
    <div class="shrink-0 px-6 pb-2 pt-5">
      <AppLogo variant="onLight" class="h-12" />
    </div>

    <nav class="flex-1 overflow-y-auto overscroll-contain px-3 pb-4" aria-label="Navigation principale">
      <div v-for="section in sections" :key="section.label" class="mt-6 first:mt-2">
        <p class="px-3 pb-2 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-text-muted">
          {{ section.label }}
        </p>

        <ul class="space-y-0.5">
          <li v-for="item in section.items" :key="item.to">
            <RouterLink v-slot="{ href, navigate, isActive }" :to="item.to" custom>
              <a
                :href="href"
                :aria-current="isActive ? 'page' : undefined"
                :class="[baseLink, isActive ? activeLink : idleLink]"
                @click="navigate"
              >
                <component
                  :is="item.icon"
                  class="h-[1.125rem] w-[1.125rem] shrink-0"
                  :class="isActive ? 'text-white' : 'text-text-secondary group-hover:text-ink'"
                  :stroke-width="1.75"
                  aria-hidden="true"
                />
                <span class="truncate">{{ item.label }}</span>
                <span
                  v-if="item.badge"
                  class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1.5 text-[0.625rem] font-bold text-white"
                >
                  {{ item.badge }}
                </span>
              </a>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>