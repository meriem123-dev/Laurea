import type { Student } from '../types/student'

export function fullName(student: Pick<Student, 'firstName' | 'lastName'>): string {
  return `${student.firstName} ${student.lastName}`
}

export function initials(student: Pick<Student, 'firstName' | 'lastName'>): string {
  return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
}