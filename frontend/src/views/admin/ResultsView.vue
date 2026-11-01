<script setup lang="ts">
import { computed, ref } from 'vue'
import { Award, CircleCheck, Clock, Download } from '@lucide/vue'
import BaseAlert from '../../components/common/BaseAlert.vue'
import BaseButton from '../../components/common/BaseButton.vue'
import StatCard from '../../components/common/StatCard.vue'
import StatStrip from '../../components/common/StatStrip.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import ResultDetailsModal from '../../components/results/ResultDetailsModal.vue'
import ResultsTable from '../../components/results/ResultsTable.vue'
import { useResultFilters } from '../../composables/useResultFilters'
import { useResultsData, type ResultView } from '../../composables/useResultsData'
import { downloadTextFile, openPrintWindow } from '../../utils/download'
import { buildReportHtml, resultsToCsv } from '../../utils/resultExport'
import { fullName } from '../../utils/student'

const { views, publish } = useResultsData()
const { search, publication, counts, filtered, toggle } = useResultFilters(views)

const summary = [
  { state: 'published', label: 'Résultats validés', icon: CircleCheck, tone: 'success' },
  { state: 'toValidate', label: 'À valider', icon: Clock, tone: 'warning' },
  { state: 'missing', label: 'Notes manquantes', icon: Award, tone: 'danger' },
] as const

// Le résultat ouvert est relu à chaque changement : la fiche se met à jour après publication
const selectedId = ref<number | null>(null)
const isDetailsOpen = ref(false)
const selectedView = computed(
  () => views.value.find((view) => view.result.id === selectedId.value) ?? null,
)

const pvError = ref('')

function openCheck(view: ResultView) {
  selectedId.value = view.result.id
  isDetailsOpen.value = true
}

function publishSelected() {
  // TODO backend : POST /results/:id/publish. Le backend doit revérifier que toutes les notes
  // sont reçues. Ici : publication locale en mémoire, perdue au rechargement.
  if (selectedId.value !== null) publish(selectedId.value)
}

function printReport(view: ResultView | null) {
  if (!view) return
  // TODO backend : le PV officiel (PDF signé, numéroté) doit être généré côté serveur.
  const generatedOn = new Intl.DateTimeFormat('fr-FR').format(new Date())
  const title = `PV – ${view.student ? fullName(view.student) : 'soutenance'}`
  const opened = openPrintWindow(title, buildReportHtml(view, generatedOn))
  pvError.value = opened
    ? ''
    : 'Le navigateur a bloqué la fenêtre du PV. Autorisez les fenêtres pop-up pour ce site, puis réessayez.'
}

function openPv(view: ResultView) {
  printReport(view)
}

function exportResults() {
  // Exporte les lignes actuellement affichées (filtre et recherche compris)
  downloadTextFile('resultats-soutenances.csv', resultsToCsv(filtered.value))
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Suivi académique"
      title="Notes et résultats"
      subtitle="Contrôlez les évaluations, validez et publiez les résultats."
    >
      <BaseButton
        variant="secondary"
        size="md"
        class="w-full sm:w-auto"
        :disabled="filtered.length === 0"
        @click="exportResults"
      >
        <Download class="h-4 w-4" aria-hidden="true" />
        Exporter les résultats
      </BaseButton>
    </PageHeader>

    <StatStrip :columns="3" aria-label="Synthèse des résultats">
      <StatCard
        v-for="item in summary"
        :key="item.state"
        :label="item.label"
        :value="counts[item.state]"
        :hint="publication === item.state ? 'Retirer le filtre' : 'Voir le détail'"
        hintTone="neutral"
        :icon="item.icon"
        :tone="item.tone"
        interactive
        :active="publication === item.state"
        @click="toggle(item.state)"
      />
    </StatStrip>

    <BaseAlert v-if="pvError" variant="error">{{ pvError }}</BaseAlert>

    <ResultsTable
      v-model:search="search"
      :views="filtered"
      @check="openCheck"
      @pv="openPv"
    />

    <ResultDetailsModal
      v-model="isDetailsOpen"
      :view="selectedView"
      @publish="publishSelected"
      @pv="printReport(selectedView)"
    />
  </div>
</template>