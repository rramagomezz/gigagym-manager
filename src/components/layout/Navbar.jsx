import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'

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
    { to: '/home', label: '🏠 Inicio' },
    { to: '/work-logs', label: '🕐 Mis horas' },
    { to: '/class-logs', label: '🏋️ Mis clases' },
  ]

  const links = isAdmin ? adminLinks : employeeLinks

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={isAdmin ? '/' : '/home'}>
            <img src={logo} alt="GigaGym" className="h-9 rounded-lg" />
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
                  ${pathname === link.to
                    ? 'bg-red-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                {link.label}
              </Link>
            ))}
            <div className="ml-3 pl-3 border-l border-gray-700 flex items-center gap-2">
              {employee && <span className="text-xs text-gray-500 hidden md:block">{employee.first_name}</span>}
              <button onClick={onSignOut}
                className="text-sm text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-gray-800">
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}