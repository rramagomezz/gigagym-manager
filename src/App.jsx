import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import WorkLogs from './pages/WorkLogs'
import ClassLogs from './pages/ClassLogs'
import Settings from './pages/Settings'


function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Cargando...</div>
  if (!user) return <Navigate to="/login" />
  if (adminOnly && !isAdmin) return <Navigate to="/mis-horas" />
  return children
}

export default function App() {
  const { user, isAdmin, loading, signOut, employee } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg">
      Cargando...
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout isAdmin={isAdmin} onSignOut={signOut} employee={employee}>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute adminOnly>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/employees" element={
                  <ProtectedRoute adminOnly>
                    <Employees />
                  </ProtectedRoute>
                } />
                <Route path="/work-logs" element={<WorkLogs />} />
                <Route path="/class-logs" element={<ClassLogs />} />
                <Route path="/settings" element={
                  <ProtectedRoute adminOnly>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
