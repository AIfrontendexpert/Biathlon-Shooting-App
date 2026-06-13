export type ShootingType = 'lezka' | 'stojka'

// Výsledek jednoho terče (trefené / netrefené / celkem)
export interface ShotResult {
  hit: number
  miss: number
  total: number
}

export interface AnalysisResult extends ShotResult {
  confidence: 'high' | 'medium' | 'low' | 'manual'
  note: string
  details?: string
}

export interface TargetPhoto {
  id: string
  type: ShootingType
  image: string // base64 data URL
  result: ShotResult
  analyzedAt: string
}

export interface Training {
  id: string
  date: string // YYYY-MM-DD (středa)
  note: string
  absence?: boolean
  photos: TargetPhoto[]
  createdAt: string
}

export interface Database {
  trainings: Training[]
}
