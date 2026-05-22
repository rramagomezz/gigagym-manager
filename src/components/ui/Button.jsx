export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button' }) {
  const base = 'font-semibold rounded-xl transition-all duration-200 disabled:opacity-50'
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' }
  const variants = {
    primary: 'bg-red-800 text-white hover:bg-red-900',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-gray-800 text-gray-300 hover:bg-gray-700',
    success: 'bg-green-700 text-white hover:bg-green-800'
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {children}
    </button>
  )
}