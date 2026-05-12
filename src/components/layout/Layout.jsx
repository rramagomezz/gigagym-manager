import Navbar from './Navbar'

export default function Layout({ children, isAdmin, onSignOut, employee }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAdmin={isAdmin} onSignOut={onSignOut} employee={employee} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
