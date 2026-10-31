<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch, type Component } from 'vue'
import { X } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    subtitle?: string
    icon?: Component
    closeLabel?: string
  }>(),
  { subtitle: '', closeLabel: 'Fermer' },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const titleId = useId()
const dialog = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function close() {
  emit('update:modelValue', false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return

  // Piège à focus : Tab reste dans la modale
  const items = Array.from(dialog.value.querySelectorAll<HTMLElement>(FOCUSABLE))
  const first = items[0]
  const last = items[items.length - 1]
  if (!first || !last) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      await nextTick()
      const firstField = dialog.value?.querySelector<HTMLElement>('input, select, textarea')
      ;(firstField ?? dialog.value)?.focus()
    } else {
      document.body.style.overflow = ''
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
        @keydown="onKeydown"
      >
        <div class="absolute inset-0 bg-ink/50" aria-hidden="true" @click="close" />

        <div
          ref="dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          class="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-border bg-white shadow-2xl outline-none motion-safe:animate-modal-in sm:rounded-xl"
        >
          <header class="flex shrink-0 items-start gap-4 border-b border-border px-5 py-5 sm:px-6">
            <span
              v-if="icon"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink"
            >
              <component :is="icon" class="h-5 w-5" :stroke-width="1.75" aria-hidden="true" />
            </span>

            <div class="min-w-0 flex-1">
              <h2
                :id="titleId"
                class="font-display text-2xl font-normal leading-tight tracking-tight text-ink"
              >
                {{ title }}
              </h2>
              <p v-if="subtitle" class="mt-1 text-sm text-text-secondary">{{ subtitle }}</p>
            </div>

            <button
              type="button"
              class="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              :aria-label="closeLabel"
              @click="close"
            >
              <X class="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="flex shrink-0 flex-col-reverse gap-3 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:justify-end sm:px-6"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>