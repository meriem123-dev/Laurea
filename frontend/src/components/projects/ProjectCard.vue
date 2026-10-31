<script setup lang="ts">
import { ArrowRight, BookOpen, Pencil, Trash2 } from '@lucide/vue'
import ActionMenu, { type ActionMenuItem } from '../common/ActionMenu.vue'
import BaseBadge from '../common/BaseBadge.vue'
import InitialsAvatar from '../common/InitialsAvatar.vue'
import { PROJECT_STATUS_META } from '../../utils/projectStatus'
import { fullName, initials } from '../../utils/student'
import type { Project } from '../../types/project'
import type { Student } from '../../types/student'

const props = defineProps<{
  project: Project
  members: Student[]
  supervisor: string
  coSupervisor?: string
}>()

const emit = defineEmits<{
  view: [project: Project]
  edit: [project: Project]
  delete: [project: Project]
}>()

const menuItems: ActionMenuItem[] = [
  { key: 'edit', label: 'Modifier', icon: Pencil },
  { key: 'delete', label: 'Supprimer', icon: Trash2, danger: true },
]

function onAction(key: string) {
  if (key === 'edit') emit('edit', props.project)
  else if (key === 'delete') emit('delete', props.project)
}
</script>

<template>
  <article
    class="flex h-full flex-col rounded-xl border border-border bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-border-strong"
  >
    <div class="flex items-center justify-between gap-3">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink"
        aria-hidden="true"
      >
        <BookOpen class="h-[1.125rem] w-[1.125rem]" :stroke-width="1.75" />
      </span>

      <div class="-mr-2 flex items-center gap-1">
        <BaseBadge :tone="PROJECT_STATUS_META[project.status].tone">
          {{ PROJECT_STATUS_META[project.status].label }}
        </BaseBadge>
        <ActionMenu
          :items="menuItems"
          :ariaLabel="`Actions pour le projet ${project.title}`"
          @select="onAction"
        />
      </div>
    </div>

    <h2 class="mt-4 break-words font-display text-xl leading-snug text-ink">{{ project.title }}</h2>
    <p class="mt-1 text-xs text-text-muted">{{ project.domain }}</p>

    <ul class="mt-5 flex-1 space-y-3 border-t border-border pt-4">
      <li v-for="member in members" :key="member.id" class="flex items-center gap-3">
        <InitialsAvatar :initials="initials(member)" size="sm" />
        <span class="min-w-0 truncate text-sm font-semibold text-ink">{{ fullName(member) }}</span>
      </li>
    </ul>

    <p class="mt-4 text-xs text-text-secondary">
      <span class="font-semibold text-ink">Encadrant :</span> {{ supervisor }}
      <template v-if="coSupervisor">
        <span class="mx-1 text-border-strong">/</span>
        <span class="font-semibold text-ink">Co-encadrant :</span> {{ coSupervisor }}
      </template>
    </p>

    <button
      type="button"
      class="group mt-4 inline-flex items-center justify-end gap-1.5 self-end rounded-sm text-xs font-semibold text-ink underline decoration-border-strong underline-offset-4 transition hover:decoration-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
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