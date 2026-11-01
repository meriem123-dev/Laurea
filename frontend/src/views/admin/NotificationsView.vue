<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCheck } from '@lucide/vue'
import BaseButton from '../../components/common/BaseButton.vue'
import BaseCard from '../../components/common/BaseCard.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import SegmentedControl from '../../components/common/SegmentedControl.vue'
import BaseSelect from '../../components/forms/BaseSelect.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import NotificationItem from '../../components/notifications/NotificationItem.vue'
import { useNotifications } from '../../composables/useNotifications'
import type { AppNotification, NotificationType } from '../../types/notification'
import { NOTIFICATION_META } from '../../utils/notification'

type ReadFilter = 'all' | 'unread'

const router = useRouter()
const { notifications, unreadCount, markAsRead, markAllAsRead, remove } = useNotifications()

const readFilter = ref<ReadFilter>('all')
const typeFilter = ref<NotificationType | ''>('') // '' = tous les types

const readOptions = computed<{ value: ReadFilter; label: string }[]>(() => [
  { value: 'all', label: 'Toutes' },
  { value: 'unread', label: `Non lues (${unreadCount.value})` },
])

const typeOptions = [
  { value: '', label: 'Tous les types' },
  ...(Object.keys(NOTIFICATION_META) as NotificationType[]).map((value) => ({
    value,
    label: NOTIFICATION_META[value].label,
  })),
]

const filtered = computed(() =>
  notifications.value.filter(
    (item) =>
      (readFilter.value === 'all' || !item.read) &&
      (!typeFilter.value || item.type === typeFilter.value),
  ),
)

const subtitle = computed(() =>
  unreadCount.value > 0
    ? `${unreadCount.value} notification(s) non lue(s).`
    : 'Vous êtes à jour.',
)

const emptyMessage = computed(() =>
  readFilter.value === 'unread' && !typeFilter.value
    ? 'Aucune notification non lue.'
    : 'Aucune notification pour le moment.',
)

function openNotification(item: AppNotification) {
  // TODO backend : PATCH /notifications/:id/read
  markAsRead(item.id)
  if (item.to) void router.push(item.to)
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
    <PageHeader
      eyebrow="Notifications et réglages"
      title="Notifications"
      :subtitle="subtitle"
    >
      <BaseButton
        variant="secondary"
        size="md"
        class="w-full sm:w-auto"
        :disabled="unreadCount === 0"
        @click="markAllAsRead"
      >
        <CheckCheck class="h-4 w-4" aria-hidden="true" />
        Tout marquer comme lu
      </BaseButton>
    </PageHeader>

    <div
      class="flex flex-col gap-4 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
    >
      <SegmentedControl v-model="readFilter" :options="readOptions" ariaLabel="Filtrer par lecture" />

      <BaseSelect
        :modelValue="typeFilter"
        :options="typeOptions"
        size="md"
        class="sm:w-56"
        ariaLabel="Filtrer par type de notification"
        @update:modelValue="typeFilter = $event as NotificationType | ''"
      />
    </div>

    <EmptyState v-if="filtered.length === 0" :message="emptyMessage" />

    <BaseCard v-else :padded="false" class="overflow-hidden motion-safe:animate-fade-up">
      <ul class="divide-y divide-border">
        <li v-for="item in filtered" :key="item.id">
          <NotificationItem
            :notification="item"
            showActions
            @open="openNotification"
            @read="markAsRead($event.id)"
            @remove="remove($event.id)"
          />
        </li>
      </ul>
    </BaseCard>
  </div>
</template>