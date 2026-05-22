import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.png'

const ADMIN_EMAILS = ['rg17415@gmail.com', 'gigagym.centro@gmail.com']

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase().trim())

    if (!isAdmin) {
      const deviceKey = localStorage.getItem('gigagym_device_auth')
      const envKey = import.meta.env.VITE_EMPLOYEE_DEVICE_KEY
      if (!deviceKey || deviceKey !== envKey) {
        setError('Solo podés ingresar como empleado desde el dispositivo autorizado del gimnasio.')
        setLoading(false)
        return
      }
    }

    try {
      await signIn(email, password)
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="GigaGym" className="h-16 rounded-xl mb-4" />
          <p className="text-gray-500 text-sm">Sistema de gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-400">Email</label>
            <input type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 placeholder-gray-600"
              placeholder="tu@email.com" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-400">Contraseña</label>
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 placeholder-gray-600"
              placeholder="••••••••" required />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-red-900 to-red-700 text-white font-semibold py-3 rounded-xl hover:from-red-800 hover:to-red-600 transition-all disabled:opacity-50 mt-2">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
