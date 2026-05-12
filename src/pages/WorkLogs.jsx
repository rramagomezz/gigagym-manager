import { useState, useEffect } from 'react'
import { getEmployees } from '../api/employees'
import { getWorkLogs, createWorkLog, deleteWorkLog } from '../api/workLogs'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { formatCurrency } from '../utils/salary'

const now = new Date()
const emptyForm = {
  employee_id: '',
  date: now.toISOString().split('T')[0],
  hours: '',
  is_holiday: 'false',
  notes: ''
}

export default function WorkLogs() {
  const [logs, setLogs] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(now.getFullYear())

  useEffect(() => {
    fetchAll()
  }, [filterEmployee, filterMonth, filterYear])

  async function fetchAll() {
    setLoading(true)
    try {
      const [emps, logsData] = await Promise.all([
        getEmployees(),
        getWorkLogs(filterEmployee || null, filterMonth, filterYear)
      ])
      setEmployees(emps)
      setLogs(logsData)
      if (emps.length > 0 && !form.employee_id) {
        setForm(f => ({ ...f, employee_id: emps[0].id }))
      }
    } catch (e) {
      alert('Error al cargar datos: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!form.employee_id || !form.date || !form.hours) return alert('Completá todos los campos obligatorios')
    setSaving(true)
    try {
      await createWorkLog({
        employee_id: form.employee_id,
        date: form.date,
        hours: Number(form.hours),
        is_holiday: form.is_holiday === 'true',
        notes: form.notes || null
      })
      await fetchAll()
      setShowModal(false)
      setForm({ ...emptyForm, employee_id: form.employee_id })
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este registro?')) return
    try {
      await deleteWorkLog(id)
      await fetchAll()
    } catch (e) {
      alert('Error al eliminar: ' + e.message)
    }
  }

  function getEmployee(id) {
    return employees.find(e => e.id === id)
  }

  function calcPay(log) {
    const emp = getEmployee(log.employee_id)
    if (!emp) return 0
    return log.hours * (log.is_holiday ? emp.holiday_rate : emp.hourly_rate)
  }

  const totalHours = logs.reduce((acc, l) => acc + Number(l.hours), 0)
  const totalPay = logs.reduce((acc, l) => acc + calcPay(l), 0)

  const months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Horas trabajadas</h1>
        <Button onClick={() => setShowModal(true)}>+ Cargar horas</Button>
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

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500 mb-1">Total horas</p>
          <p className="text-2xl font-bold text-blue-600">{totalHours}hs</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 mb-1">Total a pagar</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPay)}</p>
        </Card>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : logs.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400 py-8">No hay registros para este período.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map(log => {
            const emp = getEmployee(log.employee_id)
            return (
              <Card key={log.id} className="flex justify-between items-center py-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    {emp ? `${emp.first_name} ${emp.last_name}` : 'Empleado eliminado'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(log.date + 'T12:00:00').toLocaleDateString('es-AR')} · {log.hours}hs
                    {log.is_holiday && <span className="ml-2 bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">Feriado</span>}
                  </p>
                  {log.notes && <p className="text-xs text-gray-400 mt-1">📝 {log.notes}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-green-600">{formatCurrency(calcPay(log))}</p>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(log.id)}>🗑️</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal title="Cargar horas" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <Select
              label="Empleado *"
              value={form.employee_id}
              onChange={e => setForm({ ...form, employee_id: e.target.value })}
              options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))}
            />
            <Input
              label="Fecha *"
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
            <Input
              label="Horas trabajadas *"
              type="number"
              step="0.5"
              value={form.hours}
              onChange={e => setForm({ ...form, hours: e.target.value })}
              placeholder="8"
            />
            <Select
              label="Tipo de día *"
              value={form.is_holiday}
              onChange={e => setForm({ ...form, is_holiday: e.target.value })}
              options={[
                { value: 'false', label: 'Día normal' },
                { value: 'true', label: 'Feriado' }
              ]}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Observaciones</label>
              <textarea
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Opcional..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}