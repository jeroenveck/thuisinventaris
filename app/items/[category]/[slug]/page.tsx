import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, CONDITION_COLORS, itemUrl } from '@/lib/utils'
import DeleteButton from '@/components/DeleteButton'

export const dynamic = 'force-dynamic'

export default async function ItemDetailPage({ params }: { params: { category: string; slug: string } }) {
  const [item, categories] = await Promise.all([
    prisma.item.findUnique({ where: { slug: params.slug } }),
    prisma.category.findMany(),
  ])

  if (!item) notFound()

  const categoryColor = categories.find((c) => c.name === item.category)?.color ?? '#6b7280'
  const conditionClass = CONDITION_COLORS[item.condition] ?? CONDITION_COLORS['Goed']
  const gain = item.purchasePrice !== null ? item.currentValue - item.purchasePrice : null
  const gainPct = item.purchasePrice ? ((gain! / item.purchasePrice) * 100).toFixed(1) : null

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Broodkruimel + acties */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <Link href="/items" className="hover:text-slate-600 transition-colors">Inventaris</Link>
            <span>›</span>
            <span className="text-slate-600 truncate max-w-xs">{item.name}</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">{item.name}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`${itemUrl(item)}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Bewerken
          </Link>
          <DeleteButton id={item.id} name={item.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hoofdinhoud */}
        <div className="lg:col-span-2 space-y-5">
          {/* Foto */}
          {item.imageUrl && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

          {/* Itemgegevens */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryColor }} />
                {item.category}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${conditionClass}`}>
                {item.condition}
              </span>
              {item.isInsured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                  Verzekerd
                </span>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {item.brand && (
                <Veld label="Merk" value={item.brand} />
              )}
              {item.model && (
                <Veld label="Model" value={item.model} />
              )}
              {item.serialNumber && (
                <Veld label="Serienummer" value={item.serialNumber} mono />
              )}
              {item.location && (
                <Veld label="Locatie" value={item.location} />
              )}
            </dl>

            {item.description && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Omschrijving</p>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            )}

            {item.notes && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Notities</p>
                <p className="text-sm text-slate-600 leading-relaxed">{item.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Zijpaneel */}
        <div className="space-y-5">
          {/* Waardekaart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Waarde</h3>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Huidige geschatte waarde</p>
              <p className="text-3xl font-semibold text-slate-900 tabular-nums">{formatCurrency(item.currentValue)}</p>
            </div>

            {item.purchasePrice !== null && (
              <>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-0.5">Aankoopprijs</p>
                  <p className="text-xl font-semibold text-slate-700 tabular-nums">{formatCurrency(item.purchasePrice)}</p>
                </div>
                {gain !== null && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-0.5">Winst / Verlies</p>
                    <p className={`text-xl font-semibold tabular-nums ${gain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                    </p>
                    {gainPct && (
                      <p className={`text-sm ${gain >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {gain >= 0 ? '+' : ''}{gainPct}%
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {item.purchaseDate && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">Aankoopdatum</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(item.purchaseDate)}</p>
              </div>
            )}
          </div>

          {/* Verzekering */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Verzekering</h3>
            {item.isInsured ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-sm font-medium">Verzekerd</span>
                </div>
                {item.insuranceRef && (
                  <div>
                    <p className="text-xs text-slate-400">Polisnummer</p>
                    <p className="text-sm font-mono text-slate-700">{item.insuranceRef}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="text-sm">Niet verzekerd</span>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Gegevens</h3>
            <dl className="space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Toegevoegd</dt>
                <dd className="text-slate-700">{formatDate(item.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Laatst bijgewerkt</dt>
                <dd className="text-slate-700">{formatDate(item.updatedAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function Veld({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</dt>
      <dd className={`text-sm text-slate-800 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
