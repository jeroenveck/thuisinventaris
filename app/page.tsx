import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, CONDITION_COLORS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const [items, categories] = await Promise.all([
    prisma.item.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const totalValue = items.reduce((sum, i) => sum + i.currentValue, 0)
  const totalCost = items.reduce((sum, i) => sum + (i.purchasePrice ?? 0), 0)
  const gain = totalValue - totalCost
  const insuredItems = items.filter((i) => i.isInsured)
  const insuredValue = insuredItems.reduce((sum, i) => sum + i.currentValue, 0)

  // Categorie-overzicht
  const categoryMap = new Map<string, { count: number; value: number; color: string }>()
  for (const cat of categories) {
    categoryMap.set(cat.name, { count: 0, value: 0, color: cat.color })
  }
  for (const item of items) {
    const entry = categoryMap.get(item.category)
    if (entry) {
      entry.count++
      entry.value += item.currentValue
    } else {
      categoryMap.set(item.category, { count: 1, value: item.currentValue, color: '#6b7280' })
    }
  }

  const categoryStats = Array.from(categoryMap.entries())
    .filter(([, v]) => v.count > 0)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.value - a.value)

  const recentItems = items.slice(0, 6)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Overzicht van je waardevolle bezittingen</p>
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

      {/* Totaalwaarde */}
      <div className="bg-white rounded-2xl border border-slate-200 p-7">
        <p className="text-sm font-medium text-slate-500 mb-1">Totale geschatte waarde</p>
        <p className="text-5xl font-semibold text-slate-900 tabular-nums">{formatCurrency(totalValue)}</p>
        {totalCost > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-slate-400">Aankoopprijs {formatCurrency(totalCost)}</span>
            <span className={`text-sm font-medium ${gain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({totalCost > 0 ? ((gain / totalCost) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        )}
      </div>

      {/* Statistiekkaarten */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Totaal items"
          value={items.length.toString()}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          sub={`verspreid over ${categoryStats.length} ${categoryStats.length === 1 ? 'categorie' : 'categorieën'}`}
        />
        <StatCard
          label="Verzekerde items"
          value={`${insuredItems.length} / ${items.length}`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          }
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          sub={insuredItems.length > 0 ? `${formatCurrency(insuredValue)} verzekerde waarde` : 'Geen verzekerde items'}
        />
        <StatCard
          label="Onverzekerde waarde"
          value={formatCurrency(totalValue - insuredValue)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          }
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          sub={`${items.length - insuredItems.length} items zonder dekking`}
        />
      </div>

      {/* Categorie-overzicht + recente items */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Categorieën */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">Per categorie</h2>
          {categoryStats.length === 0 ? (
            <LegeStatus label="Nog geen items" />
          ) : (
            <div className="space-y-4">
              {categoryStats.map(({ name, value, count, color }) => {
                const pct = totalValue > 0 ? (value / totalValue) * 100 : 0
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <Link href={`/items?category=${encodeURIComponent(name)}`} className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                          {name}
                        </Link>
                        <span className="text-xs text-slate-400">{count}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">{formatCurrency(value)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{pct.toFixed(1)}% van totaal</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recente items */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-900">Recent toegevoegd</h2>
            <Link href="/items" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              Alles bekijken →
            </Link>
          </div>

          {recentItems.length === 0 ? (
            <LegeStatus label="Nog geen items" action={{ href: '/items/new', label: 'Voeg je eerste item toe' }} />
          ) : (
            <div className="space-y-3">
              {recentItems.map((item) => {
                const catColor = categoryMap.get(item.category)?.color ?? '#6b7280'
                const condClass = CONDITION_COLORS[item.condition] ?? CONDITION_COLORS['Goed']
                return (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${catColor}18` }}>
                        <svg className="w-5 h-5" style={{ color: catColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{item.category}</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ring-1 ring-inset ${condClass}`}>
                          {item.condition}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-900 tabular-nums">{formatCurrency(item.currentValue)}</p>
                      {item.purchaseDate && (
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(item.purchaseDate)}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, iconBg, iconColor, sub,
}: {
  label: string
  value: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-0.5 tabular-nums">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function LegeStatus({ label, action }: { label: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      {action && (
        <Link href={action.href} className="text-sm font-medium text-indigo-600 hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  )
}
