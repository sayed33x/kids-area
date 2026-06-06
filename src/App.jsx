import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './screens/Login'
import Layout from './components/Layout'
import Bookings from './screens/Bookings'
import Groups from './screens/Groups'
import Orders from './screens/Orders'
import Expenses from './screens/Expenses'
import Staff from './screens/Staff'
import Prices from './screens/Prices'
import Reports from './screens/Reports'

export default function App() {
  const [user, setUser] = useState(null)

  if (!user) return <Login onLogin={setUser} />

  return (
    <Layout user={user} onLogout={() => setUser(null)}>
      <Routes>
        <Route path="/" element={<Navigate to="/bookings" />} />
        <Route path="/bookings" element={<Bookings user={user} />} />
        <Route path="/groups" element={<Groups user={user} />} />
        <Route path="/orders" element={<Orders user={user} />} />
        <Route path="/expenses" element={<Expenses user={user} />} />
        <Route path="/staff" element={<Staff user={user} />} />
        <Route path="/prices" element={<Prices user={user} />} />
        <Route path="/reports" element={<Reports user={user} />} />
      </Routes>
    </Layout>
  )
}
