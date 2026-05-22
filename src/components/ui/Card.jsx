export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-gray-900 rounded-2xl border border-gray-800 p-6 ${className}`}>
      {children}
    </div>
  )
}