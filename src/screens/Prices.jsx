import React, { useState, useEffect } from 'react'
const api = ch => (...a) => window.api.invoke(ch, ...a)

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
    {label}
  </button>
)

const CATEGORIES = [
  { value: 'drinks', label: 'مشروبات باردة' },
  { value: 'hot', label: 'مشروبات ساخنة' },
  { value: 'food', label: 'أكل' },
  { value: 'snacks', label: 'سناكس' },
  { value: 'general', label: 'عام' },
]

export default function Prices() {
  const [tab, setTab] = useState('normal')
  const [normal, setNormal] = useState({ half_hour: 0, hour1: 0, hour2: 0, hour3: 0, extra_hour: 0 })
  const [siblings, setSiblings] = useState([])
  const [sibForm, setSibForm] = useState({ num_children: 2, hour1: 0, hour2: 0, hour3: 0, extra_hour: 0, extra_fee: 0 })
  const [packages, setPackages] = useState([])
  const [pkgForm, setPkgForm] = useState({ name: '', hours: 1, price: 0, extra_hour_price: 0, extra_fee: 0 })
  const [recharge, setRecharge] = useState([])
  const [rechForm, setRechForm] = useState({ hours: 10, price: 0, extra_hour_price: 0 })
  const [products, setProducts] = useState([])
  const [prodForm, setProdForm] = useState({ name: '', price: 0, category: 'general' })
  const [editingProd, setEditingProd] = useState(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    const [n, s, p, r, pr] = await Promise.all([
      api('prices:getNormal')(), api('prices:getSiblings')(),
      api('prices:getPackages')(), api('prices:getRecharge')(),
      api('products:getAll')()
    ])
    if (n) setNormal(n)
    setSiblings(s || []); setPackages(p || []); setRecharge(r || []); setProducts(pr || [])
  }
  useEffect(() => { load() }, [])

  const flash = m => { setMsg(m); setTimeout(() => setMsg(''), 2000) }

  const saveProd = async () => {
    if (!prodForm.name || !prodForm.price) return alert('ادخل الاسم والسعر')
    if (editingProd) {
      await api('products:update')({ ...prodForm, id: editingProd.id })
      setEditingProd(null)
    } else {
      await api('products:save')(prodForm)
    }
    setProdForm({ name: '', price: 0, category: 'general' })
    load(); flash('✅ تم الحفظ')
  }

  const editProd = (p) => {
    setEditingProd(p)
    setProdForm({ name: p.name, price: p.price, category: p.category || 'general' })
  }

  return (
    <div dir="rtl" className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">💰 الأسعار</h1>
      {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">{msg}</div>}

      <div className="card">
        <div className="flex gap-1 border-b mb-4 flex-wrap">
          {[['normal','السعر العادي'],['siblings','الأخوات'],['packages','الباقات'],['recharge','كروت الشحن'],['products','الطلبات الخارجية']].map(([v,l]) => (
            <Tab key={v} label={l} active={tab===v} onClick={() => setTab(v)} />
          ))}
        </div>

        {tab === 'normal' && (
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {[['half_hour','نصف ساعة'],['hour1','الساعة الأولى'],['hour2','الساعة الثانية'],['hour3','الساعة الثالثة'],['extra_hour','كل ساعة إضافية (بعد 3)']].map(([k,l]) => (
              <div key={k}>
                <label className="text-sm text-gray-600">{l}</label>
                <input type="number" className="input mt-1" value={normal[k]}
                  onChange={e => setNormal(p => ({ ...p, [k]: +e.target.value }))} />
              </div>
            ))}
            <div className="col-span-2">
              <button onClick={async () => { await api('prices:saveNormal')(normal); flash('✅ تم الحفظ') }}
                className="btn btn-primary">حفظ</button>
            </div>
          </div>
        )}

        {tab === 'siblings' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 max-w-xl">
              {[['num_children','عدد الأطفال'],['hour1','الساعة الأولى'],['hour2','الساعة الثانية'],['hour3','الساعة الثالثة'],['extra_hour','كل ساعة إضافية'],['extra_fee','مزايا إضافية']].map(([k,l]) => (
                <div key={k}>
                  <label className="text-sm text-gray-600">{l}</label>
                  <input type="number" className="input mt-1" value={sibForm[k]}
                    onChange={e => setSibForm(p => ({ ...p, [k]: +e.target.value }))} />
                </div>
              ))}
              <div className="col-span-3">
                <button onClick={async () => { await api('prices:saveSibling')(sibForm); load(); flash('✅ تمت الإضافة') }}
                  className="btn btn-success">إضافة</button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead><tr>
                {['عدد الأطفال','س1','س2','س3','إضافية',''].map(h => <th key={h} className="table-th">{h}</th>)}
              </tr></thead>
              <tbody>
                {siblings.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="table-td">{s.num_children}</td>
                    <td className="table-td">{s.hour1}</td>
                    <td className="table-td">{s.hour2}</td>
                    <td className="table-td">{s.hour3}</td>
                    <td className="table-td">{s.extra_hour}</td>
                    <td className="table-td">
                      <button onClick={() => api('prices:deleteSibling')(s.id).then(load)} className="text-red-500 hover:text-red-700 text-xs">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'packages' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 max-w-xl">
              {[['name','اسم الباقة'],['hours','عدد الساعات'],['price','سعر الباقة'],['extra_hour_price','سعر الساعة الزائدة'],['extra_fee','مزايا إضافية']].map(([k,l]) => (
                <div key={k}>
                  <label className="text-sm text-gray-600">{l}</label>
                  <input type={k==='name'?'text':'number'} className="input mt-1" value={pkgForm[k]}
                    onChange={e => setPkgForm(p => ({ ...p, [k]: k==='name'?e.target.value:+e.target.value }))} />
                </div>
              ))}
              <div className="col-span-3">
                <button onClick={async () => { await api('prices:savePackage')(pkgForm); load(); flash('✅ تمت الإضافة') }}
                  className="btn btn-success">إضافة</button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead><tr>
                {['اسم الباقة','ساعات','السعر','زائدة',''].map(h => <th key={h} className="table-th">{h}</th>)}
              </tr></thead>
              <tbody>
                {packages.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-td font-medium">{p.name}</td>
                    <td className="table-td">{p.hours}</td>
                    <td className="table-td">{p.price} ج</td>
                    <td className="table-td">{p.extra_hour_price} ج</td>
                    <td className="table-td">
                      <button onClick={() => api('prices:deletePackage')(p.id).then(load)} className="text-red-500 text-xs">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'recharge' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 max-w-xl">
              {[['hours','عدد الساعات'],['price','السعر الإجمالي'],['extra_hour_price','سعر الساعة الزائدة']].map(([k,l]) => (
                <div key={k}>
                  <label className="text-sm text-gray-600">{l}</label>
                  <input type="number" className="input mt-1" value={rechForm[k]}
                    onChange={e => setRechForm(p => ({ ...p, [k]: +e.target.value }))} />
                </div>
              ))}
              <div className="col-span-3">
                <button onClick={async () => { await api('prices:saveRecharge')(rechForm); load(); flash('✅ تمت الإضافة') }}
                  className="btn btn-success">إضافة</button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead><tr>
                {['ساعات','السعر','سعر الزائدة',''].map(h => <th key={h} className="table-th">{h}</th>)}
              </tr></thead>
              <tbody>
                {recharge.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="table-td">{r.hours} ساعة</td>
                    <td className="table-td">{r.price} ج</td>
                    <td className="table-td">{r.extra_hour_price} ج</td>
                    <td className="table-td">
                      <button onClick={() => api('prices:deleteRecharge')(r.id).then(load)} className="text-red-500 text-xs">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 max-w-xl">
              <div>
                <label className="text-sm text-gray-600">اسم الصنف *</label>
                <input className="input mt-1" value={prodForm.name}
                  onChange={e => setProdForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-gray-600">السعر *</label>
                <input type="number" className="input mt-1" value={prodForm.price}
                  onChange={e => setProdForm(p => ({ ...p, price: +e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-gray-600">الفئة</label>
                <select className="input mt-1" value={prodForm.category}
                  onChange={e => setProdForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="col-span-3 flex gap-2">
                <button onClick={saveProd} className={`btn ${editingProd ? 'btn-primary' : 'btn-success'}`}>
                  {editingProd ? '💾 حفظ التعديل' : '➕ إضافة صنف'}
                </button>
                {editingProd && (
                  <button onClick={() => { setEditingProd(null); setProdForm({ name: '', price: 0, category: 'general' }) }}
                    className="btn btn-secondary">إلغاء</button>
                )}
              </div>
            </div>

            <table className="w-full text-sm">
              <thead><tr>
                {['اسم الصنف','السعر','الفئة',''].map(h => <th key={h} className="table-th">{h}</th>)}
              </tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-td font-medium">{p.name}</td>
                    <td className="table-td text-blue-600 font-semibold">{p.price} ج</td>
                    <td className="table-td">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {CATEGORIES.find(c => c.value === p.category)?.label || p.category}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex gap-3">
                        <button onClick={() => editProd(p)} className="text-blue-500 hover:text-blue-700 text-xs">تعديل</button>
                        <button onClick={() => api('products:delete')(p.id).then(load)} className="text-red-500 hover:text-red-700 text-xs">حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={4} className="table-td text-center text-gray-400 py-8">لا توجد أصناف — أضف أول صنف</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
