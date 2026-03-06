import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import ItemsClient from '@/components/ItemsClient'

export const dynamic = 'force-dynamic'

export default async function ItemsPage({ searchParams }: { searchParams: { category?: string } }) {
  const [items, categories] = await Promise.all([
    prisma.item.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const totalValue = items.reduce((sum, i) => sum + i.currentValue, 0)

  const serializedItems = items.map((item) => ({
    ...item,
    purchaseDate: item.purchaseDate?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }))

  const serializedCategories = categories.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }))

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Inventaris</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {items.length} {items.length === 1 ? 'item' : 'items'} · Totale waarde {formatCurrency(totalValue)}
          </p>
        </div>
        <Link
          href="/items/new"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Item toevoegen
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-24 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-slate-700 font-medium">Je inventaris is leeg</p>
            <p className="text-slate-400 text-sm mt-1">Begin door je eerste waardevolle item toe te voegen</p>
          </div>
          <Link
            href="/items/new"
            className="mt-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Voeg je eerste item toe
          </Link>
        </div>
      ) : (
        <ItemsClient items={serializedItems} categories={serializedCategories} initialCategory={searchParams.category ?? ''} />
      )}
    </div>
  )
}
