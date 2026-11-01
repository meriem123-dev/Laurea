<script setup lang="ts">
import BaseCard from '../common/BaseCard.vue'
import BaseSwitch from '../forms/BaseSwitch.vue'
import { useSettings } from '../../composables/useSettings'
import type { NotificationType } from '../../types/notification'
import { NOTIFICATION_META } from '../../utils/notification'

type ConfigurableType = Exclude<NotificationType, 'system'>

// Les notifications « système » restent toujours actives.
// Les descriptions dépendent de l'espace (admin, enseignant…).
defineProps<{
  descriptions: Record<ConfigurableType, string>
}>()

const { settings } = useSettings()

const types: ConfigurableType[] = ['defense', 'project', 'jury', 'result']
</script>

<template>
  <BaseCard title="Notifications" subtitle="Choisissez ce que vous souhaitez recevoir">
    <!-- TODO backend : enregistrer ces préférences côté serveur (elles sont ici stockées dans le navigateur) -->
    <div class="-mt-4 divide-y divide-border">
      <BaseSwitch
        id="setting-email"
        v-model="settings.emailNotifications"
        label="Recevoir aussi par e-mail"
        description="Un message est envoyé à votre adresse pour les notifications importantes."
      />
      <BaseSwitch
        v-for="type in types"
        :id="`setting-notify-${type}`"
        :key="type"
        v-model="settings.notifyTypes[type]"
        :label="NOTIFICATION_META[type].label"
        :description="descriptions[type]"
      />
    </div>
  </BaseCard>
</template>