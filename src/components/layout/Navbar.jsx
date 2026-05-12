import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ isAdmin, onSignOut, employee }) {
  const { pathname } = useLocation()

  const adminLinks = [
    { to: '/', label: '📊 Dashboard' },
    { to: '/employees', label: '👥 Empleados' },
    { to: '/work-logs', label: '🕐 Horas' },
    { to: '/class-logs', label: '🏋️ Clases' },
    { to: '/settings', label: '⚙️ Configuración' },
  ]

  const employeeLinks = [
    { to: '/work-logs', label: '🕐 Mis horas' },
    { to: '/class-logs', label: '🏋️ Mis clases' },
  ]

  const links = isAdmin ? adminLinks : employeeLinks

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span className="text-xl font-bold text-blue-600">GigaGym 💪</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
                  ${pathname === link.to
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'}`}>
                {link.label}
              </Link>
            ))}
            <div className="ml-3 pl-3 border-l border-gray-200 flex items-center gap-2">
              {employee && <span className="text-xs text-gray-500 hidden md:block">{employee.first_name}</span>}
              <button
                onClick={onSignOut}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
