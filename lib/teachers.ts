export interface TeacherItem {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  badge?: string;
  merits?: string[] | string;
  experience?: string;
  subjects?: string[];
  vk?: string;
  telegram?: string;
  phone?: string;
  order?: number;
}

const PLACEHOLDER = /^(имя преподавателя|имя специалиста|ф и\.?\s*о\.?|и\.?\s*о\.?|преподаватель|педагог|специалист)$/i;

export function isRealTeacher(t?: { name?: string; role?: string } | null): boolean {
  if (!t) return false;
  const name = (t.name || "").trim();
  return name.length >= 2 && !PLACEHOLDER.test(name);
}

export function getTeacherMerits(t: TeacherItem): string[] {
  if (Array.isArray(t.merits)) {
    return t.merits.map((m) => String(m).trim()).filter(Boolean);
  }
  if (typeof t.merits === "string" && t.merits.trim()) {
    return t.merits
      .split(/[\n,;]+/)
      .map((m) => m.trim())
      .filter(Boolean);
  }
  return [];
}
