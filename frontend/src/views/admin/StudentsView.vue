<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { FileUp, Pencil, Plus, User, UserPlus } from "@lucide/vue";
import BaseButton from "../../components/common/BaseButton.vue";
import ConfirmDialog from "../../components/common/ConfirmDialog.vue";
import DetailsModal from "../../components/common/DetailsModal.vue";
import EntityFormModal from "../../components/forms/EntityFormModal.vue";
import PageHeader from "../../components/layout/PageHeader.vue";
import FilterBar from "../../components/common/FilterBar.vue";
import StudentsTable from "../../components/students/StudentsTable.vue";
import { useStudentFilters } from "../../composables/useStudentFilters";
import { useStudentsStore } from "./stores/students";
import { ACCOUNT_STATUS_META } from "../../utils/accountStatus";
import { invitationNotice } from "../../utils/accountFields";
import { getErrorMessage } from "../../utils/apiError";
import { PROJECT_STATUS_META } from "../../utils/projectStatus";
import { fullName } from "../../utils/student";
import {
  buildStudentFields,
  studentToFormValues,
  toStudentData,
} from "../../utils/studentForm";
import type { FormValues } from "../../types/form";
import type { Student } from "../../types/student";
import { SPECIALITY_LABELS } from "../../utils/speciality";
import type { ImportError } from "../../types/student.js";

const fileInput = ref<HTMLInputElement | null>(null);
const isImporting = ref(false);
const importErrors = ref<ImportError[]>([]);

const CURSUS_LABELS = { MASTER: "Master", INGENIEUR: "Ingénieur" } as const;

//chargements etudiants
const store = useStudentsStore();
const { items: students, loading, error } = storeToRefs(store);
onMounted(() => store.fetchAll());

const { search, speciality, specialityOptions, filtered } =
  useStudentFilters(students);
const filterSelects = computed(() => [
  {
    key: "speciality",
    ariaLabel: "Filtrer par spécialité",
    options: specialityOptions.value,
    modelValue: speciality.value,
  },
]);

// Étudiant ciblé par la modification, le détail ou la suppression (null = création)
const selected = ref<Student | null>(null);
const isFormOpen = ref(false);
const isDetailsOpen = ref(false);
const isDeleteOpen = ref(false);

// Retours à l'utilisateur
const isSaving = ref(false);
const formError = ref<string | null>(null);
const feedback = ref<{
  tone: "success" | "warning" | "error";
  text: string;
} | null>(null);

const FEEDBACK_CLASSES = {
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
} as const;

const isEdit = computed(() => selected.value !== null);

// En modification, l'étudiant ne doit pas entrer en conflit avec ses propres valeurs
const others = computed(() =>
  students.value.filter((student) => student.id !== selected.value?.id),
);

const formFields = computed(() =>
  buildStudentFields({
    specialityOptions: Object.entries(SPECIALITY_LABELS).map(
      ([value, label]) => ({
        value,
        label,
      }),
    ),
    existingMatricules: others.value.map((student) => student.matricule),
    existingEmails: others.value.map((student) => student.email),
  }),
);

const initialValues = computed(() =>
  selected.value ? studentToFormValues(selected.value) : undefined,
);

//détails de l'étudiant
const detailsFields = computed(() => {
  const student = selected.value;
  if (!student) return [];
  return [
    { label: "Adresse e-mail", value: student.email },
    { label: "Matricule", value: student.matricule },
    { label: "Spécialité", value: student.speciality },
    { label: "Groupe", value: student.group ?? "Non renseigné" },
    { label: "Cursus", value: CURSUS_LABELS[student.cursus] },
    {
      label: "Compte",
      value: ACCOUNT_STATUS_META[student.accountStatus].label,
    },
  ];
});


const detailsBadge = computed(() => {
  const student = selected.value;
  if (!student) return undefined;
  if (!student.projectStatus) {
    return { label: "Statut PFE", text: "Sans projet", tone: "neutral" as const };
  }
  const meta = PROJECT_STATUS_META[student.projectStatus];
  return { label: "Statut PFE", text: meta.label, tone: meta.tone };
});

//ouverture modales
function openCreate() {
  selected.value = null;
  formError.value = null;
  isFormOpen.value = true;
}

function openDetails(student: Student) {
  selected.value = student;
  isDetailsOpen.value = true;
}

function openEdit(student: Student) {
  selected.value = student;
  formError.value = null;
  isFormOpen.value = true;
}

function editFromDetails() {
  isDetailsOpen.value = false;
  formError.value = null;
  isFormOpen.value = true;
}

function openDelete(student: Student) {
  selected.value = student;
  isDeleteOpen.value = true;
}

//créer ou modif
async function saveStudent(values: FormValues) {
  const data = toStudentData(values);
  const current = selected.value;
  formError.value = null;
  feedback.value = null;
  isSaving.value = true;
  try {
    if (current) {
      await store.update(current.id, data);
      feedback.value = { tone: "success", text: "Étudiant mis à jour." };
    } else {
      const emailSent = await store.create(data);
      feedback.value = emailSent
        ? {
            tone: "success",
            text: `Compte créé : une invitation a été envoyée à ${data.email}.`,
          }
        : {
            tone: "warning",
            text: "Compte créé, mais l’e-mail d’invitation n’a pas pu être envoyé. Renvoyez l’invitation.",
          };
    }
    isFormOpen.value = false; // on ne ferme que si tout s'est bien passé
  } catch (e) {
    formError.value = getErrorMessage(e, "Enregistrement impossible.");
  } finally {
    isSaving.value = false;
  }
}

