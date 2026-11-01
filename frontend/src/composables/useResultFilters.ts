import { computed, ref, type Ref } from 'vue'
import type { ResultView } from './useResultsData'
import type { PublicationState } from '../types/result'
import { normalizeText } from '../utils/format'
import { fullName } from '../utils/student'

export function useResultFilters(views: Ref<ResultView[]>) {
  const search = ref('')
  const publication = ref<PublicationState | ''>('') // '' = tous

  const counts = computed<Record<PublicationState, number>>(() => ({
    published: views.value.filter((view) => view.state === 'published').length,
    toValidate: views.value.filter((view) => view.state === 'toValidate').length,
    missing: views.value.filter((view) => view.state === 'missing').length,
  }))

  const filtered = computed(() => {
    const query = normalizeText(search.value)

    return views.value.filter((view) => {
      if (publication.value && view.state !== publication.value) return false
      if (!query) return true

      const texts = [
        view.student ? fullName(view.student) : '',
        view.student?.matricule ?? '',
        view.project?.title ?? '',
      ]
      return texts.some((text) => normalizeText(text).includes(query))
    })
  })

  // Cliquer deux fois sur la même carte retire le filtre
  function toggle(state: PublicationState) {
    publication.value = publication.value === state ? '' : state
  }

  return { search, publication, counts, filtered, toggle }
}