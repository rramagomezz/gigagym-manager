export default function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-400">{label}</label>}
      <input
        {...props}
        className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent placeholder-gray-600"
      />
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}
