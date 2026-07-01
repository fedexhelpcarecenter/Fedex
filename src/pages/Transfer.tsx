import { useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { useCurrency } from '../hooks/useCurrency'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { FiSearch } from 'react-icons/fi'

export function Transfer() {
  const { user, profile } = useAuth()
  const { format, info } = useCurrency()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<{ id: string; first_name: string; last_name: string; email: string }[]>([])
  const [selectedUser, setSelectedUser] = useState<{ id: string; first_name: string; last_name: string } | null>(null)

  async function searchUser(query: string) {
    setRecipient(query)
    if (query.length < 2) { setSearchResults([]); return }
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .neq('id', user?.id)
      .limit(5)
    setSearchResults(data || [])
  }

  function selectUser(u: { id: string; first_name: string; last_name: string }) {
    setSelectedUser(u)
    setRecipient(`${u.first_name} ${u.last_name}`)
    setSearchResults([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!selectedUser) { setError('Please select a recipient'); return }
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError('Invalid amount'); return }
    if (amt > (profile?.balance || 0)) { setError('Insufficient balance'); return }
    setLoading(true)

    const { error: err } = await supabase.from('transactions').insert({
      sender_id: user?.id,
      receiver_id: selectedUser.id,
      amount: amt,
      type: 'transfer',
      status: 'pending',
      description,
      reference: `TRF-${Date.now()}`,
    })

    if (!err) {
      await supabase.from('notifications').insert({
        user_id: user?.id,
        title: 'Transfer Submitted',
        message: `Your transfer of ${format(amt)} to ${selectedUser.first_name} ${selectedUser.last_name} has been submitted and is pending approval.`,
        type: 'info',
      })
    }

    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess('Transfer submitted! Awaiting admin approval.')
    setAmount('')
    setDescription('')
    setSelectedUser(null)
    setRecipient('')
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <h1>Transfer Funds</h1>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit} className="transfer-form">
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Recipient</label>
            <div className="search-input-wrapper">
              <FiSearch size={16} />
              <input
                type="text"
                value={recipient}
                onChange={e => searchUser(e.target.value)}
                placeholder="Search by name or email"
                required
              />
            </div>
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(u => (
                  <button key={u.id} type="button" className="search-result-item" onClick={() => selectUser(u)}>
                    <strong>{u.first_name} {u.last_name}</strong>
                    <small>{u.email}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Amount ({info.code})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" step="0.01" required placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What's this for?" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Processing...' : 'Send Transfer'}
          </button>
        </form>
      </main>
    </div>
  )
}
