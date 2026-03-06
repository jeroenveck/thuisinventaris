import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ItemForm from '@/components/ItemForm'

export default async function NewItemPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

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
          <span className="text-slate-600">Nieuw item</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Item toevoegen</h1>
        <p className="text-slate-500 text-sm mt-0.5">Registreer een nieuw waardevol bezit</p>
      </div>

      <ItemForm categories={serializedCategories} />
    </div>
  )
}
