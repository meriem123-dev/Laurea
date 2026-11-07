import type { Room, RoomFormData, RoomTone } from "../../../types/room";
import { http } from "../../../api/http";

export interface RoomDto {
  id: string;
  name: string;
  block: string;
  pole: string;
  equipment: string;
  capacity: number;
  tone: string;
}

export function toRoom(dto: RoomDto): Room {
  return { ...dto, tone: dto.tone as RoomTone };
}

export async function fetchRooms(): Promise<Room[]> {
  const { data } = await http.get<RoomDto[]>("api/rooms");
  return data.map(toRoom);
}

export async function createRoom(
  input: RoomFormData & { tone?: RoomTone },
): Promise<Room> {
  const { data } = await http.post<RoomDto>("api/rooms", input);
  return toRoom(data);
}

export async function updateRoom(
  id: string,
  input: RoomFormData,
): Promise<Room> {
  const { data } = await http.patch<RoomDto>(`api/rooms/${id}`, input);
  return toRoom(data);
}

export async function deleteRoom(id: string): Promise<void> {
  await http.delete(`api/rooms/${id}`);
}