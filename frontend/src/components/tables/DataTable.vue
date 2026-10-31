<script setup lang="ts" generic="T">
export interface TableColumn {
  key: string // le slot de la cellule s'appelle « cell-<key> »
  label: string
  align?: 'left' | 'right'
}

defineProps<{
  columns: TableColumn[]
  rows: T[]
  rowKey: (row: T) => string | number
  emptyText?: string
}>()
</script>

<template>
  <!-- Le défilement horizontal reste interne au tableau : la page ne défile jamais -->
  <div class="overflow-x-auto">
    <table class="w-full min-w-[44rem] border-collapse text-left">
      <thead>
        <tr class="border-b border-border">
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="whitespace-nowrap px-5 py-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-text-secondary"
            :class="column.align === 'right' ? 'text-right' : 'text-left'"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-border">
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="px-5 py-12 text-center text-sm text-text-muted">
            {{ emptyText ?? 'Aucun résultat.' }}
          </td>
        </tr>

        <tr
          v-for="(row, index) in rows"
          :key="rowKey(row)"
          class="transition-colors hover:bg-surface motion-safe:animate-fade-up"
          :style="{ animationDelay: `${Math.min(index, 8) * 50}ms` }"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-5 py-4 align-middle text-sm text-text-body"
            :class="column.align === 'right' ? 'text-right' : 'text-left'"
          >
            <slot :name="`cell-${column.key}`" :row="row" :index="index" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>