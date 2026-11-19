import type { DefenseView } from "../composables/useDefensesData";
import type { Professor, ProfessorTitle } from "../types/professor";
import type { PersonDto, TeacherDefenseDto } from "../views/professor/api/defense.api";

function toProfessor(p: PersonDto): Professor {
  return {
    id: p.id,
    title: (p.title ?? undefined) as ProfessorTitle | undefined,
    name: `${p.firstName} ${p.lastName}`,
    email: "",
    specialty: "",
    juryCount: 0,
    projectCount: 0,
  };
}


export function toDefenseView(d: TeacherDefenseDto): DefenseView {
  const students = d.students.map((s) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
  }));

  return {
    defense: {
      id: d.id,
      projectId: d.project.id,
      date: d.date,
      time: d.time,
      duration: d.duration,
      roomId: d.room.id,
      presidentId: d.president.id,
      memberIds: d.members.map((m) => m.id),
    },
    project: {
      id: d.project.id,
      title: d.project.title,
      domain: d.project.domain,
      studentIds: students.map((s) => s.id),
    },
    students,
    studentNames: students
      .map((s) => `${s.firstName} ${s.lastName}`)
      .join(", "),
    room: {
      ...d.room,
      equipment: "",
      capacity: 0,
      tone: "blue" as const,
    },
    president: toProfessor(d.president),
    members: d.members.map(toProfessor),
  } as unknown as DefenseView;
}
