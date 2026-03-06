import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const existing = await prisma.category.findUnique({ where: { name: body.name.trim() } })
  if (existing) return NextResponse.json(existing)

  const category = await prisma.category.create({
    data: {
      name: body.name.trim(),
      color: body.color || '#6366f1',
      isDefault: false,
    },
  })

  return NextResponse.json(category, { status: 201 })
}
