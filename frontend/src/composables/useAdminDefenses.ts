import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useDefensesStore } from "../views/admin/stores/defenses";
import { useProfessorsStore } from "../views/admin/stores/professors";
import { useProjectsStore } from "../views/admin/stores/projects";
import { useRoomsStore } from "../views/admin/stores/rooms";
import { useStudentsStore } from "../views/admin/stores/students";
import type { Defense } from "../types/defense";
import type { Professor } from "../types/professor";
import { teamMembers } from "../utils/project";
import { fullName } from "../utils/student";
import type { DefenseView } from "./useDefensesData";

// Même forme que useDefensesData, mais branché sur l'API (pages admin : soutenances, jurys, salles).
// useDefensesData reste sur les données fictives pour les espaces enseignant et étudiant.
export function useAdminDefenses() {
  const defensesStore = useDefensesStore();
  const projectsStore = useProjectsStore();
  const professorsStore = useProfessorsStore();
  const studentsStore = useStudentsStore();
  const roomsStore = useRoomsStore();

  const { items: defenses, loading, error } = storeToRefs(defensesStore);
  const projects = computed(() => projectsStore.items);
  const professors = computed<Professor[]>(() => professorsStore.items);
  const students = computed(() => studentsStore.items);
  const rooms = computed(() => roomsStore.items);

  // Soutenance enrichie avec les objets liés, prête à être affichée
  function toView(defense: Defense): DefenseView {
    const project = projects.value.find(
      (item) => item.id === defense.projectId,
    );
    const team = project ? teamMembers(project, students.value) : [];

    return {
      defense,
      project,
      students: team,
      studentNames: team.map((student) => fullName(student)).join(", "),
      room: rooms.value.find((item) => item.id === defense.roomId),
      president: professors.value.find(
        (item) => item.id === defense.presidentId,
      ),
      members: defense.memberIds
        .map((id) => professors.value.find((item) => item.id === id))
        .filter((professor): professor is Professor => professor !== undefined),
    };
  }

  const views = computed(() =>
    [...defenses.value]
      .sort(
        (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
      )
      .map(toView),
  );

  // Tout ce qu'il faut pour afficher les soutenances
  function loadAll() {
    return Promise.all([
      defensesStore.fetchAll(),
      projectsStore.fetchAll(),
      professorsStore.fetchAll(),
      studentsStore.fetchAll(),
      roomsStore.fetchAll(),
    ]);
  }

  return {
    defenses,
    views,
    projects,
    professors,
    students,
    rooms,
    loading,
    error,
    toView,
    loadAll,
    fetchDefenses: defensesStore.fetchAll,
    addDefense: defensesStore.create,
    updateDefense: defensesStore.update,
    removeDefense: defensesStore.remove,
  };
}
