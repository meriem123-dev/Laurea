<script setup lang="ts">
import BaseSelect from '../forms/BaseSelect.vue'
import SearchInput from '../forms/SearchInput.vue'

export interface FilterSelect {
  key: string
  ariaLabel: string
  options: { value: string; label: string }[]
  modelValue: string
}

defineProps<{
  search: string
  searchLabel: string
  searchPlaceholder?: string
  selects?: FilterSelect[]
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:select': [key: string, value: string]
}>()
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-xl border border-border bg-white p-3 sm:flex-row sm:items-center sm:p-4"
  >
    <SearchInput
      :modelValue="search"
      class="sm:flex-1"
      :placeholder="searchPlaceholder"
      :ariaLabel="searchLabel"
      @update:modelValue="emit('update:search', $event)"
    />

    <BaseSelect
      v-for="select in selects"
      :key="select.key"
      :modelValue="select.modelValue"
      :options="select.options"
      size="md"
      class="sm:w-56"
      :ariaLabel="select.ariaLabel"
      @update:modelValue="emit('update:select', select.key, $event)"
    />

    <slot name="actions" />
  </div>
</template>