import { useState, useEffect } from 'react'
import { getClassTypes, createClassType, updateClassType, deleteClassType } from '../api/classTypes'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { formatCurrency } from '../utils/salary'

const emptyForm = {
  name: '',
  base_bonus: '8000',
  bonus_extra: '2000',
  bonus_threshold: '10'
}

export default function Settings() {
  const [classTypes, setClassTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchClassTypes() }, [])

  async function fetchClassTypes() {
    try {
      const data = await getClassTypes()
      setClassTypes(data)
    } catch (e) {
      alert('Error al cargar tipos de clase: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(ct) {
    setEditing(ct)
    setForm({
      name: ct.name,
      base_bonus: ct.base_bonus,
      bonus_extra: ct.bonus_extra,
      bonus_threshold: ct.bonus_threshold
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name) return alert('El nombre es obligatorio')
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        base_bonus: Number(form.base_bonus),
        bonus_extra: Number(form.bonus_extra),
        bonus_threshold: Number(form.bonus_threshold)
      }
      if (editing) {
        await updateClassType(editing.id, payload)
      } else {
        await createClassType(payload)
      }
      await fetchClassTypes()
      setShowModal(false)
    } catch (e) {
      alert('Error al guardar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(ct) {
    if (!confirm(`¿Eliminar "${ct.name}"? Las clases ya registradas no se verán afectadas.`)) return
    try {
      await deleteClassType(ct.id)
      await fetchClassTypes()
    } catch (e) {
      alert('Error al eliminar: ' + e.message)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
          <p className="text-sm text-gray-500 mt-1">Gestioná los tipos de clase y sus valores de bono</p>
        </div>
        <Button onClick={openNew}>+ Nueva clase</Button>
      </div>

      {/* Info de reglas */}
      <Card className="mb-6 bg-blue-50 border-blue-100">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-blue-800 mb-1">Regla de cálculo del bono</p>
            <p className="text-sm text-blue-700">
              Bono = Horas × Valor base. Si hay más alumnos que el umbral, se suma el bono extra por hora.
            </p>
            <p className="text-sm text-blue-600 mt-1 font-medium">
              Ejemplo: 2hs con 12 alumnos = 2 × $8.000 + 2 × $2.000 = $20.000
            </p>
          </div>
        </div>
      </Card>

      {loading ? (
        <p className="text-center text-gray-400 py-8">Cargando...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classTypes.map(ct => (
            <Card key={ct.id}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800">{ct.name}</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(ct)}>✏️</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(ct)}>🗑️</Button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor base por hora</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(ct.base_bonus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bono extra por hora</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(ct.bonus_extra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Umbral de alumnos</span>
                  <span className="font-semibold text-blue-600">+{ct.bonus_threshold} alumnos</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="text-gray-500">Bono máximo/hora</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(ct.base_bonus + ct.bonus_extra)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? `Editar — ${editing.name}` : 'Nueva clase'}
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-4">
            <Input
              label="Nombre de la clase *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Funcional, Zumba..."
            />
            <Input
              label="Valor base por hora *"
              type="number"
              value={form.base_bonus}
              onChange={e => setForm({ ...form, base_bonus: e.target.value })}
              placeholder="8000"
            />
            <Input
              label="Bono extra por hora (si supera el umbral)"
              type="number"
              value={form.bonus_extra}
              onChange={e => setForm({ ...form, bonus_extra: e.target.value })}
              placeholder="2000"
            />
            <Input
              label="Umbral de alumnos para el bono extra"
              type="number"
              value={form.bonus_threshold}
              onChange={e => setForm({ ...form, bonus_threshold: e.target.value })}
              placeholder="10"
            />

            {/* Preview */}
            {form.base_bonus && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
                <p className="font-medium text-gray-700 mb-2">Preview del cálculo (1 hora):</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Con {form.bonus_threshold} alumnos o menos</span>
                  <span className="font-semibold">{formatCurrency(Number(form.base_bonus))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Con más de {form.bonus_threshold} alumnos</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(Number(form.base_bonus) + Number(form.bonus_extra || 0))}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear clase'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
