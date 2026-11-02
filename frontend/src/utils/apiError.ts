import axios from 'axios'

export function getErrorMessage(e: unknown, fallback = 'Une erreur est survenue.'): string {
  if (axios.isAxiosError(e)) {
    if (!e.response) return 'Le serveur est injoignable.'
    const message = e.response.data?.message
    if (Array.isArray(message)) return message.join(' ')
    if (typeof message === 'string') return message
  }
  return fallback
}