//suppression
async function deleteStudent() {
  const current = selected.value;
  if (!current) return;
  feedback.value = null;
  try {
    await store.remove(current.id);
    feedback.value = { tone: "success", text: "Étudiant supprimé." };
  } catch (e) {
    feedback.value = {
      tone: "error",
      text: getErrorMessage(e, "Suppression impossible."),
    };
  } finally {
    isDeleteOpen.value = false;
  }
}

//importer fichier
async function onFileChosen(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  feedback.value = null;
  importErrors.value = [];
  isImporting.value = true;
  try {
    const result = await store.importFile(file);
    importErrors.value = result.errors;

    const failedMails = result.emailsFailed
      ? ` ${result.emailsFailed} invitation(s) non envoyée(s) : renvoie-les depuis la liste.`
      : "";

    feedback.value = {
      tone: result.errors.length || result.emailsFailed ? "warning" : "success",
      text: `${result.created} étudiant(s) importé(s) sur ${result.total}, ${result.errors.length} ligne(s) rejetée(s).${failedMails}`,
    };
  } catch (e) {
    feedback.value = {
      tone: "error",
      text: getErrorMessage(e, "Import impossible."),
    };
  } finally {
    isImporting.value = false;
    input.value = ""; // permet de re-sélectionner le même fichier
  }
}

//telecrger fichier
async function downloadTemplate() {
  try {
    const blob = await store.downloadTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele-etudiants.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    feedback.value = {
      tone: "error",
      text: getErrorMessage(e, "Téléchargement impossible."),
    };
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Ressources & cohortes"
      title="Gestion des étudiants"
      subtitle="Consultez, ajoutez et gérez les dossiers des étudiants."
    >
      <BaseButton size="md" class="w-full sm:w-auto" @click="openCreate">
        <Plus class="h-4 w-4" aria-hidden="true" />
        Ajouter un étudiant
      </BaseButton>
    </PageHeader>

    <FilterBar
      v-model:search="search"
      searchLabel="Rechercher un étudiant"
      searchPlaceholder="Nom ou matricule…"
      :selects="filterSelects"
      @update:select="(_key: string, value: string) => (speciality = value)"
    >
      <template #actions>
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.csv"
          class="hidden"
          @change="onFileChosen"
        />
        <BaseButton
          variant="secondary"
          size="md"
          class="w-full sm:w-auto"
          @click="downloadTemplate"
        >
          Télécharger le modèle
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="md"
          class="w-full sm:w-auto"
          :disabled="isImporting"
          @click="fileInput?.click()"
        >
          <FileUp class="h-4 w-4" aria-hidden="true" />
          {{ isImporting ? "Import en cours…" : "Importer" }}
        </BaseButton>
      </template>
    </FilterBar>

    <!-- affichage table ou error -->
    <p
      v-if="feedback"
      role="status"
      :class="[
        'rounded-lg border p-4 text-sm',
        FEEDBACK_CLASSES[feedback.tone],
      ]"
    >
      {{ feedback.text }}
    </p>

    <ul
      v-if="importErrors.length"
      class="max-h-60 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
    >
      <li v-for="err in importErrors" :key="err.line">
        <strong>Ligne {{ err.line }}</strong> : {{ err.message }}
      </li>
    </ul>

    <p v-if="loading" class="text-sm text-slate-500">
      Chargement des étudiants…
    </p>
    <div
      v-else-if="error"
      role="alert"
      class="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <span>{{ error }}</span>
      <BaseButton variant="secondary" size="md" @click="store.fetchAll()"
        >Réessayer</BaseButton
      >
    </div>

    <StudentsTable
      v-else
      :students="filtered"
      promotion="2024–2025"
      @view="openDetails"
      @edit="openEdit"
      @delete="openDelete"
    />

    <EntityFormModal
      v-model="isFormOpen"
      :title="isEdit ? 'Modifier l’étudiant' : 'Créer un étudiant'"
      :subtitle="
        isEdit
          ? 'Mettez à jour les informations de l’étudiant.'
          : 'Renseignez les informations du nouvel étudiant.'
      "
      :icon="isEdit ? Pencil : UserPlus"
      :fields="formFields"
      :initialValues="initialValues"
      :submitLabel="isEdit ? 'Enregistrer' : 'Créer l’étudiant'"
      :notice="isEdit ? undefined : invitationNotice('L’étudiant')"
      :error="formError"
      :loading="isSaving"
      @submit="saveStudent"
    />

    <DetailsModal
      v-model="isDetailsOpen"
      :title="selected ? fullName(selected) : ''"
      :subtitle="selected?.matricule"
      :icon="User"
      :fields="detailsFields"
      :badge="detailsBadge"
      editable
      @edit="editFromDetails"
    />

    <ConfirmDialog
      v-model="isDeleteOpen"
      title="Supprimer cet étudiant ?"
      :message="
        selected
          ? `Le dossier de ${fullName(selected)} (${selected.matricule}) sera supprimé. Cette action est irréversible.`
          : ''
      "
      confirmLabel="Supprimer"
      @confirm="deleteStudent"
    />
  </div>
</template>
