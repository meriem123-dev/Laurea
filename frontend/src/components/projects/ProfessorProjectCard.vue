<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, BookOpen } from '@lucide/vue'
import BaseBadge from '../common/BaseBadge.vue'
import InitialsAvatar from '../common/InitialsAvatar.vue'
import SegmentedBar from '../common/SegmentedBar.vue'
import { projectProgress } from '../../utils/project'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { fullName, initials } from '../../utils/student'
import type { Project } from '../../types/project'
import type { Student } from '../../types/student'

const props = defineProps<{
  project: Project
  members: Student[]
}>()

const emit = defineEmits<{
  view: [project: Project]
}>()

const status = computed(() => PROJECT_STATUS_META[props.project.status])
const progress = computed(() => projectProgress(props.project.status))
const segments = computed(() => [
  { value: progress.value, colorClass: 'bg-primary-500' },
  { value: 100 - progress.value, colorClass: 'bg-surface-muted' },
])
</script>

<template>
  <article
    class="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition duration-300 hover:-translate-y-0.5 hover:border-border-strong"
  >
    <div class="flex items-center justify-between gap-3">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"
        aria-hidden="true"
      >
        <BookOpen class="h-[1.125rem] w-[1.125rem]" :stroke-width="1.75" />
      </span>
      <BaseBadge :tone="status.tone">{{ status.label }}</BaseBadge>
    </div>

    <h2 class="mt-4 break-words font-display text-xl leading-snug text-ink">{{ project.title }}</h2>
    <p class="mt-1 text-xs text-text-muted">{{ project.domain }}</p>

    <ul class="mt-5 space-y-3">
      <li v-for="member in members" :key="member.id" class="flex items-center gap-3">
        <InitialsAvatar :initials="initials(member)" size="sm" />
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-ink">{{ fullName(member) }}</p>
          <p class="truncate text-xs text-text-muted">{{ member.matricule }}</p>
        </div>
      </li>
    </ul>

    <div class="mt-5 flex-1">
      <div class="mb-2 flex items-center justify-between text-xs">
        <span class="text-text-muted">Avancement</span>
        <span class="font-semibold tabular-nums text-ink">{{ progress }}%</span>
      </div>
      <SegmentedBar :segments="segments" :aria-label="`Avancement du projet : ${progress}%`" />
    </div>

    <button
      type="button"
      class="group mt-5 inline-flex items-center justify-center gap-1.5 rounded-sm text-xs font-semibold text-ink underline decoration-border-strong underline-offset-4 transition hover:decoration-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
      @click="emit('view', project)"
    >
      Consulter le dossier
      <ArrowRight
        class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  </article>
</template>