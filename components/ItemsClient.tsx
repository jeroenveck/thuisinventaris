'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatCurrency, CONDITION_COLORS, itemUrl, type Item, type Category } from '@/lib/utils'

type Props = {
  items: Item[]
  categories: Category[]
  initialCategory?: string
}

type SortField = 'name' | 'category' | 'currentValue' | 'purchasePrice' | 'condition'
type SortOrder = 'asc' | 'desc'

export default function ItemsClient({ items, categories, initialCategory = '' }: Props) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState(initialCategory)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const categoryMap = useMemo(() => {
    const m: Record<string, string> = {}
    categories.forEach((c) => { m[c.name] = c.color })
    return m
  }, [categories])

  const filtered = useMemo(() => {
    let result = [...items]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.brand ?? '').toLowerCase().includes(q) ||
          (i.model ?? '').toLowerCase().includes(q) ||
          (i.serialNumber ?? '').toLowerCase().includes(q),
      )
    }

    if (filterCategory) {
      result = result.filter((i) => i.category === filterCategory)
    }

    result.sort((a, b) => {
      let av: string | number = a[sortField] ?? ''
      let bv: string | number = b[sortField] ?? ''
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortOrder === 'asc' ? -1 : 1
      if (av > bv) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [items, search, filterCategory, sortField, sortOrder])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return (
        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortOrder === 'asc' ? (
      <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10m-7 6h4" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h4M7 12h10m-3 6h-10" />
      </svg>
    )
  }

  return (
    <div className="space-y-5">
      {/* Zoekbalk + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam, merk, model, serienummer..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow appearance-none min-w-[160px]"
        >
          <option value="">Alle categorieën</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Aantal resultaten */}
      <p className="text-sm text-slate-500">
        {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        {(search || filterCategory) && ' gevonden'}
      </p>

      {/* Tabel */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">Geen items gevonden</p>
          {search && <p className="text-slate-400 text-sm">Probeer een andere zoekterm</p>}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 font-medium text-slate-500">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                      Naam <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3.5 font-medium text-slate-500">
                    <button onClick={() => toggleSort('category')} className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                      Categorie <SortIcon field="category" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3.5 font-medium text-slate-500 hidden md:table-cell">Merk</th>
                  <th className="text-left px-4 py-3.5 font-medium text-slate-500 hidden lg:table-cell">
                    <button onClick={() => toggleSort('condition')} className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                      Staat <SortIcon field="condition" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3.5 font-medium text-slate-500">
                    <button onClick={() => toggleSort('currentValue')} className="flex items-center gap-1.5 ml-auto hover:text-slate-800 transition-colors">
                      Waarde <SortIcon field="currentValue" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3.5 font-medium text-slate-500 hidden sm:table-cell">
                    <button onClick={() => toggleSort('purchasePrice')} className="flex items-center gap-1.5 ml-auto hover:text-slate-800 transition-colors">
                      Betaald <SortIcon field="purchasePrice" />
                    </button>
                  </th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item) => {
                  const color = categoryMap[item.category] ?? '#6b7280'
                  const conditionClass = CONDITION_COLORS[item.condition] ?? CONDITION_COLORS['Goed']
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-100" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <Link href={itemUrl(item)} className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                              {item.name}
                            </Link>
                            {item.location && (
                              <p className="text-xs text-slate-400 mt-0.5">{item.location}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${color}18`, color: color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 hidden md:table-cell">
                        {item.brand || <span className="text-slate-300">—</span>}
                        {item.model && <span className="text-slate-400 ml-1 text-xs">{item.model}</span>}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${conditionClass}`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(item.currentValue)}
                      </td>
                      <td className="px-4 py-4 text-right text-slate-500 tabular-nums hidden sm:table-cell">
                        {item.purchasePrice ? formatCurrency(item.purchasePrice) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={itemUrl(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Bekijken"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            href={`${itemUrl(item)}/edit`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Bewerken"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
