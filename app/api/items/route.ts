import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name)
  let slug = base
  let counter = 2
  while (true) {
    const existing = await prisma.item.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
    if (!existing) return slug
    slug = `${base}-${counter++}`
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'createdAt'
  const order = searchParams.get('order') || 'desc'

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { brand: { contains: search } },
      { model: { contains: search } },
      { serialNumber: { contains: search } },
    ]
  }

  if (category) {
    where.category = category
  }

  const validSortFields = ['name', 'purchasePrice', 'currentValue', 'createdAt', 'category', 'condition']
  const sortField = validSortFields.includes(sort) ? sort : 'createdAt'
  const sortOrder = order === 'asc' ? 'asc' : 'desc'

  const items = await prisma.item.findMany({
    where,
    orderBy: { [sortField]: sortOrder },
  })

  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.name || !body.category || body.currentValue === undefined) {
    return NextResponse.json({ error: 'name, category and currentValue are required' }, { status: 400 })
  }

  const existingName = await prisma.item.findFirst({ where: { name: body.name.trim() } })
  if (existingName) {
    return NextResponse.json({ error: 'Er bestaat al een item met deze naam' }, { status: 409 })
  }

  const slug = await generateUniqueSlug(body.name.trim())

  const item = await prisma.item.create({
    data: {
      slug,
      name: body.name.trim(),
      category: body.category.trim(),
      brand: body.brand?.trim() || null,
      model: body.model?.trim() || null,
      description: body.description?.trim() || null,
      serialNumber: body.serialNumber?.trim() || null,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      purchasePrice: body.purchasePrice !== '' && body.purchasePrice !== null ? parseFloat(body.purchasePrice) : null,
      currentValue: parseFloat(body.currentValue),
      condition: body.condition || 'Good',
      location: body.location?.trim() || null,
      notes: body.notes?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      isInsured: body.isInsured === true,
      insuranceRef: body.insuranceRef?.trim() || null,
    },
  })

  return NextResponse.json(item, { status: 201 })
}
