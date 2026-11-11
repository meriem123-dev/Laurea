<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DefenseDetailsModal from '../../components/defenses/DefenseDetailsModal.vue'
import DefenseFormModal from '../../components/defenses/DefenseFormModal.vue'
import JuryCard from '../../components/jury/JuryCard.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import { useAdminDefenses } from '../../composables/useAdminDefenses'
import type { DefenseView } from '../../composables/useDefensesData'
import BaseButton from '../../components/common/BaseButton.vue'
import { JURY_MEMBER_COUNT } from '../../utils/defense'
import type { Defense } from '../../types/defense'

// soutenances, projets, professeurs et salles chargés depuis le back
const { views, loading, error, loadAll } = useAdminDefenses()
onMounted(() => loadAll())


const selected = ref<Defense | null>(null)
const isDetailsOpen = ref(false)
const isFormOpen = ref(false)
// la fiche affiche la soutenance enrichie avec les données du back
const selectedView = computed(() =>
  selected.value ? (views.value.find((item) => item.defense.id === selected.value?.id) ?? null) : null,
)

const completeCount = computed(
  () => views.value.filter((item) => item.members.length >= JURY_MEMBER_COUNT).length,
)

function openDetails(item: DefenseView) {
  selected.value = item.defense
  isDetailsOpen.value = true
}

function editFromDetails() {
  isDetailsOpen.value = false
  isFormOpen.value = true
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Année universitaire 2024–2025"
      title="Constitution des jurys"
      subtitle="Consultez les présidents et les membres affectés à chaque soutenance."
    >
      <div class="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
        <span class="font-display text-2xl leading-none text-ink tabular-nums">
          {{ completeCount }}
        </span>
        <span class="text-xs text-text-secondary">
          {{ completeCount > 1 ? 'jurys constitués' : 'jury constitué' }}
        </span>
      </div>
    </PageHeader>
    
        <p v-if="loading" class="text-sm text-text-muted">Chargement des jurys…</p>
        <div
          v-else-if="error"
          role="alert"
          class="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <span>{{ error }}</span>
          <BaseButton variant="secondary" size="md" @click="loadAll()">Réessayer</BaseButton>
        </div>

    <p
      v-else-if="views.length === 0"
      class="rounded-xl border border-dashed border-border-strong bg-card/60 py-16 text-center text-sm text-text-muted"
    >
      Aucune soutenance planifiée pour le moment.
    </p>

    <ul v-else class="flex flex-col gap-4">
      <li
        v-for="(item, index) in views"
        :key="item.defense.id"
        class="min-w-0 motion-safe:animate-fade-up"
        :style="{ animationDelay: `${Math.min(index, 8) * 60}ms` }"
      >
        <JuryCard :view="item" @view="openDetails" />
      </li>
    </ul>

    <DefenseDetailsModal
      v-model="isDetailsOpen"
      :defense="selected"
      :view="selectedView"
      editable
      @edit="editFromDetails"
    />
    <DefenseFormModal
      v-model="isFormOpen"
      :defense="selected"
      :initialDate="selected?.date ?? ''"
    />
  </div>
</template>