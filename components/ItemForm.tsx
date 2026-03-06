'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CONDITIONS, type Category, type Item } from '@/lib/utils'

type Props = {
  item?: Item
  categories: Category[]
}

const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#f97316', '#ef4444', '#06b6d4', '#6b7280',
]

export default function ItemForm({ item, categories }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEdit = !!item

  const [form, setForm] = useState({
    name: item?.name ?? '',
    category: item?.category ?? '',
    brand: item?.brand ?? '',
    model: item?.model ?? '',
    description: item?.description ?? '',
    serialNumber: item?.serialNumber ?? '',
    purchaseDate: item?.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : '',
    purchasePrice: item?.purchasePrice?.toString() ?? '',
    currentValue: item?.currentValue?.toString() ?? '',
    condition: item?.condition ?? 'Goed',
    location: item?.location ?? '',
    notes: item?.notes ?? '',
    imageUrl: item?.imageUrl ?? '',
    isInsured: item?.isInsured ?? false,
    insuranceRef: item?.insuranceRef ?? '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1')
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Naam is verplicht'
    if (!form.category.trim()) errs.category = 'Categorie is verplicht'
    if (form.currentValue === '' || isNaN(parseFloat(form.currentValue))) {
      errs.currentValue = 'Huidige waarde is verplicht'
    }
    if (form.purchasePrice !== '' && isNaN(parseFloat(form.purchasePrice))) {
      errs.purchasePrice = 'Moet een getal zijn'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const data = new FormData()
    data.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: data })
    const json = await res.json()
    if (json.url) set('imageUrl', json.url)
    setUploadingImage(false)
  }

  async function addCategory() {
    if (!newCategoryName.trim()) return
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName.trim(), color: newCategoryColor }),
    })
    const cat = await res.json()
    setLocalCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
    set('category', cat.name)
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const url = isEdit ? `/api/items/${item!.id}` : '/api/items'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const saved = await res.json()
      router.push(`/items/${saved.id}`)
      router.refresh()
    } else {
      setLoading(false)
    }
  }

  const categoryColor = localCategories.find((c) => c.name === form.category)?.color ?? '#6b7280'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basisinformatie */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Basisinformatie</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Naam */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Naam <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="bijv. Fender Stratocaster"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow ${
                errors.name ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Categorie */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Categorie <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setShowNewCategory(true)
                  } else {
                    set('category', e.target.value)
                  }
                }}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow appearance-none pr-9 ${
                  errors.category ? 'border-red-400' : 'border-slate-300'
                }`}
              >
                <option value="">Selecteer categorie...</option>
                {localCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
                <option value="__new__">+ Nieuwe categorie toevoegen...</option>
              </select>
              {form.category && (
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: categoryColor }}
                />
              )}
            </div>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}

            {/* Nieuwe categorie inline */}
            {showNewCategory && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs font-medium text-slate-600">Nieuwe categorie</p>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Categorienaam"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs text-slate-500 mb-1.5">Kleur</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORY_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCategoryColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform ${newCategoryColor === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(false)}
                    className="flex-1 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Annuleren
                  </button>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="flex-1 py-1.5 text-xs text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Toevoegen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Staat */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Staat</label>
            <select
              value={form.condition}
              onChange={(e) => set('condition', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow appearance-none"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Merk */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Merk</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => set('brand', e.target.value)}
              placeholder="bijv. Fender"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => set('model', e.target.value)}
              placeholder="bijv. Player Stratocaster"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Serienummer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Serienummer</label>
            <input
              type="text"
              value={form.serialNumber}
              onChange={(e) => set('serialNumber', e.target.value)}
              placeholder="bijv. MX21123456"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow font-mono"
            />
          </div>

          {/* Locatie */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Locatie in huis</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="bijv. Woonkamer, Slaapkamersafe"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Omschrijving */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Omschrijving</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Korte omschrijving van het item..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
            />
          </div>
        </div>
      </section>

      {/* Financieel */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Financieel</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Aankoopdatum</label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) => set('purchaseDate', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Aankoopprijs (€)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.purchasePrice}
                onChange={(e) => set('purchasePrice', e.target.value)}
                placeholder="0"
                className={`w-full pl-7 pr-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow ${
                  errors.purchasePrice ? 'border-red-400' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.purchasePrice && <p className="mt-1 text-xs text-red-500">{errors.purchasePrice}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Huidige waarde (€) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.currentValue}
                onChange={(e) => set('currentValue', e.target.value)}
                placeholder="0"
                className={`w-full pl-7 pr-3.5 py-2.5 text-sm rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow ${
                  errors.currentValue ? 'border-red-400' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.currentValue && <p className="mt-1 text-xs text-red-500">{errors.currentValue}</p>}
          </div>
        </div>
      </section>

      {/* Verzekering */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Verzekering</h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isInsured}
            onChange={(e) => set('isInsured', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-700">Dit item is verzekerd</span>
        </label>

        {form.isInsured && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Polisnummer</label>
            <input
              type="text"
              value={form.insuranceRef}
              onChange={(e) => set('insuranceRef', e.target.value)}
              placeholder="bijv. INS-2024-0042"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>
        )}
      </section>

      {/* Foto & Notities */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Foto & Notities</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Foto</label>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => set('imageUrl', e.target.value)}
                  placeholder="https://... (plak afbeeldings-URL)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
                <p className="mt-1 text-xs text-slate-400">Plak een URL, of upload een bestand</p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {uploadingImage ? 'Uploaden...' : 'Bestand uploaden'}
                </button>
              </div>
            </div>
            {form.imageUrl && (
              <div className="mt-3 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="Voorbeeld" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('imageUrl', '')}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notities</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              placeholder="Aanvullende notities..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
            />
          </div>
        </div>
      </section>

      {/* Opslaan */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Opslaan...
            </>
          ) : (
            isEdit ? 'Wijzigingen opslaan' : 'Item toevoegen'
          )}
        </button>
      </div>
    </form>
  )
}
