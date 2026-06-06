import React, { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'

const api = ch => (...args) => window.api.invoke(ch, ...args)

const TYPES = [
  { value: 'normal', label: 'عادي' },
  { value: 'siblings', label: 'أخوات' },
  { value: 'package', label: 'باقة' },
  { value: 'recharge', label: 'كارت شحن' },
]

export default function Bookings({ user }) {
  const [active, setActive] = useState([])
  const [prices, setPrices] = useState(null)
  const [packages, setPackages] = useState([])
  const [siblings, setSiblings] = useState([])
  const [form, setForm] = useState({ child_name: '', guardian_name: '', guardian_phone: '', booking_type: 'normal', num_children: 1, duration_minutes: 60, package_id: '', recharge_id: '' })
  const [checkoutId, setCheckoutId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [now, setNow] = useState(dayjs())

  const load = useCallback(async () => {
    const [a, p, pkg, sib] = await Promise.all([
      api('bookings:getActive')(),
      api('prices:getNormal')(),
      api('prices:getPackages')(),
      api('prices:getSiblings')(),
    ])
    setActive(a || [])
    setPrices(p)
    setPackages(pkg || [])
    setSiblings(sib || [])
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 10000)
    return () => clearInterval(t)
  }, [])

  const calcPrice = () => {
    if (!prices) return 0
    const mins = form.duration_minutes
    if (form.booking_type === 'normal') {
      if (mins <= 30) return prices.half_hour
      if (mins <= 60) return prices.hour1
      if (mins <= 120) return prices.hour1 + prices.hour2
      if (mins <= 180) return prices.hour1 + prices.hour2 + prices.hour3
      const extra = Math.ceil((mins - 180) / 60)
      return prices.hour1 + prices.hour2 + prices.hour3 + extra * prices.extra_hour
    }
    if (form.booking_type === 'siblings') {
      const sib = siblings.find(s => s.num_children === Number(form.num_children)) || siblings[0]
      if (!sib) return 0
      const hours = Math.ceil(mins / 60)
      if (hours <= 1) return sib.hour1 * form.num_children
      if (hours <= 2) return (sib.hour1 + sib.hour2) * form.num_children
      if (hours <= 3) return (sib.hour1 + sib.hour2 + sib.hour3) * form.num_children
      return (sib.hour1 + sib.hour2 + sib.hour3 + (hours - 3) * sib.extra_hour) * form.num_children
    }
    if (form.booking_type === 'package') {
      const pkg = packages.find(p => p.id === Number(form.package_id))
      return pkg ? pkg.price : 0
    }
    return 0
  }

  const totalPrice = calcPrice()

  const handleSave = async () => {
    if (!form.child_name || !form.guardian_name) return alert('ادخل اسم الطفل وولي الأمر')
    setSaving(true)
    const res = await api('bookings:create')({
      ...form, total_price: totalPrice,
      price_per_unit: prices?.hour1 || 0,
      staff_id: user.id
    })
    if (res.ok) { load(); setForm({ child_name: '', guardian_name: '', guardian_phone: '', booking_type: 'normal', num_children: 1, duration_minutes: 60, package_id: '', recharge_id: '' }) }
    setSaving(false)
  }

  const handleCheckout = async (booking) => {
    const res = await api('bookings:checkout')({ id: booking.id, extra_orders_total: 0 })
    if (res.ok) { load(); setCheckoutId(null) }
  }

  const getStatus = (b) => {
    const out = dayjs(b.expected_out)
    const diff = out.diff(now, 'minute')
    if (diff <= 0) return 'danger'
    if (diff <= 5) return 'warning'
    return 'ok'
  }

  const f = v => (v || 0)

  return (
    <div dir="rtl" className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">🎮 الحجوزات</h1>

      <div className="grid grid-cols-3 gap-4">
        {/* Form */}
        <div className="card col-span-1 space-y-3">
          <h2 className="font-semibold text-gray-700 border-b pb-2">حجز جديد</h2>

          <div>
            <label className="text-sm text-gray-600">اسم الطفل *</label>
            <input className="input mt-1" value={form.child_name}
              onChange={e => setForm(p => ({ ...p, child_name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-gray-600">اسم ولي الأمر *</label>
            <input className="input mt-1" value={form.guardian_name}
              onChange={e => setForm(p => ({ ...p, guardian_name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm text-gray-600">رقم الموبايل</label>
            <input className="input mt-1" value={form.guardian_phone}
              onChange={e => setForm(p => ({ ...p, guardian_phone: e.target.value }))} />
          </div>

          <div>
            <label className="text-sm text-gray-600">نوع الحجز</label>
            <select className="input mt-1" value={form.booking_type}
              onChange={e => setForm(p => ({ ...p, booking_type: e.target.value }))}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {form.booking_type === 'siblings' && (
            <div>
              <label className="text-sm text-gray-600">عدد الأطفال</label>
              <input type="number" className="input mt-1" min={2} value={form.num_children}
                onChange={e => setForm(p => ({ ...p, num_children: Number(e.target.value) }))} />
            </div>
          )}

          {form.booking_type === 'package' && (
            <div>
              <label className="text-sm text-gray-600">الباقة</label>
              <select className="input mt-1" value={form.package_id}
                onChange={e => setForm(p => ({ ...p, package_id: e.target.value }))}>
                <option value="">اختر باقة</option>
                {packages.map(p => <option key={p.id} value={p.id}>{p.name} — {p.hours}س — {p.price}ج</option>)}
              </select>
            </div>
          )}

          {(form.booking_type === 'normal' || form.booking_type === 'siblings') && (
            <div>
              <label className="text-sm text-gray-600">المدة (دقيقة)</label>
              <div className="flex gap-2 mt-1">
                {[30,60,90,120,180].map(m => (
                  <button key={m} onClick={() => setForm(p => ({ ...p, duration_minutes: m }))}
                    className={`px-2 py-1 rounded text-xs border ${form.duration_minutes === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                    {m < 60 ? `${m}د` : `${m/60}س`}
                  </button>
                ))}
              </div>
              <input type="number" className="input mt-2" min={15} step={15} value={form.duration_minutes}
                onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))} />
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">الإجمالي:</span>
              <span className="font-bold text-blue-700 text-lg">{totalPrice} ج</span>
            </div>
            {prices && form.booking_type === 'normal' && (
              <div className="text-xs text-gray-500 mt-1">
                ½س={f(prices.half_hour)} | 1س={f(prices.hour1)} | 2س={f(prices.hour2)} | 3س={f(prices.hour3)}
              </div>
            )}
          </div>

          <button onClick={handleSave} disabled={saving}
            className="btn btn-success w-full disabled:opacity-60">
            {saving ? 'جاري الحفظ...' : '✅ حفظ الحجز'}
          </button>
        </div>

        {/* Active bookings */}
        <div className="col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">الأطفال داخل المنطقة ({active.length})</h2>
            <button onClick={load} className="text-sm text-blue-600 hover:underline">🔄 تحديث</button>
          </div>

          {active.length === 0 && (
            <div className="card text-center text-gray-400 py-12">لا يوجد أطفال حالياً</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {active.map(b => {
              const status = getStatus(b)
              const out = dayjs(b.expected_out)
              const diff = out.diff(now, 'minute')
              return (
                <div key={b.id} className={`card border-r-4 ${
                  status === 'danger' ? 'border-r-red-500 bg-red-50' :
                  status === 'warning' ? 'border-r-yellow-400 bg-yellow-50' :
                  'border-r-green-400'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-800">{b.child_name}</div>
                      <div className="text-xs text-gray-500">{b.guardian_name} • {b.guardian_phone}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      b.booking_type === 'normal' ? 'bg-blue-100 text-blue-700' :
                      b.booking_type === 'siblings' ? 'bg-purple-100 text-purple-700' :
                      b.booking_type === 'package' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {TYPES.find(t => t.value === b.booking_type)?.label}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                    <div>دخول: {dayjs(b.check_in).format('HH:mm')}</div>
                    <div>خروج: {out.format('HH:mm')}</div>
                    <div className={`font-medium ${status === 'danger' ? 'text-red-600' : status === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {status === 'danger' ? `⏰ تجاوز ${Math.abs(diff)} دقيقة` :
                       status === 'warning' ? `⚡ باقي ${diff} دقيقة` :
                       `✅ باقي ${diff} دقيقة`}
                    </div>
                    <div className="font-semibold text-gray-800">{b.total_price} ج</div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => handleCheckout(b)}
                      className="btn btn-primary text-xs py-1 flex-1">
                      💳 خروج ودفع
                    </button>
                    <button onClick={() => api('bookings:cancel')(b.id).then(load)}
                      className="btn btn-danger text-xs py-1">
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
