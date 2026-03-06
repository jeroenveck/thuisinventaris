import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ItemForm from '@/components/ItemForm'

export default async function EditItemPage({ params }: { params: { id: string } }) {
  const [item, categories] = await Promise.all([
    prisma.item.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!item) notFound()

  const serializedItem = {
    ...item,
    purchaseDate: item.purchaseDate?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }

  const serializedCategories = categories.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }))

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
          <Link href="/items" className="hover:text-slate-600 transition-colors">Inventaris</Link>
          <span>›</span>
          <Link href={`/items/${item.id}`} className="hover:text-slate-600 transition-colors truncate max-w-xs">
            {item.name}
          </Link>
          <span>›</span>
          <span className="text-slate-600">Bewerken</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Item bewerken</h1>
        <p className="text-slate-500 text-sm mt-0.5">{item.name}</p>
      </div>

      <ItemForm item={serializedItem} categories={serializedCategories} />
    </div>
  )
}
