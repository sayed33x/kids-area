import React, { useState, useEffect } from 'react'
const api = ch => (...a) => window.api.invoke(ch, ...a)

export default function Orders({ user }) {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { api('products:getAll')().then(setProducts) }, [])

  const filtered = products.filter(p => p.name.includes(search))
  const addItem = (p) => {
    setCart(c => {
      const ex = c.find(i => i.id === p.id)
      if (ex) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...c, { ...p, qty: 1 }]
    })
  }
  const removeItem = (id) => setCart(c => c.filter(i => i.id !== id))
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const saveOrder = async () => {
    if (!cart.length) return
    await api('orders:create')({ items: cart, total, staff_id: user.id })
    setCart([]); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div dir="rtl" className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">🛒 الطلبات الخارجية</h1>
      {saved && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">✅ تم حفظ الطلب</div>}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card">
          <input className="input mb-3" placeholder="🔍 بحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addItem(p)}
                className="border border-gray-200 rounded-lg p-3 text-right hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <div className="font-medium text-gray-800">{p.name}</div>
                <div className="text-blue-600 font-bold">{p.price} ج</div>
              </button>
            ))}
          </div>
        </div>
        <div className="card space-y-2">
          <h2 className="font-semibold border-b pb-2">الطلب الحالي</h2>
          {cart.length === 0 && <p className="text-gray-400 text-sm text-center py-4">لا توجد طلبات</p>}
          {cart.map(i => (
            <div key={i.id} className="flex justify-between items-center text-sm">
              <button onClick={() => removeItem(i.id)} className="text-red-400 hover:text-red-600">✕</button>
              <span className="flex-1 mx-2">{i.name} × {i.qty}</span>
              <span className="font-medium">{i.price * i.qty} ج</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>الإجمالي</span><span className="text-blue-600">{total} ج</span>
          </div>
          <button onClick={saveOrder} className="btn btn-primary w-full">💾 حفظ وطباعة</button>
        </div>
      </div>
    </div>
  )
}
