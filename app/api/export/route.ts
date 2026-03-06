import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.item.findMany({ orderBy: { category: 'asc' } })

  const headers = [
    'Name', 'Category', 'Brand', 'Model', 'Serial Number',
    'Condition', 'Location', 'Purchase Date', 'Purchase Price (EUR)',
    'Current Value (EUR)', 'Gain/Loss (EUR)', 'Insured', 'Insurance Ref',
    'Description', 'Notes',
  ]

  const rows = items.map((item) => {
    const gain = item.purchasePrice !== null ? item.currentValue - item.purchasePrice : ''
    return [
      item.name,
      item.category,
      item.brand ?? '',
      item.model ?? '',
      item.serialNumber ?? '',
      item.condition,
      item.location ?? '',
      item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : '',
      item.purchasePrice ?? '',
      item.currentValue,
      gain,
      item.isInsured ? 'Yes' : 'No',
      item.insuranceRef ?? '',
      item.description ?? '',
      item.notes ?? '',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`)
  })

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="household-inventory-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
