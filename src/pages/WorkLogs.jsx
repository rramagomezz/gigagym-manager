import { useState, useEffect } from 'react'
import { getEmployees } from '../api/employees'
import {
  getWorkLogs, startWorkSession, endWorkSession,
  getActiveSession, getActiveSessions, adminEditSession, deleteWorkLog
} from '../api/workLogs'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency, formatDuration, roundMinutesToHours, getLogHours } from '../utils/salary'

const now = new Date()

const months = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
]

function LiveTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const update = () => setElapsed(Date.now() - start)
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startedAt])
  const h = Math.floor(elapsed / 3600000)
  const m = Math.floor((elapsed % 3600000) / 60000)
  const s = Math.floor((elapsed % 60000) / 1000)
  return (
    <span className="font-mono text-4xl font-bold text-green-400">
      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  )
}

function EmployeeWorkLogs({ currentEmployee }) {
  const [activeSession, setActiveSession] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [observations, setObservations] = useState('')
  const [ending, setEnding] = useState(false)
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(now.getFullYear())

  useEffect(() => {
    if (currentEmployee?.id) fetchAll()
  }, [currentEmployee, filterMonth, filterYear])

  async function fetchAll() {
    setLoading(true)
    try {
      const [active, logsData] = await Promise.all([
        getActiveSession(currentEmployee.id),
        getWorkLogs(currentEmployee.id, filterMonth, filterYear)
      ])
      setActiveSession(active)
      setLogs(logsData)
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStart() {
    setStarting(true)
    try {
      const session = await startWorkSession(currentEmployee.id)
      setActiveSession(session)
    } catch (e) {
      alert('Error al iniciar: ' + e.message)
    } finally {
      setStarting(false)
    }
  }

  async function handleEnd() {
    setEnding(true)
    try {
      await endWorkSession(activeSession.id, observations)
      setActiveSession(null)
      setObservations('')
      setShowEndModal(false)
      await fetchAll()
    } catch (e) {
      alert('Error al finalizar: ' + e.message)
    } finally {
      setEnding(false)
    }
  }

  const totalMinutes = logs.reduce((acc, l) => acc + Number(l.duration_minutes || 0), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Mis horas</h1>

      {activeSession ? (
        <Card className="mb-6 border-2 border-green-800 bg-green-950">
          <div className="text-center py-2">
            <p className="text-green-400 font-semibold mb-3">🟢 Jornada en curso</p>
            <LiveTimer startedAt={activeSession.started_at} />
            <p className="text-sm text-gray-400 mt-2">
              Inicio: {new Date(activeSession.started_at).toLocaleString('es-AR')}
            </p>
            <div className="mt-4">
              <Button variant="danger" onClick={() => setShowEndModal(true)}>
                ⏹ Finalizar jornada
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mb-6">
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No hay jornada activa</p>
            <button
              onClick={handleStart}
              disabled={starting}
              className="bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors disabled:opacity-50 shadow-lg"
            >
              {starting ? 'Iniciando...' : '▶ Comenzar jornada laboral'}
            </button>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Mes" value={filterMonth}
            onChange={e => setFilterMonth(Number(e.target.value))}
            options={months.map(m => ({ value: m.value, label: m.label }))} />
          <Input label="Año" type="number" value={filterYear}
            onChange={e => setFilterYear(Number(e.target.value))} />
        </div>
      </Card>

      <Card className="mb-6">
        <p className="text-sm text-gray-500 mb-1">Total trabajado este mes</p>
        <p className="text-2xl font-bold text-red-500">{formatDuration(totalMinutes)}</p>
      </Card>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : logs.length === 0 ? (
        <Card><p className="text-center text-gray-500 py-8">No hay jornadas registradas este mes.</p></Card>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <Card key={log.id} className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-white">
                    {new Date(log.started_at).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(log.started_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    {' → '}
                    {log.ended_at ? new Date(log.ended_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </p>
                  {log.notes && <p className="text-xs text-gray-500 mt-1">📝 {log.notes}</p>}
                  {log.edited_by_admin && (
                    <span className="text-xs bg-yellow-900 text-yellow-400 px-2 py-0.5 rounded-full mt-1 inline-block">
                      ✏️ Editado por un Admin
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{formatDuration(log.duration_minutes || 0)}</p>
                  {log.is_holiday && (
                    <span className="text-xs bg-orange-900 text-orange-400 px-2 py-0.5 rounded-full">Feriado</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showEndModal && (
        <Modal title="Finalizar jornada" onClose={() => setShowEndModal(false)}>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">¿Querés agregar alguna observación antes de finalizar?</p>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-400">Observaciones</label>
              <textarea
                className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 resize-none placeholder-gray-600"
                rows={3} value={observations}
                onChange={e => setObservations(e.target.value)}
                placeholder="Opcional..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowEndModal(false)}>Cancelar</Button>
              <Button variant="danger" onClick={handleEnd} disabled={ending}>
                {ending ? 'Finalizando...' : 'Finalizar jornada'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AdminWorkLogs({ employees }) {
  const [logs, setLogs] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1)
  const [filterYear, setFilterYear] = useState(now.getFullYear())
  const [editingLog, setEditingLog] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAll() }, [filterEmployee, filterMonth, filterYear])

  useEffect(() => {
    fetchActiveSessions()
    const interval = setInterval(fetchActiveSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const data = await getWorkLogs(filterEmployee || null, filterMonth, filterYear)
      setLogs(data)
    } catch (e) {
      alert('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchActiveSessions() {
    try {
      const data = await getActiveSessions()
      setActiveSessions(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function handlePause(session) {
    if (!confirm(`¿Finalizar la jornada de ${session.employees?.first_name}?`)) return
    try {
      const durationMinutes = Math.round((Date.now() - new Date(session.started_at)) / 60000)
      await adminEditSession(session.id, {
        ended_at: new Date().toISOString(),
        is_active: false,
        duration_minutes: durationMinutes
      })
      await fetchActiveSessions()
      await fetchAll()
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

function openEdit(log) {
    setEditingLog(log)
    setEditForm({
      duration_minutes: log.duration_minutes || 0,
      notes: log.notes || '',
      is_holiday: log.is_holiday || false,
      extra_half_hour: log.extra_half_hour || false
    })
  } 

  async function handleSaveEdit() {
    setSaving(true)
    try {
        await adminEditSession(editingLog.id, {
        duration_minutes: Number(editForm.duration_minutes),
        notes: editForm.notes || null,
        is_holiday: editForm.is_holiday,
        extra_half_hour: editForm.extra_half_hour
      })
      await fetchAll()
      setEditingLog(null)
    } catch (e) {
      alert('Error: ' + e.message)
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
      alert('Error: ' + e.message)
    }
  }

  function getEmployee(id) {
    return employees.find(e => e.id === id)
  }

function calcPay(log) {
  const emp = getEmployee(log.employee_id)
  if (!emp) return 0
  const hours = getLogHours(log)
  return hours * (log.is_holiday ? emp.holiday_rate : emp.hourly_rate)
}

  const totalMinutes = logs.reduce((acc, l) => acc + Number(l.duration_minutes || 0), 0)
  const totalPay = logs.reduce((acc, l) => acc + calcPay(l), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Horas trabajadas</h1>

      {activeSessions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">🟢 Jornadas en curso</h2>
          <div className="space-y-3">
            {activeSessions.map(session => (
              <Card key={session.id} className="border-2 border-green-800 bg-green-950">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white">
                      {session.employees?.first_name} {session.employees?.last_name}
                    </p>
                    <p className="text-sm text-gray-400">
                      Inicio: {new Date(session.started_at).toLocaleString('es-AR')}
                    </p>
                    <LiveTimer startedAt={session.started_at} />
                  </div>
                  <Button variant="danger" size="sm" onClick={() => handlePause(session)}>
                    ⏹ Finalizar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Select label="Empleado" value={filterEmployee}
            onChange={e => setFilterEmployee(e.target.value)}
            options={[{ value: '', label: 'Todos' }, ...employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }))]} />
          <Select label="Mes" value={filterMonth}
            onChange={e => setFilterMonth(Number(e.target.value))}
            options={months.map(m => ({ value: m.value, label: m.label }))} />
          <Input label="Año" type="number" value={filterYear}
            onChange={e => setFilterYear(Number(e.target.value))} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500 mb-1">Total horas</p>
          <p className="text-2xl font-bold text-red-500">{formatDuration(totalMinutes)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 mb-1">Total a pagar</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalPay)}</p>
        </Card>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Cargando...</p>
      ) : logs.length === 0 ? (
        <Card><p className="text-center text-gray-500 py-8">No hay registros para este período.</p></Card>
      ) : (
        <div className="space-y-3">
          {logs.map(log => {
            const emp = getEmployee(log.employee_id)
            return (
              <Card key={log.id} className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">
                      {emp ? `${emp.first_name} ${emp.last_name}` : 'Eliminado'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(log.started_at).toLocaleDateString('es-AR')}
                      {' · '}
                      {new Date(log.started_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      {' → '}
                      {log.ended_at ? new Date(log.ended_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                    {log.notes && <p className="text-xs text-gray-500 mt-1">📝 {log.notes}</p>}
                    {log.edited_by_admin && (
                      <span className="text-xs bg-yellow-900 text-yellow-400 px-2 py-0.5 rounded-full mt-1 inline-block">✏️ Editado por Admin</span>
                    )}
                    {log.is_holiday && (
                      <span className="ml-1 bg-orange-900 text-orange-400 text-xs px-2 py-0.5 rounded-full">Feriado</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                     <p className="font-bold text-green-400">{getLogHours(log)}h</p>
                      <p className="text-xs text-green-600">{formatCurrency(calcPay(log))}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(log)}>✏️</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(log.id)}>🗑️</Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {editingLog && (
        <Modal title="Editar jornada" onClose={() => setEditingLog(null)}>
          <div className="space-y-4">
            <Input label="Duración (minutos)" type="number"
              value={editForm.duration_minutes}
              onChange={e => setEditForm({ ...editForm, duration_minutes: e.target.value })} />
            <Select label="Tipo de día"
              value={editForm.is_holiday ? 'true' : 'false'}
              onChange={e => setEditForm({ ...editForm, is_holiday: e.target.value === 'true' })}
              options={[{ value: 'false', label: 'Día normal' }, { value: 'true', label: 'Feriado' }]} />
           <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
  <div>
    <p className="text-sm font-medium text-gray-300">Sumar media hora extra</p>
    <p className="text-xs text-gray-500">Para jornadas de X,5 horas</p>
  </div>
  <button
    onClick={() => setEditForm({ ...editForm, extra_half_hour: !editForm.extra_half_hour })}
    className={`w-12 h-6 rounded-full transition-colors ${editForm.extra_half_hour ? 'bg-red-700' : 'bg-gray-600'}`}
  >
    <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${editForm.extra_half_hour ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
</div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-400">Observaciones</label>
              <textarea
                className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700 resize-none placeholder-gray-600"
                rows={3} value={editForm.notes}
                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
            <p className="text-xs text-yellow-500 bg-yellow-950 rounded-xl p-3">
              ⚠️ Esta edición quedará marcada como "Editado por un Admin".
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditingLog(null)}>Cancelar</Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default function WorkLogs() {
  const { isAdmin, employee: currentEmployee } = useAuth()
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    getEmployees().then(setEmployees).catch(console.error)
  }, [])

  if (isAdmin) return <AdminWorkLogs employees={employees} />
  if (currentEmployee) return <EmployeeWorkLogs currentEmployee={currentEmployee} />
  return <p className="text-center text-gray-500 py-8">Cargando...</p>
}
