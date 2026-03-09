export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // diacritics verwijderen (é → e)
    .replace(/[^a-z0-9\s-]/g, '')   // speciale tekens verwijderen
    .trim()
    .replace(/\s+/g, '-')           // spaties → koppeltekens
    .replace(/-+/g, '-')            // dubbele koppeltekens samenvoegen
}

export function itemUrl(item: { category: string; slug?: string | null; id: string }): string {
  if (item.slug) {
    return `/items/${slugify(item.category)}/${item.slug}`
  }
  return `/items/${item.id}`
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatInputDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export const CONDITIONS = ['Nieuwstaat', 'Uitstekend', 'Goed', 'Redelijk', 'Slecht'] as const

export const CONDITION_COLORS: Record<string, string> = {
  Nieuwstaat: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Uitstekend: 'bg-blue-50 text-blue-700 ring-blue-200',
  Goed: 'bg-slate-50 text-slate-700 ring-slate-200',
  Redelijk: 'bg-amber-50 text-amber-700 ring-amber-200',
  Slecht: 'bg-red-50 text-red-700 ring-red-200',
}

export type ItemFormData = {
  name: string
  category: string
  brand: string
  model: string
  description: string
  serialNumber: string
  purchaseDate: string
  purchasePrice: string
  currentValue: string
  condition: string
  location: string
  notes: string
  imageUrl: string
  isInsured: boolean
  insuranceRef: string
}

export type Item = {
  id: string
  slug: string | null
  name: string
  category: string
  brand: string | null
  model: string | null
  description: string | null
  serialNumber: string | null
  purchaseDate: string | null
  purchasePrice: number | null
  currentValue: number
  condition: string
  location: string | null
  notes: string | null
  imageUrl: string | null
  isInsured: boolean
  insuranceRef: string | null
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: string
  name: string
  color: string
  isDefault: boolean
  createdAt: string
}
