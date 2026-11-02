import { computed, ref, type Ref } from "vue";
import type { ResultView } from "./useResultsData";
import type { PublicationState } from "../types/result";
import { normalizeText } from "../utils/format";
import { PUBLICATION_META } from "../utils/result";
import { fullName } from "../utils/student";
import { SPECIALITY_LABELS } from "../utils/speciality";
import type { Speciality } from "../types/student";

export function useResultFilters(views: Ref<ResultView[]>) {
  const search = ref("");
  const publication = ref<PublicationState | "">(""); // '' = tous
  const speciality = ref(""); // '' = toutes

  const publicationOptions = [
    { value: "", label: "Tous les statuts" },
    ...Object.entries(PUBLICATION_META).map(([value, meta]) => ({
      value,
      label: meta.label,
    })),
  ];

  const specialityOptions = computed(() => {
    const unique = [
      ...new Set(
        views.value
          .map((view) => view.student?.speciality)
          .filter((value): value is Speciality => value !== undefined),
      ),
    ].sort((a, b) => a.localeCompare(b, "fr"));
    return [
      { value: "", label: "Toutes les spécialités" },
      ...unique.map((value) => ({
        value,
        label:
          SPECIALITY_LABELS[value as keyof typeof SPECIALITY_LABELS] ?? value,
      })),
    ];
  });

  const counts = computed<Record<PublicationState, number>>(() => ({
    published: views.value.filter((view) => view.state === "published").length,
    toValidate: views.value.filter((view) => view.state === "toValidate")
      .length,
    missing: views.value.filter((view) => view.state === "missing").length,
  }));

  const filtered = computed(() => {
    const query = normalizeText(search.value);

    return views.value.filter((view) => {
      if (publication.value && view.state !== publication.value) return false;
      if (speciality.value && view.student?.speciality !== speciality.value)
        return false;
      if (!query) return true;

      const texts = [
        view.student ? fullName(view.student) : "",
        view.student?.matricule ?? "",
        view.project?.title ?? "",
      ];
      return texts.some((text) => normalizeText(text).includes(query));
    });
  });

  // Cliquer deux fois sur la même carte retire le filtre
  function toggle(state: PublicationState) {
    publication.value = publication.value === state ? "" : state;
  }

  return {
    search,
    publication,
    speciality,
    publicationOptions,
    specialityOptions,
    counts,
    filtered,
    toggle,
  };
}
