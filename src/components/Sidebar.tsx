import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Trophy, 
  Wallet, 
  Shield, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  X,
  BookOpen
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/getting-started', icon: BookOpen, label: 'Getting Started' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/accounts', icon: Wallet, label: 'My Account' },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen bg-sidebar border-r border-white/10 transition-all duration-300 z-50 ${
          collapsed ? 'w-20' : 'w-[280px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <button
          onClick={onToggle}
          className="hidden md:flex absolute top-6 -right-[15px] w-[30px] h-[30px] bg-primary rounded-full items-center justify-center text-white hover:bg-secondary transition-all hover:scale-110 z-10"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <button
          onClick={onMobileClose}
          className="md:hidden absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center min-h-[80px] border-b border-white/10 px-4 relative">
            {!collapsed ? (
              <h1 className="text-xl font-bold text-gradient-primary">TRADING COMP</h1>
            ) : (
              <TrendingUp className="text-primary" size={32} />
            )}
          </div>

          <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
            <div className="mb-8">
              {!collapsed && (
                <div className="px-4 mb-2">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Competition</p>
                </div>
              )}
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 transition-all border-l-3 ${
                      isActive(item.path)
                        ? 'bg-primary/20 text-white border-l-primary'
                        : 'text-white/70 hover:bg-primary/10 hover:text-white border-l-transparent hover:border-l-primary'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                )
              })}
            </div>

            {user?.is_admin && (
              <div>
                {!collapsed && (
                  <div className="px-4 mb-2">
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Admin</p>
                  </div>
                )}
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 px-4 py-3 transition-all border-l-3 ${
                    isActive('/admin')
                      ? 'bg-primary/20 text-white border-l-primary'
                      : 'text-white/70 hover:bg-primary/10 hover:text-white border-l-transparent hover:border-l-primary'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Shield size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">Admin Panel</span>}
                </Link>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              {!collapsed ? (
                <>
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight mb-1 truncate">{user?.username}</p>
                    <p className="text-xs text-white/50 leading-tight">Trader</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-white/50 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="w-full flex justify-center text-white/50 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
