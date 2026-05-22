import { useState, useEffect } from 'react'
import { getEmployees } from '../api/employees'
import { getWorkLogs } from '../api/workLogs'
import { getClassLogs } from '../api/classLogs'
import { getClassTypes } from '../api/classTypes'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import { calcSalary, formatCurrency, formatDuration } from '../utils/salary'

const now = new Date()

const months = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
]

export default function Dashboard() {
  const [employees, setEmployees] = useState([])
  const [allWorkLogs, setAllWorkLogs] = useState([])
  const [allClassLogs, setAllClassLogs] = useState([])
  const [classTypes, setClassTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(now.getFullYear())

  useEffect(() => { fetchAll() }, [filterMonth, filterYear])

  async function fetchAll() {
    setLoading(true)
    try {
      const [emps, wLogs, cLogs, types] = await Promise.all([
        getEmployees(),
        getWorkLogs(null, filterMonth, filterYear),
        getClassLogs(null, filterMonth, filterYear),
        getClassTypes()
      ])
      setEmployees(emps)
      setAllWorkLogs(wLogs)
      setAllClassLogs(cLogs)
      setClassTypes(types)
    } catch (e) {
      alert('Error al cargar datos: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = filterEmployee
    ? employees.filter(e => e.id === filterEmployee)
    : employees

  const summaries = filteredEmployees.map(emp => {
    const workLogs = allWorkLogs.filter(l => l.employee_id === emp.id)
    const classLogs = allClassLogs.filter(l => l.employee_id === emp.id)
    const salary = calcSalary(emp, workLogs, classLogs, classTypes)
    const totalMinutes = workLogs.reduce((acc, l) => acc + Number(l.duration_minutes || 0), 0)
    const normalMinutes = workLogs.filter(l => !l.is_holiday).reduce((acc, l) => acc + Number(l.duration_minutes || 0), 0)
    const holidayMinutes = workLogs.filter(l => l.is_holiday).reduce((acc, l) => acc + Number(l.duration_minutes || 0), 0)
    return { emp, salary, totalMinutes, normalMinutes, holidayMinutes, classCount: classLogs.length }
  })

  const grandTotal = summaries.reduce((acc, s) => acc + s.salary.total, 0)
  const monthLabel = months.find(m => m.value === filterMonth)?.label

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">{monthLabel} {filterYear}</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Select
            label="Empleado"
            value={filterEmployee}
            onChange={e => setFilterEmployee(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              ...employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))
            ]}
          />
          <Select
            label="Mes"
            value={filterMonth}
            onChange={e => setFilterMonth(Number(e.target.value))}
            options={months.map(m => ({ value: m.value, label: m.label }))}
          />
          <Input
            label="Año"
            type="number"
            value={filterYear}
            onChange={e => setFilterYear(Number(e.target.value))}
          />
        </div>
      </Card>

      {/* Total general */}
<Card className="mb-6 bg-gradient-to-r from-red-900 to-red-800 border-red-900">
  <div className="flex justify-between items-center">
    <div>
      <p className="text-red-300 text-sm mb-1">Total a pagar — {monthLabel} {filterYear}</p>
      <p className="text-4xl font-bold text-white">{formatCurrency(grandTotal)}</p>
    </div>
    <div className="text-right text-sm text-red-300">
      <p>{filteredEmployees.length} empleado{filteredEmployees.length !== 1 ? 's' : ''}</p>
      <p>{allWorkLogs.length} jornadas registradas</p>
      <p>{allClassLogs.length} clases dictadas</p>
    </div>
  </div>
</Card>

      {/* Tarjetas por empleado */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : summaries.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400 py-8">No hay datos para este período.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {summaries.map(({ emp, salary, totalMinutes, normalMinutes, holidayMinutes, classCount }) => (
            <Card key={emp.id}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
  {emp.first_name} {emp.last_name}
</h3>
<p className="text-sm text-red-500">{emp.job_title || 'Sin cargo'}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(salary.total)}</p>
                  <p className="text-xs text-gray-400">sueldo total</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
    <p className="text-xs text-gray-500 mb-1">Horas normales</p>
    <p className="font-bold text-white">{formatDuration(normalMinutes)}</p>
    <p className="text-xs text-green-500">{formatCurrency(salary.normalPay)}</p>
  </div>
  <div className="bg-red-950 bg-opacity-50 rounded-xl p-3 border border-red-900">
    <p className="text-xs text-gray-500 mb-1">Horas feriado</p>
    <p className="font-bold text-white">{formatDuration(holidayMinutes)}</p>
    <p className="text-xs text-green-500">{formatCurrency(salary.holidayPay)}</p>
  </div>
  <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
    <p className="text-xs text-gray-500 mb-1">Clases dictadas</p>
    <p className="font-bold text-white">{classCount} clase{classCount !== 1 ? 's' : ''}</p>
    <p className="text-xs text-green-500">{formatCurrency(salary.classPay)}</p>
  </div>
  <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
    <p className="text-xs text-gray-500 mb-1">Total trabajado</p>
    <p className="font-bold text-white">{formatDuration(totalMinutes)}</p>
    <p className="text-xs text-green-500">{formatCurrency(salary.normalPay + salary.holidayPay)}</p>
  </div>
</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
