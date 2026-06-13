import { Database, Training } from './types'

const DB_KEY = 'biatlog_db_v1'

export function loadDB(): Database {
  if (typeof window === 'undefined') return { trainings: [] }
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Nepodařilo se načíst data z localStorage:', e)
  }
  return { trainings: [] }
}

export function saveDB(db: Database): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch (e) {
    console.warn('Nepodařilo se uložit data do localStorage:', e)
  }
}

// Vrátí posledních `count` střed (YYYY-MM-DD) od dneška zpět, nejnovější první.
export function getWednesdays(count = 10): string[] {
  const result: string[] = []
  const now = new Date()
  for (let i = 0; i < count * 14; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    if (d.getDay() === 3) {
      result.push(d.toISOString().split('T')[0])
      if (result.length >= count) break
    }
  }
  return result
}

export function formatDate(ds: string): string {
  const d = new Date(ds + 'T12:00:00')
  return d.toLocaleDateString('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(ds: string): string {
  const d = new Date(ds + 'T12:00:00')
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function pct(hit: number, total: number): number {
  return total === 0 ? 0 : Math.round((hit / total) * 100)
}

export function getTrainingStats(training: Training) {
  const lezka = training.photos.filter((p) => p.type === 'lezka')
  const stojka = training.photos.filter((p) => p.type === 'stojka')
  const lH = lezka.reduce((s, p) => s + p.result.hit, 0)
  const lT = lezka.reduce((s, p) => s + p.result.total, 0)
  const sH = stojka.reduce((s, p) => s + p.result.hit, 0)
  const sT = stojka.reduce((s, p) => s + p.result.total, 0)
  return { lH, lT, sH, sT }
}

export function getAllStats(trainings: Training[]) {
  const all = trainings.flatMap((t) => t.photos)
  const lezka = all.filter((p) => p.type === 'lezka')
  const stojka = all.filter((p) => p.type === 'stojka')
  const lH = lezka.reduce((s, p) => s + p.result.hit, 0)
  const lT = lezka.reduce((s, p) => s + p.result.total, 0)
  const sH = stojka.reduce((s, p) => s + p.result.hit, 0)
  const sT = stojka.reduce((s, p) => s + p.result.total, 0)
  return { lH, lT, sH, sT, totalTrainings: trainings.length }
}
