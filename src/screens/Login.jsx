import React, { useState } from 'react'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await window.api.invoke('auth:login', form)
      if (res.ok) onLogin(res.user)
      else setError(res.error)
    } catch { setError('حدث خطأ، تأكد من تشغيل النظام') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎪</div>
          <h1 className="text-2xl font-bold text-gray-800">Kids Area</h1>
          <p className="text-gray-500 text-sm mt-1">نظام إدارة منطقة الألعاب</p>
        </div>

        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
            <input className="input" placeholder="أدخل اسم المستخدم"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة السر</label>
            <input type="password" className="input" placeholder="أدخل كلمة السر"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className="btn btn-primary w-full py-3 text-base disabled:opacity-60">
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">V1.0 — Admins Egypt © 2025</p>
      </div>
    </div>
  )
}
