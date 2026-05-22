import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function SetupDevice() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('checking')
  const navigate = useNavigate()

  useEffect(() => {
    const key = searchParams.get('key')
    const envKey = import.meta.env.VITE_EMPLOYEE_DEVICE_KEY

    if (key && key === envKey) {
      localStorage.setItem('gigagym_device_auth', key)
      setStatus('success')
      setTimeout(() => navigate('/login'), 2500)
    } else {
      setStatus('error')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <img src={logo} alt="GigaGym" className="h-16 rounded-xl mx-auto mb-6" />
        {status === 'checking' && (
          <p className="text-gray-400">Verificando...</p>
        )}
        {status === 'success' && (
          <div className="bg-green-950 border border-green-800 rounded-2xl p-8">
            <p className="text-green-400 text-xl font-bold mb-2">✅ Dispositivo autorizado</p>
            <p className="text-gray-400 text-sm">Este dispositivo ya puede usarse para ingresar como empleado.</p>
            <p className="text-gray-500 text-sm mt-2">Redirigiendo al login...</p>
          </div>
        )}
        {status === 'error' && (
          <div className="bg-red-950 border border-red-800 rounded-2xl p-8">
            <p className="text-red-400 text-xl font-bold mb-2">❌ Clave inválida</p>
            <p className="text-gray-400 text-sm">El link de autorización no es válido.</p>
          </div>
        )}
      </div>
    </div>
  )
}