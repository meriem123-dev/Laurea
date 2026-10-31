<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, type Component } from 'vue'
import { Ellipsis } from '@lucide/vue'

export interface ActionMenuItem {
  key: string
  label: string
  icon: Component
  danger?: boolean
}

defineProps<{
  items: ActionMenuItem[]
  ariaLabel: string
}>()

const emit = defineEmits<{
  select: [key: string]
}>()

const MENU_WIDTH = 208 // 13rem
const ITEM_HEIGHT = 40
const GAP = 6

const isOpen = ref(false)
const position = ref({ top: 0, left: 0 })
const trigger = ref<HTMLButtonElement | null>(null)
const menu = ref<HTMLElement | null>(null)

function place(itemCount: number) {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const height = itemCount * ITEM_HEIGHT + 16

  const left = Math.min(Math.max(8, rect.right - MENU_WIDTH), window.innerWidth - MENU_WIDTH - 8)
  const fitsBelow = rect.bottom + GAP + height <= window.innerHeight - 8
  const top = fitsBelow ? rect.bottom + GAP : Math.max(8, rect.top - GAP - height)

  position.value = { top, left }
}

function onPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (menu.value?.contains(target) || trigger.value?.contains(target)) return
  close()
}

function close(returnFocus = false) {
  isOpen.value = false
  document.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
  if (returnFocus) trigger.value?.focus()
}

function onViewportChange() {
  close()
}

async function open(itemCount: number) {
  place(itemCount)
  isOpen.value = true
  document.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('resize', onViewportChange)
  await nextTick()
  menu.value?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
}

function toggle(itemCount: number) {
  if (isOpen.value) close()
  else void open(itemCount)
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close(true)
    return
  }
  if (event.key === 'Tab') {
    close()
    return
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

  event.preventDefault()
  const entries = Array.from(menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
  if (entries.length === 0) return
  const current = entries.indexOf(document.activeElement as HTMLElement)
  const step = event.key === 'ArrowDown' ? 1 : -1
  entries[(current + step + entries.length) % entries.length]?.focus()
}

function choose(key: string) {
  close()
  emit('select', key)
}

onBeforeUnmount(() => close())
</script>

<template>
  <button
    ref="trigger"
    type="button"
    class="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
    :class="isOpen ? 'bg-surface-muted text-ink' : ''"
    aria-haspopup="menu"
    :aria-expanded="isOpen"
    :aria-label="ariaLabel"
    @click="toggle(items.length)"
  >
    <Ellipsis class="h-5 w-5" aria-hidden="true" />
  </button>

  <Teleport to="body">
    <div
      v-if="isOpen"
      ref="menu"
      role="menu"
      class="fixed z-50 w-52 rounded-xl border border-border bg-white p-1.5 shadow-xl motion-safe:animate-modal-in"
      :style="{ top: `${position.top}px`, left: `${position.left}px` }"
      @keydown="onMenuKeydown"
    >
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        role="menuitem"
        class="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[0.8125rem] font-medium transition-colors focus:outline-none"
        :class="
          item.danger
            ? 'text-danger-dark hover:bg-danger-soft focus-visible:bg-danger-soft'
            : 'text-ink hover:bg-surface-muted focus-visible:bg-surface-muted'
        "
        @click="choose(item.key)"
      >
        <component :is="item.icon" class="h-4 w-4 shrink-0" :stroke-width="1.75" aria-hidden="true" />
        {{ item.label }}
      </button>
    </div>
  </Teleport>
</template>