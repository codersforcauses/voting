import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateId(length: number): string {
  let id = ''
  for (let i = 0; i < length; i++) {
    id += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]
  }
  return id
}

export function generateIds(count: number, idLength: number): string[] {
  const ids = new Set<string>()
  while (ids.size < count) {
    ids.add(generateId(idLength))
  }
  return [...ids]
}
