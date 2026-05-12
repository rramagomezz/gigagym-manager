import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: '📊 Dashboard' },
  { to: '/employees', label: '👥 Empleados' },
  { to: '/work-logs', label: '🕐 Horas' },
  { to: '/class-logs', label: '🏋️ Clases' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span className="text-xl font-bold text-blue-600">GigaGym 💪</span>
          <div className="flex gap-1 overflow-x-auto">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
                  ${pathname === link.to
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'}`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
