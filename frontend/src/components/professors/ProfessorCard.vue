<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2 } from '@lucide/vue'
import ActionMenu, { type ActionMenuItem } from '../common/ActionMenu.vue'
import BaseBadge from '../common/BaseBadge.vue'
import BaseButton from '../common/BaseButton.vue'
import InitialsAvatar from '../common/InitialsAvatar.vue'
import { availability, displayName, initials } from '../../utils/professor'
import type { Professor } from '../../types/professor'

const props = defineProps<{
  professor: Professor
}>()

const emit = defineEmits<{
  view: [professor: Professor]
  edit: [professor: Professor]
  delete: [professor: Professor]
}>()

const menuItems: ActionMenuItem[] = [
  { key: 'edit', label: 'Modifier', icon: Pencil },
  { key: 'delete', label: 'Supprimer', icon: Trash2, danger: true },
]

const status = computed(() => availability(props.professor))
const stats = computed(() => [
  { label: 'Jurys', value: props.professor.juryCount },
  { label: 'Projets', value: props.professor.projectCount },
])

function onAction(key: string) {
  if (key === 'edit') emit('edit', props.professor)
  else if (key === 'delete') emit('delete', props.professor)
}
</script>

<template>
  <article
    class="relative flex h-full flex-col rounded-xl border border-border bg-white p-5 text-center transition duration-300 hover:-translate-y-0.5 hover:border-border-strong"
  >
    <div class="absolute right-3 top-3">
      <ActionMenu
        :items="menuItems"
        :ariaLabel="`Actions pour ${displayName(professor)}`"
        @select="onAction"
      />
    </div>

    <div class="flex flex-1 flex-col items-center">
      <InitialsAvatar :initials="initials(professor)" size="lg" />

      <h2 class="mt-4 break-words font-display text-lg leading-tight text-ink">
        {{ displayName(professor) }}
      </h2>
      <p class="mt-1 text-xs text-text-muted">{{ professor.specialty }}</p>

      <BaseBadge :tone="status.tone" class="mt-3">{{ status.label }}</BaseBadge>
    </div>

    <dl class="mt-5 grid grid-cols-2 divide-x divide-border border-y border-border py-4">
      <div v-for="stat in stats" :key="stat.label" class="flex flex-col-reverse">
        <dt class="mt-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-text-muted">
          {{ stat.label }}
        </dt>
        <dd class="font-display text-3xl leading-none text-ink tabular-nums">{{ stat.value }}</dd>
      </div>
    </dl>

    <BaseButton variant="secondary" size="md" block class="mt-5" @click="emit('view', professor)">
      Voir le profil
    </BaseButton>
  </article>
</template>