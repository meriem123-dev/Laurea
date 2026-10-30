import type { Component } from 'vue'

export interface NavItem {
  label: string
  to: string
  icon: Component
  badge?: number
}

export interface NavSection {
  label: string
  items: NavItem[]
}