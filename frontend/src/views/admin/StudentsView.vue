<script setup lang="ts">
import { ref } from 'vue'
import { FileUp, Plus } from '@lucide/vue'
import BaseButton from '../../components/common/BaseButton.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import StudentFilters from '../../components/students/StudentFilters.vue'
import StudentsTable from '../../components/students/StudentsTable.vue'
import { useStudentFilters } from '../../composables/useStudentFilters'
import { students as studentsMock } from '../../mocks/students'
import type { Student } from '../../types/student'

// TODO backend : charger la liste via api/ + store (avec états chargement / erreur)
const students = ref<Student[]>(studentsMock)
const { search, specialty, specialtyOptions, filtered } = useStudentFilters(students)

// TODO backend : menu d'actions (voir, modifier, supprimer) + formulaire d'ajout + import
function openActions(student: Student) {
  console.info('Actions (simulées) pour :', student.id)
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Ressources & cohortes"
      title="Gestion des étudiants"
      subtitle="Consultez, ajoutez et gérez les dossiers des étudiants."
    >
      <BaseButton size="md" class="w-full sm:w-auto">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Ajouter un étudiant
      </BaseButton>
    </PageHeader>

    <StudentFilters
      v-model:search="search"
      v-model:specialty="specialty"
      :specialty-options="specialtyOptions"
    >
      <template #actions>
        <BaseButton variant="secondary" size="md" class="w-full sm:w-auto">
          <FileUp class="h-4 w-4" aria-hidden="true" />
          Importer
        </BaseButton>
      </template>
    </StudentFilters>

    <StudentsTable :students="filtered" promotion="2024–2025" @open-actions="openActions" />
  </div>
</template>