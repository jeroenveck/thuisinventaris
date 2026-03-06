import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed categorieën
  const categories = [
    { name: 'Muziekinstrumenten', color: '#8b5cf6', isDefault: true },
    { name: 'Sieraden', color: '#f59e0b', isDefault: true },
    { name: 'Elektronica', color: '#3b82f6', isDefault: true },
    { name: 'Kunst & Verzamelingen', color: '#ec4899', isDefault: true },
    { name: 'Horloges', color: '#10b981', isDefault: true },
    { name: 'Meubels', color: '#f97316', isDefault: true },
    { name: 'Overig', color: '#6b7280', isDefault: true },
  ]

  // Verwijder oude Engelstalige categorieën
  await prisma.category.deleteMany()

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
  }

  // Verwijder bestaande items
  await prisma.item.deleteMany()

  // Seed items
  const items = [
    {
      name: 'Fender Stratocaster',
      category: 'Muziekinstrumenten',
      brand: 'Fender',
      model: 'Player Stratocaster',
      description: 'Mexicaanse Stratocaster in Sonic Red lak met esdoorn hals.',
      serialNumber: 'MX21123456',
      purchaseDate: new Date('2021-06-15'),
      purchasePrice: 749,
      currentValue: 850,
      condition: 'Uitstekend',
      location: 'Woonkamer',
      notes: 'Pickups vervangen door Seymour Duncan SSL-1',
      isInsured: true,
      insuranceRef: 'INS-2021-0042',
    },
    {
      name: 'Martin D-28',
      category: 'Muziekinstrumenten',
      brand: 'Martin',
      model: 'D-28 Standard',
      description: 'Dreadnought akoestische gitaar met Sitka-sparren dek en Oost-Indisch rozenhout.',
      serialNumber: '2384750',
      purchaseDate: new Date('2019-03-10'),
      purchasePrice: 2999,
      currentValue: 3200,
      condition: 'Goed',
      location: 'Woonkamer',
      isInsured: true,
      insuranceRef: 'INS-2019-0015',
    },
    {
      name: 'Diamanten verlovingsring',
      category: 'Sieraden',
      brand: 'Tiffany & Co.',
      model: 'Solitaire',
      description: 'Platina zetting met 1,2 karaat rond briljant geslepen diamant, VS1 helderheid, G kleur.',
      purchaseDate: new Date('2018-11-20'),
      purchasePrice: 8500,
      currentValue: 9500,
      condition: 'Nieuwstaat',
      location: 'Slaapkamersafe',
      notes: 'Echtheidscertificaat in brandvrije doos',
      isInsured: true,
      insuranceRef: 'INS-2019-JEWEL-001',
    },
    {
      name: 'Sony Alpha A7 IV',
      category: 'Elektronica',
      brand: 'Sony',
      model: 'Alpha A7 IV',
      description: 'Full-frame spiegelloze camera met 33MP BSI CMOS sensor en 4K 60p video.',
      serialNumber: '5051234567',
      purchaseDate: new Date('2022-02-28'),
      purchasePrice: 2499,
      currentValue: 2200,
      condition: 'Uitstekend',
      location: 'Kantoor',
      notes: 'Inclusief 28-70mm kit lens en twee extra accu\'s',
      isInsured: false,
    },
    {
      name: 'MacBook Pro 14"',
      category: 'Elektronica',
      brand: 'Apple',
      model: 'MacBook Pro 14" M3 Pro',
      description: '14-inch MacBook Pro met M3 Pro chip, 18GB unified memory, 512GB SSD.',
      serialNumber: 'C02ZK9ABMD6T',
      purchaseDate: new Date('2023-11-05'),
      purchasePrice: 2499,
      currentValue: 2100,
      condition: 'Uitstekend',
      location: 'Kantoor',
      isInsured: false,
    },
    {
      name: 'Rolex Submariner',
      category: 'Horloges',
      brand: 'Rolex',
      model: 'Submariner Date 116610LN',
      description: 'Stalen Submariner met zwarte wijzerplaat en unidirectionele draaibare lunette.',
      serialNumber: 'RLX7654321',
      purchaseDate: new Date('2020-07-15'),
      purchasePrice: 9500,
      currentValue: 14000,
      condition: 'Uitstekend',
      location: 'Slaapkamersafe',
      notes: 'Volledige doos en papieren aanwezig',
      isInsured: true,
      insuranceRef: 'INS-2020-WATCH-001',
    },
    {
      name: 'Yamaha vleugel',
      category: 'Muziekinstrumenten',
      brand: 'Yamaha',
      model: 'C3X',
      description: "Yamaha C3X 185 cm vleugel in gepolijste ebbenhouten lak.",
      purchaseDate: new Date('2017-04-01'),
      purchasePrice: 22000,
      currentValue: 19500,
      condition: 'Goed',
      location: 'Woonkamer',
      isInsured: true,
      insuranceRef: 'INS-2017-PIANO-001',
    },
    {
      name: 'Cartier Love Armband',
      category: 'Sieraden',
      brand: 'Cartier',
      model: 'Love Bracelet Small',
      description: '18k geelgouden Love armband, klein model met 4 diamanten studs.',
      purchaseDate: new Date('2016-12-24'),
      purchasePrice: 6300,
      currentValue: 7200,
      condition: 'Uitstekend',
      location: 'Slaapkamersafe',
      isInsured: true,
      insuranceRef: 'INS-2017-JEWEL-002',
    },
    {
      name: 'iPad Pro 12,9"',
      category: 'Elektronica',
      brand: 'Apple',
      model: 'iPad Pro 12.9" M2',
      description: '12,9-inch iPad Pro met M2 chip, 256GB, Wi-Fi + Cellular, met Apple Pencil 2.',
      serialNumber: 'DMPX8ABCDF12',
      purchaseDate: new Date('2022-11-20'),
      purchasePrice: 1299,
      currentValue: 900,
      condition: 'Goed',
      location: 'Woonkamer',
      isInsured: false,
    },
    {
      name: 'Nederlands landschapsschilderij',
      category: 'Kunst & Verzamelingen',
      description: 'Origineel olieverf op doek, Nederlands landschap ca. 1920. Gesigneerd rechtsonder. Professioneel ingelijst.',
      purchaseDate: new Date('2015-09-10'),
      purchasePrice: 3500,
      currentValue: 5000,
      condition: 'Goed',
      location: 'Woonkamer',
      notes: 'Provenancedocumentatie beschikbaar. Getaxeerd in 2023.',
      isInsured: true,
      insuranceRef: 'INS-2015-ART-001',
    },
  ]

  for (const item of items) {
    await prisma.item.create({ data: item })
  }

  console.log(`✓ ${categories.length} categorieën aangemaakt`)
  console.log(`✓ ${items.length} items aangemaakt`)
  console.log('Seed voltooid.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
