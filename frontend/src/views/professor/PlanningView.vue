<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import CalendarToolbar from "../../components/calendar/CalendarToolbar.vue";
import MonthGrid from "../../components/calendar/MonthGrid.vue";
import TimeGrid from "../../components/calendar/TimeGrid.vue";
import BaseAlert from "../../components/common/BaseAlert.vue";
import BaseCard from "../../components/common/BaseCard.vue";
import DefenseDetailsModal from "../../components/defenses/DefenseDetailsModal.vue";
import DefenseList from "../../components/defenses/DefenseList.vue";
import PageHeader from "../../components/layout/PageHeader.vue";
import { useCalendarNavigation } from "../../composables/useCalendarNavigation";
import type { DefenseView } from "../../composables/useDefensesData";
import { initialCursor, todayISO } from "../../utils/calendar";
import { toDefenseView } from "../../utils/teacherDefenseAdapter";
import type { Defense } from "../../types/defense";
import { useTeacherDefensesStore } from "./stores/useTeacherDefensesStore";

const store = useTeacherDefensesStore();
const { items, loading, error } = storeToRefs(store);

async function loadPlanning() {
  await store.fetchAll();
  // se place sur la prochaine soutenance (sinon la dernière)
  const dates = items.value.map((item) => item.date).sort();
  const target = dates.find((d) => d >= todayISO()) ?? dates[dates.length - 1];
  if (target) goTo(target);
}

onMounted(loadPlanning);

const myViews = computed(() => items.value.map(toDefenseView));

const { view, cursor, days, weeks, range, rangeLabel, shift, goToday, goTo } =
  useCalendarNavigation(initialCursor([]));

const today = todayISO();

const visibleViews = computed(() =>
  myViews.value.filter(
    (item) =>
      item.defense.date >= range.value.from &&
      item.defense.date <= range.value.to,
  ),
);

const isDetailsOpen = ref(false);

const selected = ref<Defense | null>(null);
const selectedView = ref<DefenseView | null>(null);

function openDetails(item: DefenseView) {
  selected.value = item.defense;
  selectedView.value = item;
  isDetailsOpen.value = true;
}

function openDay(date: string) {
  goTo(date);
  view.value = "day";
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Espace enseignant"
      title="Mon planning"
      subtitle="Retrouvez toutes vos soutenances : jurys et projets encadrés."
    />

    <CalendarToolbar
      v-model:view="view"
      :rangeLabel="rangeLabel"
      @prev="shift(-1)"
      @next="shift(1)"
      @today="goToday"
    />

    <BaseAlert v-if="error" variant="error">
      {{ error }}
      <button
        type="button"
        class="ml-2 font-semibold underline"
        @click="loadPlanning"
      >
        Réessayer
      </button>
    </BaseAlert>

    <p v-else-if="loading" class="text-sm text-text-muted">
      Chargement de votre planning…
    </p>

    <BaseCard v-else :padded="false" class="overflow-hidden">
      <TimeGrid
        v-if="view === 'day' || view === 'week'"
        :days="days"
        :items="visibleViews"
        :today="today"
        @select="openDetails"
      />
      <MonthGrid
        v-else-if="view === 'month'"
        :weeks="weeks"
        :month="cursor"
        :items="visibleViews"
        :today="today"
        @select="openDetails"
        @select-day="openDay"
      />
      <DefenseList v-else :items="visibleViews" @select="openDetails" />
    </BaseCard>
    <DefenseDetailsModal
      v-model="isDetailsOpen"
      :defense="selected"
      :view="selectedView"
    />
  </div>
</template>
