import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Thuisinventaris',
  description: 'Bijhouden en beheren van waardevolle bezittingen thuis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-slate-50 text-slate-900 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
          {children}
        </main>
      </body>
    </html>
  )
}
