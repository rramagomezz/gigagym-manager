import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import WorkLogs from './pages/WorkLogs'
import ClassLogs from './pages/ClassLogs'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/work-logs" element={<WorkLogs />} />
          <Route path="/class-logs" element={<ClassLogs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
