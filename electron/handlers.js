const { getDb } = require('./database')
const dayjs = require('dayjs')

function register(ipcMain) {
  const db = () => getDb()

  // ========== AUTH ==========
  ipcMain.handle('auth:login', (_, { username, password }) => {
    const staff = db().prepare('SELECT * FROM staff WHERE name=? AND password=? AND active=1').get(username, password)
    if (!staff) return { ok: false, error: 'بيانات غير صحيحة' }
    const { password: _, ...safe } = staff
    safe.permissions = JSON.parse(safe.permissions || '{}')
    return { ok: true, user: safe }
  })

  // ========== PRICES ==========
  ipcMain.handle('prices:getNormal', () => db().prepare('SELECT * FROM prices_normal ORDER BY id DESC LIMIT 1').get())
  ipcMain.handle('prices:saveNormal', (_, data) => {
    const existing = db().prepare('SELECT id FROM prices_normal LIMIT 1').get()
    if (existing) {
      db().prepare('UPDATE prices_normal SET half_hour=?,hour1=?,hour2=?,hour3=?,extra_hour=?,created_at=datetime("now") WHERE id=?')
        .run(data.half_hour, data.hour1, data.hour2, data.hour3, data.extra_hour, existing.id)
    } else {
      db().prepare('INSERT INTO prices_normal (half_hour,hour1,hour2,hour3,extra_hour) VALUES (?,?,?,?,?)')
        .run(data.half_hour, data.hour1, data.hour2, data.hour3, data.extra_hour)
    }
    return { ok: true }
  })

  ipcMain.handle('prices:getSiblings', () => db().prepare('SELECT * FROM prices_siblings WHERE active=1').all())
  ipcMain.handle('prices:saveSibling', (_, data) => {
    db().prepare('INSERT INTO prices_siblings (num_children,hour1,hour2,hour3,extra_hour,extra_fee) VALUES (?,?,?,?,?,?)')
      .run(data.num_children, data.hour1, data.hour2, data.hour3, data.extra_hour, data.extra_fee || 0)
    return { ok: true }
  })
  ipcMain.handle('prices:deleteSibling', (_, id) => {
    db().prepare('UPDATE prices_siblings SET active=0 WHERE id=?').run(id)
    return { ok: true }
  })

  ipcMain.handle('prices:getPackages', () => db().prepare('SELECT * FROM prices_packages WHERE active=1').all())
  ipcMain.handle('prices:savePackage', (_, data) => {
    db().prepare('INSERT INTO prices_packages (name,hours,price,extra_hour_price,extra_fee) VALUES (?,?,?,?,?)')
      .run(data.name, data.hours, data.price, data.extra_hour_price || 0, data.extra_fee || 0)
    return { ok: true }
  })
  ipcMain.handle('prices:deletePackage', (_, id) => {
    db().prepare('UPDATE prices_packages SET active=0 WHERE id=?').run(id)
    return { ok: true }
  })

  ipcMain.handle('prices:getRecharge', () => db().prepare('SELECT * FROM prices_recharge WHERE active=1').all())
  ipcMain.handle('prices:saveRecharge', (_, data) => {
    db().prepare('INSERT INTO prices_recharge (hours,price,extra_hour_price) VALUES (?,?,?)')
      .run(data.hours, data.price, data.extra_hour_price || 0)
    return { ok: true }
  })
  ipcMain.handle('prices:deleteRecharge', (_, id) => {
    db().prepare('UPDATE prices_recharge SET active=0 WHERE id=?').run(id)
    return { ok: true }
  })

  // ========== BOOKINGS ==========
  ipcMain.handle('bookings:getActive', () => {
    return db().prepare(`SELECT * FROM bookings WHERE status='active' ORDER BY check_in DESC`).all()
  })

  ipcMain.handle('bookings:create', (_, data) => {
    const code = 'K' + Date.now().toString().slice(-6)
    const checkIn = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const expectedOut = dayjs().add(data.duration_minutes, 'minute').format('YYYY-MM-DD HH:mm:ss')
    db().prepare(`INSERT INTO bookings 
      (code,child_name,guardian_name,guardian_phone,booking_type,num_children,package_id,recharge_id,price_per_unit,total_price,duration_minutes,check_in,expected_out,staff_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(code, data.child_name, data.guardian_name, data.guardian_phone || '',
           data.booking_type, data.num_children || 1, data.package_id || null,
           data.recharge_id || null, data.price_per_unit || 0, data.total_price || 0,
           data.duration_minutes, checkIn, expectedOut, data.staff_id || 1)
    const booking = db().prepare('SELECT * FROM bookings WHERE code=?').get(code)
    return { ok: true, booking }
  })

  ipcMain.handle('bookings:checkout', (_, { id, extra_orders_total }) => {
    const checkOut = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const booking = db().prepare('SELECT * FROM bookings WHERE id=?').get(id)
    const total = (booking.total_price || 0) + (extra_orders_total || 0)
    db().prepare('UPDATE bookings SET check_out=?,status="done",total_price=? WHERE id=?').run(checkOut, total, id)
    return { ok: true, check_out: checkOut, total }
  })

  ipcMain.handle('bookings:cancel', (_, id) => {
    db().prepare('UPDATE bookings SET status="cancelled" WHERE id=?').run(id)
    return { ok: true }
  })

  // ========== GROUPS ==========
  ipcMain.handle('groups:getAll', () => db().prepare('SELECT * FROM groups ORDER BY created_at DESC').all())
  ipcMain.handle('groups:create', (_, data) => {
    const r = db().prepare('INSERT INTO groups (name,amount,description,staff_id) VALUES (?,?,?,?)')
      .run(data.name, data.amount, data.description || '', data.staff_id || 1)
    return { ok: true, id: r.lastInsertRowid }
  })

  // ========== PRODUCTS & ORDERS ==========
  ipcMain.handle('products:getAll', () => db().prepare('SELECT * FROM products WHERE active=1').all())
  ipcMain.handle('products:save', (_, data) => {
    db().prepare('INSERT INTO products (name,price,category) VALUES (?,?,?)').run(data.name, data.price, data.category || 'general')
    return { ok: true }
  })

  ipcMain.handle('products:update', (_, data) => {
    db().prepare('UPDATE products SET name=?,price=?,category=? WHERE id=?').run(data.name, data.price, data.category || 'general', data.id)
    return { ok: true }
  })

  ipcMain.handle('products:delete', (_, id) => {
    db().prepare('UPDATE products SET active=0 WHERE id=?').run(id)
    return { ok: true }
  })

  ipcMain.handle('orders:create', (_, data) => {
    const r = db().prepare('INSERT INTO orders (booking_id,items,total,staff_id) VALUES (?,?,?,?)')
      .run(data.booking_id || null, JSON.stringify(data.items), data.total, data.staff_id || 1)
    return { ok: true, id: r.lastInsertRowid }
  })

  // ========== EXPENSES ==========
  ipcMain.handle('expenses:getAll', () => db().prepare('SELECT * FROM expenses ORDER BY created_at DESC').all())
  ipcMain.handle('expenses:create', (_, data) => {
    db().prepare('INSERT INTO expenses (name,type,amount,description,staff_id,date) VALUES (?,?,?,?,?,?)')
      .run(data.name, data.type || 'general', data.amount, data.description || '', data.staff_id || 1, data.date || dayjs().format('YYYY-MM-DD'))
    return { ok: true }
  })
  ipcMain.handle('expenses:delete', (_, id) => {
    db().prepare('DELETE FROM expenses WHERE id=?').run(id)
    return { ok: true }
  })

  // ========== STAFF ==========
  ipcMain.handle('staff:getAll', () => {
    return db().prepare('SELECT id,name,phone,permissions,active FROM staff').all()
      .map(s => ({ ...s, permissions: JSON.parse(s.permissions || '{}') }))
  })
  ipcMain.handle('staff:save', (_, data) => {
    if (data.id) {
      db().prepare('UPDATE staff SET name=?,phone=?,password=?,permissions=? WHERE id=?')
        .run(data.name, data.phone || '', data.password, JSON.stringify(data.permissions || {}), data.id)
    } else {
      db().prepare('INSERT INTO staff (name,phone,password,permissions) VALUES (?,?,?,?)')
        .run(data.name, data.phone || '', data.password, JSON.stringify(data.permissions || {}))
    }
    return { ok: true }
  })

  // ========== REPORTS ==========
  ipcMain.handle('reports:get', (_, { type, from, to }) => {
    const f = from + ' 00:00:00', t = to + ' 23:59:59'
    if (type === 'bookings') {
      return db().prepare(`SELECT b.*, s.name as staff_name FROM bookings b LEFT JOIN staff s ON b.staff_id=s.id 
        WHERE b.created_at BETWEEN ? AND ? ORDER BY b.created_at DESC`).all(f, t)
    }
    if (type === 'expenses') {
      return db().prepare(`SELECT * FROM expenses WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC`).all(f, t)
    }
    if (type === 'groups') {
      return db().prepare(`SELECT * FROM groups WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC`).all(f, t)
    }
    if (type === 'orders') {
      return db().prepare(`SELECT * FROM orders WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC`).all(f, t)
    }
    if (type === 'profit') {
      const bookings = db().prepare(`SELECT COALESCE(SUM(total_price),0) as total FROM bookings WHERE status='done' AND created_at BETWEEN ? AND ?`).get(f, t)
      const groups = db().prepare(`SELECT COALESCE(SUM(amount),0) as total FROM groups WHERE created_at BETWEEN ? AND ?`).get(f, t)
      const orders = db().prepare(`SELECT COALESCE(SUM(total),0) as total FROM orders WHERE created_at BETWEEN ? AND ?`).get(f, t)
      const expenses = db().prepare(`SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE created_at BETWEEN ? AND ?`).get(f, t)
      const revenue = bookings.total + groups.total + orders.total
      return { revenue, expenses: expenses.total, profit: revenue - expenses.total, bookings: bookings.total, groups: groups.total, orders: orders.total }
    }
    return []
  })
}

module.exports = { register }
