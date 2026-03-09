# Home Inventory

A personal web app to register and manage valuable household belongings — musical instruments, jewelry, electronics, art, and more. Tracks purchase prices, estimated values, condition, location, and insurance details.

## Stack

- **Next.js 14** (App Router) — React framework
- **Prisma + SQLite** — persistent local database
- **Tailwind CSS** — styling

## Setup

**Requirements:** Node.js 18+

```bash
# 1. Go to the project directory
cd household-inventory

# 2. Install dependencies
npm install

# 3. Create the database and run migrations
npx prisma db push

# 4. Load example seed data (optional)
npm run db:seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Dashboard** — Total estimated value, gain/loss vs. purchase price, items per category with visual bars, recently added items
- **Inventory list** — Search by name/brand/model/serial, filter by category, sort by any column
- **Item detail** — All fields, image, financial summary, insurance status
- **Add / Edit items** — Clean form with all fields, inline custom category creation, image URL or file upload
- **Delete** — Confirmation dialog before deleting
- **CSV export** — Download all items via sidebar link (`/api/export`)
- **Insurance tracking** — Mark items as insured, store policy reference

## Data model

Each item stores: name, category, brand, model, description, serial number, purchase date, purchase price, current estimated value, condition, location in home, notes, image (URL or uploaded file), insured status, insurance policy reference.

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run db:seed` | Load example items |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run setup` | Push schema + seed (fresh start) |

## Project structure

```
app/
  page.tsx                  Dashboard
  items/
    page.tsx                Inventory list
    new/page.tsx            Add item
    [id]/page.tsx           Item detail
    [id]/edit/page.tsx      Edit item
  api/
    items/route.ts          GET list, POST create
    items/[id]/route.ts     GET, PUT, DELETE single item
    categories/route.ts     GET list, POST create
    export/route.ts         CSV download
    upload/route.ts         Image upload

components/
  Sidebar.tsx               Navigation
  ItemForm.tsx              Add/edit form
  ItemsClient.tsx           Search/filter/sort table
  DeleteButton.tsx          Delete with confirmation

lib/
  prisma.ts                 Prisma client singleton
  utils.ts                  Formatters and types

prisma/
  schema.prisma             Database schema
  seed.ts                   Example data (10 items)
  dev.db                    SQLite database file
```

## Productie

```bash
# Build en start de productieversie
npm run build
npm start
```

Bij problemen na een update (bijv. HTTP 500 / module not found):

```bash
# Wis de build-cache en herbouw
rm -rf .next
npm run build
npm start
```

**Database-pad:** de `DATABASE_URL` in `.env` moet `file:./dev.db` zijn (relatief aan de `prisma/`-map). Gebruik **niet** `file:./prisma/dev.db`.

## Backup

The entire database is a single file at `prisma/dev.db`. Copy it to back up all your data. You can also export to CSV at any time from the sidebar.
