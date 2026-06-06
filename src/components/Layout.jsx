import React from 'react'
import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/bookings', label: 'الحجوزات', icon: '🎮' },
  { to: '/groups', label: 'الجروبات', icon: '👥' },
  { to: '/orders', label: 'طلبات خارجية', icon: '🛒' },
  { to: '/expenses', label: 'المصروفات', icon: '💸' },
  { to: '/staff', label: 'الموظفين', icon: '👤' },
  { to: '/prices', label: 'الأسعار', icon: '💰' },
  { to: '/reports', label: 'التقارير', icon: '📊' },
]

export default function Layout({ children, user, onLogout }) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" dir="rtl">
      <aside className="w-52 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <div className="text-lg font-bold text-yellow-400">🎪 Kids Area</div>
          <div className="text-xs text-gray-400 mt-1">مرحباً {user.name}</div>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {nav.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}>
              <span>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={onLogout} className="w-full text-sm text-gray-400 hover:text-white py-2 text-right">
            🚪 تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4">{children}</main>
    </div>
  )
}
