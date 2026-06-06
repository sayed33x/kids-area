import React, { useState, useEffect } from 'react'
const api = ch => (...a) => window.api.invoke(ch, ...a)

export default function Groups({ user }) {
  const [groups, setGroups] = useState([])
  const [form, setForm] = useState({ name: '', amount: '', description: '' })
  const load = () => api('groups:getAll')().then(setGroups)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name) return alert('ادخل اسم المجموعة')
    await api('groups:create')({ ...form, staff_id: user.id })
    load()
    setForm({ name: '', amount: '', description: '' })
  }

  return (
    <div dir="rtl" className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">👥 الجروبات</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-700 border-b pb-2">إضافة جروب</h2>
          <div><label className="text-sm text-gray-600">الاسم *</label>
            <input className="input mt-1" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="text-sm text-gray-600">المبلغ</label>
            <input type="number" className="input mt-1" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
          <div><label className="text-sm text-gray-600">وصف / ملاحظات</label>
            <textarea className="input mt-1 h-20 resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <button onClick={save} className="btn btn-success w-full">✅ حفظ</button>
        </div>
        <div className="col-span-2 card">
          <table className="w-full text-sm">
            <thead><tr>{['الاسم','المبلغ','الوصف','التاريخ'].map(h => <th key={h} className="table-th">{h}</th>)}</tr></thead>
            <tbody>
              {groups.map(g => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{g.name}</td>
                  <td className="table-td">{g.amount} ج</td>
                  <td className="table-td text-gray-500">{g.description}</td>
                  <td className="table-td text-gray-400">{g.created_at?.slice(0,16)}</td>
                </tr>
              ))}
              {groups.length === 0 && <tr><td colSpan={4} className="table-td text-center text-gray-400 py-8">لا توجد جروبات</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
