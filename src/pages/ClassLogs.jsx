import { useState, useEffect } from 'react'
import { getEmployees } from '../api/employees'
import { getClassLogs, createClassLog, deleteClassLog } from '../api/classLogs'
import { getClassTypes } from '../api/classTypes'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { formatCurrency, calcClassBonus } from '../utils/salary'
import { useAuth } from '../hooks/useAuth'

const now = new Date()

const months = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
]

export default function ClassLogs() {
  const { isAdmin, employee: currentEmployee } = useAuth()
  const [logs, setLogs] = useState([])
  const [employees, setEmployees] = useState([])
  const [classTypes, setClassTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    employee_id: currentEmployee?.id || '',
    class_type_id: '',
    date: now.toISOString().split('T')[0],
    hours: '1',
    students_count: '',
    observations: ''
  })
  const [saving, setSaving] = useState(false)
  const [filterEmployee, setFilterEmployee] = useState(
    isAdmin ? '' : currentEmployee?.id || ''
  )
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(now.getFullYear())

  useEffect(() => {
    if (isAdmin || currentEmployee?.id) fetchAll()
  }, [filterEmployee, filterMonth, filterYear, currentEmployee, isAdmin])

  async function fetchAll() {
    setLoading(true)
    try {
      const employeeFilter = isAdmin ? (filterEmployee || null) : currentEmployee?.id
      const [emps, logsData, types] = await Promise.all([
        getEmployees(),
        getClassLogs(employeeFilter, filterMonth, filterYear),
        getClassTypes()
      ])
      setEmployees(emps)
      setLogs(logsData)
      setClassTypes(types)
      if (types.length > 0 && !form.class_type_id) {
        setForm(f => ({ ...f, class_type_id: types[0].id }))
      }
    } catch (e) {
      alert('Error al cargar datos: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!form.class_type_id || !form.date || !form.students_count) {
      return alert('Completá todos los campos obligatorios')
    }
    setSaving(true)
    try {
      await createClassLog({
        employee_id: isAdmin ? form.employee_id : currentEmployee.id,
        class_type_id: form.class_type_id,
        date: form.date,
        hours: Number(form.hours),
        students_count: Number(form.students_count),
        observations: form.observations || null
      })
      await fetchAll()
      setShowModal(false)
      setForm(f => ({ ...f, students_count: '', observations: '' }))
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este registro?')) return
    try {
      await deleteClassLog(id)
      await fetchAll()
    } catch (e) {
      alert('Error al eliminar: ' + e.message)
    }
  }

  function getEmployee(id) {
    return employees.find(e => e.id === id)
  }

  function getBonusForLog(log) {
    const ct = log.class_types
    if (!ct) return 0
    return calcClassBonus(log, ct)
  }

  const totalBonus = logs.reduce((acc, l) => acc + getBonusForLog(l), 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {isAdmin ? 'Clases dictadas' : 'Mis clases'}
        </h1>
        <Button onClick={() => setShowModal(true)}>+ Cargar clase</Button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {isAdmin && (
            <Select label="Empleado" value={filterEmployee}
              onChange={e => setFilterEmployee(e.target.value)}
              options={[
                { value: '', label: 'Todos' },
                ...employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))
              ]} />
          )}
          <Select label="Mes" value={filterMonth}
            onChange={e => setFilterMonth(Number(e.target.value))}
            options={months.map(m => ({ value: m.value, label: m.label }))} />
          <Input label="Año" type="number" value={filterYear}
            onChange={e => setFilterYear(Number(e.target.value))} />
        </div>
      </Card>

      {isAdmin && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <p className="text-sm text-gray-500 mb-1">Total clases</p>
            <p className="text-2xl font-bold text-red-500">{logs.length}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 mb-1">Total bonos</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalBonus)}</p>
          </Card>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : logs.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No hay clases para este período.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map(log => {
            const emp = getEmployee(log.employee_id)
            const bonus = getBonusForLog(log)
            const hasExtra = log.students_count > (log.class_types?.bonus_threshold || 10)
            return (
              <Card key={log.id} className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    {isAdmin && (
                      <p className="font-semibold text-white">
                        {emp ? `${emp.first_name} ${emp.last_name}` : 'Empleado eliminado'}
                      </p>
                    )}
                    <p className="text-sm text-red-500 font-medium">{log.class_types?.name || 'Clase'}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(log.date + 'T12:00:00').toLocaleDateString('es-AR')} · {log.hours}hs · {log.students_count} alumnos
                      {hasExtra && (
                        <span className="ml-2 bg-green-900 text-green-400 text-xs px-2 py-0.5 rounded-full">+bono extra</span>
                      )}
                    </p>
                    {log.observations && <p className="text-xs text-gray-500 mt-1">📝 {log.observations}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    {isAdmin && <p className="font-bold text-green-400">{formatCurrency(bonus)}</p>}
                    {(isAdmin || log.employee_id === currentEmployee?.id) && (
                      <Button size="sm" variant="danger" onClick={() => handleDelete(log.id)}>🗑️</Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Cargar clase" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {isAdmin && (
              <Select label="Empleado *" value={form.employee_id}
                onChange={e => setForm({ ...form, employee_id: e.target.value })}
                options={employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))} />
            )}
            {!isAdmin && (
              <div className="bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
                <p className="text-sm text-gray-300 font-medium">
                  👤 {currentEmployee?.first_name} {currentEmployee?.last_name}
                </p>
              </div>
            )}
            <Select label="Tipo de clase *" value={form.class_type_id}
              onChange={e => setForm({ ...form, class_type_id: e.target.value })}
              options={classTypes.map(ct => ({ value: ct.id, label: ct.name }))} />
            <Input label="Fecha *" type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Horas de clase *" type="number" step="0.5" value={form.hours}
                onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="1" />
              <Input label="Cantidad de alumnos *" type="number" value={form.students_count}
                onChange={e => setForm({ ...form, students_count: e.target.value })} placeholder="15" />
            </div>

            {isAdmin && form.hours && form.students_count && classTypes.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                <p className="text-sm text-gray-300 font-medium">
                  💰 Bono estimado: {formatCurrency(
                    calcClassBonus(
                      { hours: Number(form.hours), students_count: Number(form.students_count) },
                      classTypes.find(ct => ct.id === form.class_type_id) || classTypes[0]
                    )
                  )}
                  {Number(form.students_count) > 10 && (
                    <span className="ml-2 text-green-400">✓ incluye bono extra</span>
                  )}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-400">Observaciones</label>
              <textarea
                className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 resize-none placeholder-gray-600"
                rows={3} value={form.observations}
                onChange={e => setForm({ ...form, observations: e.target.value })}
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
