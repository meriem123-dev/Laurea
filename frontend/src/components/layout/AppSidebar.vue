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
  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/60'
const activeLink =
  'bg-white/10 font-medium text-white before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary-300'
const idleLink = 'text-slate-300 hover:bg-white/5 hover:text-white'
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col bg-linear-to-b from-navy-900 from-45% to-primary-700 text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex shrink-0 items-center justify-center border-b border-white/10 bg-black/10 py-5">
      <AppLogo variant="full" />
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-5" aria-label="Navigation principale">
      <div v-for="section in sections" :key="section.label" class="mb-5">
        <p class="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {{ section.label }}
        </p>

        <ul class="space-y-1">
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
                  class="h-4 w-4 shrink-0 transition-transform group-hover:scale-110"
                  aria-hidden="true"
                />
                <span class="truncate">{{ item.label }}</span>
                <span
                  v-if="item.badge"
                  class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[10px] font-semibold text-white"
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