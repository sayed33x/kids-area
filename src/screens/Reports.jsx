import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
const api = ch => (...a) => window.api.invoke(ch, ...a)

const today = () => new Date().toISOString().slice(0, 10)

const TYPES = [
  { value: 'bookings', label: 'الحجوزات' },
  { value: 'groups', label: 'الجروبات' },
  { value: 'orders', label: 'الطلبات' },
  { value: 'expenses', label: 'المصروفات' },
  { value: 'profit', label: 'صافي الأرباح' },
]

export default function Reports() {
  const [type, setType] = useState('bookings')
  const [from, setFrom] = useState(today())
  const [to, setTo] = useState(today())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await api('reports:get')({ type, from, to })
    setData(res)
    setLoading(false)
  }

  const isProfit = type === 'profit' && data && !Array.isArray(data)

  const cols = {
    bookings: ['child_name','guardian_name','booking_type','duration_minutes','total_price','check_in','status'],
    groups: ['name','amount','description','created_at'],
    orders: ['total','created_at'],
    expenses: ['name','type','amount','date'],
  }

  const labels = {
    child_name: 'الطفل', guardian_name: 'ولي الأمر', booking_type: 'النوع',
    duration_minutes: 'المدة (د)', total_price: 'المبلغ', check_in: 'الدخول',
    status: 'الحالة', name: 'الاسم', amount: 'المبلغ', description: 'الوصف',
    created_at: 'التاريخ', total: 'الإجمالي', type: 'النوع', date: 'التاريخ'
  }

  const profitData = isProfit ? [
    { name: 'حجوزات', value: data.bookings },
    { name: 'جروبات', value: data.groups },
    { name: 'طلبات', value: data.orders },
    { name: 'مصروفات', value: -data.expenses },
    { name: 'صافي', value: data.profit },
  ] : []

  return (
    <div dir="rtl" className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">📊 التقارير</h1>
      <div className="card">
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="text-sm text-gray-600 block mb-1">نوع التقرير</label>
            <select className="input w-40" value={type} onChange={e => setType(e.target.value)}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">من</label>
            <input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">إلى</label>
            <input type="date" className="input" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <button onClick={load} disabled={loading} className="btn btn-primary">
            {loading ? 'جاري...' : '🔍 عرض'}
          </button>
        </div>
      </div>

      {isProfit && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold mb-3">ملخص مالي</h3>
            <div className="space-y-2">
              {[['الحجوزات', data.bookings, 'text-blue-600'],
                ['الجروبات', data.groups, 'text-purple-600'],
                ['الطلبات', data.orders, 'text-orange-600'],
                ['المصروفات', data.expenses, 'text-red-600'],
                ['صافي الأرباح', data.profit, 'text-green-600 text-xl font-bold']
              ].map(([label, val, cls]) => (
                <div key={label} className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className={cls}>{val} ج</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3">الرسم البياني</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {Array.isArray(data) && (
        <div className="card overflow-x-auto">
          <div className="flex justify-between mb-3">
            <span className="font-medium text-gray-700">النتائج ({data.length})</span>
            {data.length > 0 && <span className="text-sm text-gray-500">
              الإجمالي: {data.reduce((s, r) => s + (r.total_price || r.amount || r.total || 0), 0)} ج
            </span>}
          </div>
          <table className="w-full text-sm">
            <thead><tr>
              {(cols[type] || []).map(c => <th key={c} className="table-th">{labels[c] || c}</th>)}
            </tr></thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {(cols[type] || []).map(c => (
                    <td key={c} className="table-td">
                      {String(row[c] ?? '').slice(0, 30)}
                    </td>
                  ))}
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={10} className="table-td text-center text-gray-400 py-8">لا توجد نتائج</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
