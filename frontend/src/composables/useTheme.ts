import { computed, ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'laurea-theme'
const theme = ref<Theme>('light')
let initialized = false

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null // stockage indisponible (navigation privée, par exemple)
  }
}

function apply(value: Theme) {
  document.documentElement.classList.toggle('dark', value === 'dark')
}

function init() {
  if (initialized) return
  initialized = true

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  theme.value = readStored() ?? (media.matches ? 'dark' : 'light')
  apply(theme.value)

  // Suit le réglage du système tant que l'utilisateur n'a pas fait de choix
  media.addEventListener('change', (event) => {
    if (readStored() !== null) return
    theme.value = event.matches ? 'dark' : 'light'
    apply(theme.value)
  })
}

export function useTheme() {
  init()

  const isDark = computed(() => theme.value === 'dark')

  function setTheme(value: Theme) {
    theme.value = value
    apply(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // le choix reste valable pour cette session seulement
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, isDark, setTheme, toggleTheme }
}