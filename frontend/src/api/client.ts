const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export function buildUrl(path: string, base: string = BASE_URL): string {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path));
  if (!res.ok) throw new Error(`API ${res.status} sur ${path}`);
  return (await res.json()) as T;
}