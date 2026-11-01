<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import EmptyState from '../../components/common/EmptyState.vue'
import SegmentedControl from '../../components/common/SegmentedControl.vue'
import ProfessorDefenseCard from '../../components/defenses/ProfessorDefenseCard.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import {
  useProfessorDefenses,
  type ProfessorDefense,
} from '../../composables/useProfessorDefenses'
import { CURRENT_PROFESSOR_ID } from '../../mocks/currentProfessor'
import { JURY_ROLE_META } from '../../utils/juryRole'
import type { JuryRole } from '../../types/dashboard'

type RoleFilter = 'all' | JuryRole

const router = useRouter()
const { items } = useProfessorDefenses(CURRENT_PROFESSOR_ID)

const roleFilter = ref<RoleFilter>('all')

const roleOptions: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'president', label: JURY_ROLE_META.president.label },
  { value: 'supervisor', label: JURY_ROLE_META.supervisor.label },
  { value: 'examiner', label: JURY_ROLE_META.examiner.label },
]

const filtered = computed(() =>
  roleFilter.value === 'all'
    ? items.value
    : items.value.filter((item) => item.role === roleFilter.value),
)

const emptyMessage = computed(() =>
  items.value.length === 0
    ? 'Aucune soutenance ne vous est affectée pour le moment.'
    : 'Aucune soutenance pour ce rôle.',
)

function openDetails(item: ProfessorDefense) {
  void router.push(`/professor/defenses/${item.view.defense.id}`)
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Espace enseignant"
      title="Mes soutenances"
      subtitle="Consultez vos participations, votre rôle et le détail de chaque soutenance."
    >
      <div
        class="flex items-center gap-3 rounded-full border border-primary-200 bg-primary-50 px-4 py-2"
      >
        <span class="font-display text-2xl leading-none text-primary-600 tabular-nums">
          {{ items.length }}
        </span>
        <span class="text-xs text-text-secondary">
          {{ items.length > 1 ? 'participations' : 'participation' }}
        </span>
      </div>
    </PageHeader>

    <SegmentedControl
      v-model="roleFilter"
      :options="roleOptions"
      ariaLabel="Filtrer par rôle"
    />

    <EmptyState v-if="filtered.length === 0" :message="emptyMessage" />

    <ul v-else class="flex flex-col gap-4">
      <li
        v-for="(item, index) in filtered"
        :key="item.view.defense.id"
        class="min-w-0 motion-safe:animate-fade-up"
        :style="{ animationDelay: `${Math.min(index, 8) * 60}ms` }"
      >
        <ProfessorDefenseCard :item="item" @view="openDetails" />
      </li>
    </ul>
  </div>
</template>