import { useState, useEffect } from 'react'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employees'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'

const emptyForm = {
  first_name: '', last_name: '', job_title: '',
  hourly_rate: '', holiday_rate: '', phone: '', email: ''
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchEmployees() }, [])

  async function fetchEmployees() {
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (e) {
      alert('Error al cargar empleados: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(emp) {
    setEditing(emp)
    setForm({
      first_name: emp.first_name,
      last_name: emp.last_name,
      job_title: emp.job_title || '',
      hourly_rate: emp.hourly_rate,
      holiday_rate: emp.holiday_rate,
      phone: emp.phone || '',
      email: emp.email || ''
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.first_name || !form.last_name) return alert('Nombre y apellido son obligatorios')
    if (!form.hourly_rate || !form.holiday_rate) return alert('Los valores de hora son obligatorios')
    setSaving(true)
    try {
      const payload = {
        ...form,
        hourly_rate: Number(form.hourly_rate),
        holiday_rate: Number(form.holiday_rate)
      }
      if (editing) {
        await updateEmployee(editing.id, payload)
      } else {
        await createEmployee(payload)
      }
      await fetchEmployees()
      setShowModal(false)
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(emp) {
    if (!confirm(`¿Eliminar a ${emp.first_name} ${emp.last_name}? Esta acción no se puede deshacer.`)) return
    try {
      await deleteEmployee(emp.id)
      await fetchEmployees()
    } catch (e) {
      alert('Error al eliminar: ' + e.message)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Empleados</h1>
        <Button onClick={openNew}>+ Nuevo empleado</Button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-12">Cargando...</p>
      ) : employees.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400 py-8">No hay empleados todavía. ¡Agregá el primero!</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map(emp => (
            <Card key={emp.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {emp.first_name} {emp.last_name}
                  </h3>
                  <span className="text-sm text-blue-600 font-medium">{emp.job_title || 'Sin cargo'}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(emp)}>✏️</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(emp)}>🗑️</Button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>💰 Hora normal: <span className="font-semibold text-gray-800">${Number(emp.hourly_rate).toLocaleString('es-AR')}</span></p>
                <p>📅 Hora feriado: <span className="font-semibold text-gray-800">${Number(emp.holiday_rate).toLocaleString('es-AR')}</span></p>
                {emp.phone && <p>📱 {emp.phone}</p>}
                {emp.email && <p>✉️ {emp.email}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Editar empleado' : 'Nuevo empleado'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nombre *" value={form.first_name}
                onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Juan" />
              <Input label="Apellido *" value={form.last_name}
                onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Pérez" />
            </div>
            <Input label="Cargo" value={form.job_title}
              onChange={e => setForm({ ...form, job_title: e.target.value })} placeholder="Instructor, Recepcionista..." />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Valor hora normal *" type="number" value={form.hourly_rate}
                onChange={e => setForm({ ...form, hourly_rate: e.target.value })} placeholder="5000" />
              <Input label="Valor hora feriado *" type="number" value={form.holiday_rate}
                onChange={e => setForm({ ...form, holiday_rate: e.target.value })} placeholder="7500" />
            </div>
            <Input label="Teléfono" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="351-1234567" />
            <Input label="Email" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} placeholder="juan@mail.com" />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear empleado'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}