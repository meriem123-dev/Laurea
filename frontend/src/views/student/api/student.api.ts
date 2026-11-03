import { http } from "../../../api/http";
import type { Student } from "../../../types/student";
import type { StudentDto } from "../../admin/api/students.api";
import { toStudent } from "../../admin/api/students.api";

//api profil connecté
export async function fetchMyStudentProfile(): Promise<Student> {
  const { data } = await http.get<StudentDto>("api/students/me");
  return toStudent(data);
}