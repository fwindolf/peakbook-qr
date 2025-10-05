export interface Peak {
  id: string
  name: string
  description: string
  altitude: number
  latitude: number
  longitude: number
  country: string
  region: string
  created_by: string
  image_url?: string
  token?: string
  created_at: string
  updated_at: string
}

export interface PeakTranslation {
  id: string
  peak_id: string
  language_code: string
  name: string
  description: string
  region: string
  is_auto_translated: boolean
  is_moderated: boolean
  moderated_by?: string
  moderated_at?: string
  translation_source?: string
  translation_metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PeakEntry {
  id: string
  peak_id: string
  user_id: string
  entry_date: string
  note?: string
  image_url?: string
  photo_url?: string
  image_approved: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface PeakFormData {
  name: string
  description: string
  altitude: number
  latitude: number
  longitude: number
  country: string
  region: string
  image_url?: string
}
