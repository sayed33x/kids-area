import React, { useState, useEffect } from 'react'
const api = ch => (...a) => window.api.invoke(ch, ...a)

export default function Expenses({ user }) {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ name: '', type: 'general', amount: '', description: '' })
  const load = () => api('expenses:getAll')().then(setExpenses)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name || !form.amount) return alert('ادخل الاسم والمبلغ')
    await api('expenses:create')({ ...form, staff_id: user.id })
    load(); setForm({ name: '', type: 'general', amount: '', description: '' })
  }

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)

  return (
    <div dir="rtl" className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">💸 المصروفات</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-700 border-b pb-2">إضافة مصروف</h2>
          <div><label className="text-sm text-gray-600">اسم المصروف *</label>
            <input className="input mt-1" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="text-sm text-gray-600">النوع</label>
            <select className="input mt-1" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="general">عام</option>
              <option value="rent">إيجار</option>
              <option value="electric">كهرباء</option>
              <option value="supply">مستلزمات</option>
              <option value="salary">رواتب</option>
            </select>
          </div>
          <div><label className="text-sm text-gray-600">المبلغ *</label>
            <input type="number" className="input mt-1" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
          <div><label className="text-sm text-gray-600">ملاحظات</label>
            <textarea className="input mt-1 h-16 resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <button onClick={save} className="btn btn-success w-full">✅ حفظ</button>
        </div>
        <div className="col-span-2 space-y-2">
          <div className="card bg-red-50 border-red-100">
            <div className="flex justify-between">
              <span className="text-gray-600">إجمالي المصروفات</span>
              <span className="font-bold text-red-600 text-xl">{total} ج</span>
            </div>
          </div>
          <div className="card">
            <table className="w-full text-sm">
              <thead><tr>{['الاسم','النوع','المبلغ','التاريخ',''].map(h => <th key={h} className="table-th">{h}</th>)}</tr></thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="table-td font-medium">{e.name}</td>
                    <td className="table-td text-gray-500">{e.type}</td>
                    <td className="table-td text-red-600">{e.amount} ج</td>
                    <td className="table-td text-gray-400">{e.date}</td>
                    <td className="table-td">
                      <button onClick={() => api('expenses:delete')(e.id).then(load)} className="text-red-400 hover:text-red-600 text-xs">حذف</button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={5} className="table-td text-center text-gray-400 py-8">لا توجد مصروفات</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
