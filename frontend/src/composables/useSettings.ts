import { reactive, watch } from 'vue'
import type { NotificationType } from '../types/notification'

const STORAGE_KEY = 'laurea-settings'

export interface Settings {
  emailNotifications: boolean
  notifyTypes: Record<NotificationType, boolean>
}

const defaults: Settings = {
  emailNotifications: true,
  notifyTypes: { defense: true, project: true, jury: true, result: true, system: true },
}

function read(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(defaults)
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      emailNotifications: parsed.emailNotifications ?? defaults.emailNotifications,
      notifyTypes: { ...defaults.notifyTypes, ...parsed.notifyTypes },
    }
  } catch {
    return structuredClone(defaults) // stockage indisponible ou JSON invalide
  }
}

// État partagé au niveau du module.
// TODO backend : charger et enregistrer ces préférences via l'API (par utilisateur).
const settings = reactive<Settings>(read())

watch(
  settings,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // les réglages restent valables pour cette session seulement
    }
  },
  { deep: true },
)

export function useSettings() {
  return { settings }
}