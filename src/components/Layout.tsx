import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useState } from 'react'

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      
      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-[280px]'
        }`}
      >
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
      
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-white p-3 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  )
}
