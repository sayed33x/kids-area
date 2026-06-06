import React, { useState, useEffect } from 'react'
const api = ch => (...a) => window.api.invoke(ch, ...a)

const PERMS = ['bookings','groups','orders','expenses','staff','prices','reports','settings']

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', password: '', permissions: {} })
  const [editing, setEditing] = useState(null)
  const load = () => api('staff:getAll')().then(setStaff)
  useEffect(() => { load() }, [])

  const togglePerm = p => setForm(f => ({
    ...f, permissions: { ...f.permissions, [p]: !f.permissions[p] }
  }))

  const save = async () => {
    if (!form.name || !form.password) return alert('ادخل الاسم وكلمة المرور')
    await api('staff:save')({ ...form, id: editing?.id })
    load(); setEditing(null); setForm({ name: '', phone: '', password: '', permissions: {} })
  }

  const edit = s => {
    setEditing(s)
    setForm({ name: s.name, phone: s.phone || '', password: '', permissions: s.permissions || {} })
  }

  return (
    <div dir="rtl" className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">👤 الموظفين</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="card space-y-3">
          <h2 className="font-semibold border-b pb-2">{editing ? 'تعديل موظف' : 'إضافة موظف'}</h2>
          <div><label className="text-sm text-gray-600">الاسم *</label>
            <input className="input mt-1" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="text-sm text-gray-600">رقم الموبايل</label>
            <input className="input mt-1" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          <div><label className="text-sm text-gray-600">كلمة المرور *</label>
            <input type="password" className="input mt-1" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} /></div>
          <div>
            <label className="text-sm text-gray-600 block mb-2">الصلاحيات</label>
            <div className="grid grid-cols-2 gap-1">
              {PERMS.map(p => (
                <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!form.permissions[p]} onChange={() => togglePerm(p)}
                    className="rounded" />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn btn-success flex-1">✅ حفظ</button>
            {editing && <button onClick={() => { setEditing(null); setForm({ name: '', phone: '', password: '', permissions: {} }) }} className="btn btn-secondary">إلغاء</button>}
          </div>
        </div>
        <div className="col-span-2 card">
          <table className="w-full text-sm">
            <thead><tr>{['الاسم','الموبايل','الصلاحيات',''].map(h => <th key={h} className="table-th">{h}</th>)}</tr></thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{s.name}</td>
                  <td className="table-td text-gray-500">{s.phone}</td>
                  <td className="table-td">
                    <div className="flex flex-wrap gap-1">
                      {s.permissions?.all
                        ? <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">كل الصلاحيات</span>
                        : Object.entries(s.permissions || {}).filter(([,v]) => v).map(([k]) => (
                            <span key={k} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{k}</span>
                          ))}
                    </div>
                  </td>
                  <td className="table-td">
                    <button onClick={() => edit(s)} className="text-blue-500 hover:text-blue-700 text-xs">تعديل</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
