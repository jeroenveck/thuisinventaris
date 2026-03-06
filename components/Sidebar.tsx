'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/items',
    label: 'Inventaris',
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
]

const Logo = () => (
  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  </div>
)

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = (onClick?: () => void) =>
    navItems.map((item) => {
      const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
      return (
        <Link
          key={item.href}
          href={item.href}
          title={item.label}
          onClick={onClick}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-slate-700/80 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      )
    })

  return (
    <>
      {/* ── Mobiele topbalk (< md) ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Logo />
          <p className="text-white font-semibold text-sm">Thuisinventaris</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Menu openen"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* ── Mobiel zijpaneel (drawer) ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Achtergrondoverlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-64 bg-slate-900 flex flex-col h-full shadow-2xl">
            {/* Header */}
            <div className="px-6 pt-6 pb-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo />
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">Thuisinventaris</p>
                  <p className="text-slate-500 text-xs">Persoonlijke collectie</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Menu sluiten"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigatie */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navLinks(() => setMobileOpen(false))}
            </nav>

            {/* Onderste acties */}
            <div className="px-3 pb-6 space-y-1">
              <Link
                href="/items/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Item toevoegen
              </Link>
              <a
                href="/api/export"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exporteer CSV
              </a>
            </div>
          </aside>
        </div>
      )}

      {/* ── Tablet / desktop sidebar (≥ md) ── */}
      <aside className="hidden md:flex md:w-16 lg:w-60 min-h-screen bg-slate-900 flex-col shrink-0 transition-[width] duration-200">
        {/* Logo */}
        <div className="px-3 lg:px-6 pt-8 pb-6 border-b border-slate-800">
          <div className="flex items-center justify-center lg:justify-start lg:gap-3">
            <Logo />
            <div className="hidden lg:block">
              <p className="text-white font-semibold text-sm leading-tight">Thuisinventaris</p>
              <p className="text-slate-500 text-xs">Persoonlijke collectie</p>
            </div>
          </div>
        </div>

        {/* Navigatie */}
        <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center justify-center lg:justify-start lg:gap-3 px-2 lg:px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-700/80 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Onderste acties */}
        <div className="px-2 lg:px-3 pb-6 space-y-1">
          <Link
            href="/items/new"
            title="Item toevoegen"
            className="flex items-center justify-center lg:justify-start lg:gap-3 px-2 lg:px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden lg:block">Item toevoegen</span>
          </Link>
          <a
            href="/api/export"
            title="Exporteer CSV"
            className="flex items-center justify-center lg:justify-start lg:gap-3 px-2 lg:px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden lg:block">Exporteer CSV</span>
          </a>
        </div>
      </aside>
    </>
  )
}
