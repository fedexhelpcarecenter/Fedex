import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useCurrency } from '../../hooks/useCurrency'
import { Link } from 'react-router-dom'
import { FiCheckCircle, FiXCircle, FiMessageSquare, FiToggleLeft, FiToggleRight, FiSearch } from 'react-icons/fi'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  gender: string | null
  location: string | null
  balance: number
  is_active: boolean
  role: string
  id_verified: boolean
  created_at: string
}

export function AdminUsers() {
  const { format } = useCurrency()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [messageModal, setMessageModal] = useState<{ user: UserProfile | null; all: boolean }>({ user: null, all: false })
  const [messageSubject, setMessageSubject] = useState('')
  const [messageText, setMessageText] = useState('')

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers((data || []) as UserProfile[])
    setLoading(false)
  }

  async function toggleActive(userId: string, current: boolean) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', userId)
    loadUsers()
  }

  async function verifyUser(userId: string) {
    await supabase.from('profiles').update({ id_verified: true }).eq('id', userId)
    loadUsers()
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const { user: target, all } = messageModal
    if (all) {
      for (const u of users) {
        await supabase.from('admin_messages').insert({
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          recipient_id: u.id,
          subject: messageSubject,
          message: messageText,
          is_general: true,
        })
        await supabase.from('notifications').insert({
          user_id: u.id,
          title: messageSubject,
          message: messageText,
          type: 'info',
        })
      }
    } else if (target) {
      await supabase.from('admin_messages').insert({
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        recipient_id: target.id,
        subject: messageSubject,
        message: messageText,
      })
      await supabase.from('notifications').insert({
        user_id: target.id,
        title: messageSubject,
        message: messageText,
      })
    }
    setMessageModal({ user: null, all: false })
    setMessageSubject('')
    setMessageText('')
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return u.first_name.toLowerCase().includes(q) ||
           u.last_name.toLowerCase().includes(q) ||
           u.email.toLowerCase().includes(q) ||
           (u.phone || '').includes(q)
  })

  if (loading) return <div className="admin-page"><div className="loading-screen"><div className="spinner" /></div></div>

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Manage Users</h1>
        <div className="admin-nav">
          <Link to="/admin" className="admin-nav-link">Overview</Link>
          <Link to="/admin/users" className="admin-nav-link active">Users</Link>
          <Link to="/admin/transactions" className="admin-nav-link">Transactions</Link>
          <Link to="/admin/tracking" className="admin-nav-link">Tracking</Link>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-input-wrapper">
          <FiSearch size={16} />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => setMessageModal({ user: null, all: true })}>
          <FiMessageSquare size={16} /> Message All
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td><strong>{u.first_name} {u.last_name}</strong></td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td>{format(u.balance)}</td>
                <td>
                  <span className={`badge ${u.is_active ? 'success' : 'danger'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {u.id_verified ? <FiCheckCircle color="#00A86B" /> : <FiXCircle color="#DC2626" />}
                </td>
                <td>
                  <div className="admin-actions">
                    <button className="icon-btn" onClick={() => toggleActive(u.id, u.is_active)} title="Toggle active">
                      {u.is_active ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                    </button>
                    {!u.id_verified && (
                      <button className="icon-btn" onClick={() => verifyUser(u.id)} title="Verify ID">
                        <FiCheckCircle size={18} color="#00A86B" />
                      </button>
                    )}
                    <button className="icon-btn" onClick={() => setMessageModal({ user: u, all: false })} title="Send message">
                      <FiMessageSquare size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {messageModal.user || messageModal.all ? (
        <div className="modal-overlay" onClick={() => setMessageModal({ user: null, all: false })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{messageModal.all ? 'Message All Users' : `Message ${messageModal.user?.first_name}`}</h3>
            <form onSubmit={sendMessage}>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" value={messageSubject} onChange={e => setMessageSubject(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={4} required />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setMessageModal({ user: null, all: false })} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Send</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
