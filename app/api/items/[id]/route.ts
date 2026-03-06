import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const item = await prisma.item.findUnique({ where: { id: params.id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()

  if (!body.name || !body.category || body.currentValue === undefined) {
    return NextResponse.json({ error: 'name, category and currentValue are required' }, { status: 400 })
  }

  const item = await prisma.item.update({
    where: { id: params.id },
    data: {
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

  return NextResponse.json(item)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.item.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
