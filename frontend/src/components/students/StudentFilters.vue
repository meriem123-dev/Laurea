<script setup lang="ts">
import BaseSelect from '../forms/BaseSelect.vue'
import SearchInput from '../forms/SearchInput.vue'

defineProps<{
  search: string
  specialty: string
  specialtyOptions: { value: string; label: string }[]
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:specialty': [value: string]
}>()
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-xl border border-border bg-white p-3 sm:flex-row sm:items-center sm:p-4"
  >
    <SearchInput
      :model-value="search"
      class="sm:flex-1"
      placeholder="Nom ou matricule…"
      :ariaLabel="'Rechercher un étudiant'"
      @update:model-value="emit('update:search', $event)"
    />

    <BaseSelect
      :model-value="specialty"
      :options="specialtyOptions"
      size="md"
      class="sm:w-60"
      :ariaLabel="'Filtrer par spécialité'"
      @update:model-value="emit('update:specialty', $event)"
    />

    <slot name="actions" />
  </div>
</template>