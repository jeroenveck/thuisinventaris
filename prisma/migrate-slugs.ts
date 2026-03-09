import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function generateUniqueSlug(name: string, excludeId: string): Promise<string> {
  const base = slugify(name)
  let slug = base
  let counter = 2
  while (true) {
    const existing = await prisma.item.findFirst({ where: { slug, id: { not: excludeId } } })
    if (!existing) return slug
    slug = `${base}-${counter++}`
  }
}

async function main() {
  const items = await prisma.item.findMany({ where: { slug: null } })

  if (items.length === 0) {
    console.log('Alle items hebben al een slug. Niets te doen.')
    return
  }

  console.log(`${items.length} items zonder slug gevonden. Slugs genereren...`)

  for (const item of items) {
    const slug = await generateUniqueSlug(item.name, item.id)
    await prisma.item.update({ where: { id: item.id }, data: { slug } })
    console.log(`  ✓ "${item.name}" → ${slug}`)
  }

  console.log('Migratie voltooid.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
