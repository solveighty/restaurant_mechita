'use client'
import { useState } from 'react'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Bell, 
  ClipboardList, 
  UtensilsCrossed,
  LogOut 
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Notificaciones', href: '/admin/notifications', icon: Bell },
    { name: 'Pedidos', href: '/admin/orders', icon: ClipboardList },
    { name: 'Menús', href: '/admin/menus', icon: UtensilsCrossed },
  ]

  const handleExit = () => {
    router.push('/')
  }

  const NavLink = ({ item }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <Link
        href={item.href}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-lg
          transition-colors duration-200
          ${isActive 
            ? 'bg-orange-100 text-orange-600' 
            : 'text-gray-600 hover:bg-gray-100'
          }
        `}
      >
        <Icon className="w-5 h-5" />
        <span>{item.name}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil */}
      <div 
        className={`
          fixed inset-0 bg-black/50 z-40 lg:hidden
          transition-opacity duration-200
          ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r z-50
          transform transition-transform duration-200 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Panel Admin</h1>
        </div>
        <nav className="flex flex-col h-[calc(100%-64px)] justify-between">
          <div className="p-4 space-y-2">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
          
          {/* Botón de salida */}
          <div className="p-4 border-t">
            <button
              onClick={handleExit}
              className="
                flex items-center gap-3 px-4 py-2 w-full
                text-red-600 hover:bg-red-50 rounded-lg
                transition-colors duration-200
              "
            >
              <LogOut className="w-5 h-5" />
              <span>Salir del panel</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none lg:pl-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h2>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  )
} 