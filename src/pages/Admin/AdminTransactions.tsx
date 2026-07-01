import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useCurrency } from '../../hooks/useCurrency'
import { Link } from 'react-router-dom'
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi'

interface Transaction {
  id: string
  sender_id: string
  receiver_id: string
  amount: number
  type: string
  status: string
  description: string | null
  reference: string
  created_at: string
  proof_url: string | null
  sender: { first_name: string; last_name: string; email: string }
  receiver: { first_name: string; last_name: string; email: string }
}

export function AdminTransactions() {
  const { format } = useCurrency()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadTransactions() }, [filter])

  async function loadTransactions() {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        sender:profiles!transactions_sender_id_fkey(first_name, last_name, email),
        receiver:profiles!transactions_receiver_id_fkey(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })

    if (filter !== 'all') query = query.eq('status', filter)

    const { data } = await query
    setTransactions((data || []) as unknown as Transaction[])
    setLoading(false)
  }

  async function updateStatus(txId: string, status: string) {
    const tx = transactions.find(t => t.id === txId)
    if (!tx) return

    if (status === 'approved') {
      if (tx.type === 'deposit') {
        const { data: sender } = await supabase.from('profiles').select('balance').eq('id', tx.sender_id).single()
        await supabase.from('profiles').update({ balance: (sender?.balance || 0) + tx.amount }).eq('id', tx.sender_id)
      } else if (tx.type === 'transfer') {
        const { data: sender } = await supabase.from('profiles').select('balance').eq('id', tx.sender_id).single()
        const { data: receiver } = await supabase.from('profiles').select('balance').eq('id', tx.receiver_id).single()
        await supabase.from('profiles').update({ balance: (sender?.balance || 0) - tx.amount }).eq('id', tx.sender_id)
        await supabase.from('profiles').update({ balance: (receiver?.balance || 0) + tx.amount }).eq('id', tx.receiver_id)
      }
    }

    await supabase.from('transactions').update({ status, updated_at: new Date().toISOString() }).eq('id', txId)

    const notificationUserId = tx.sender_id
    await supabase.from('notifications').insert({
      user_id: notificationUserId,
      title: `Transaction ${status}`,
      message: `Your ${tx.type} of ${format(tx.amount)} has been ${status}.`,
      type: status === 'approved' ? 'success' : 'error',
    })

    if (status === 'approved' && tx.type === 'transfer' && tx.receiver_id) {
      await supabase.from('notifications').insert({
        user_id: tx.receiver_id,
        title: 'Payment Received',
        message: `You received ${format(tx.amount)} from ${tx.sender?.first_name} ${tx.sender?.last_name}.`,
        type: 'success',
      })
    }

    loadTransactions()
  }

  if (loading) return <div className="admin-page"><div className="loading-screen"><div className="spinner" /></div></div>

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Transactions</h1>
        <div className="admin-nav">
          <Link to="/admin" className="admin-nav-link">Overview</Link>
          <Link to="/admin/users" className="admin-nav-link">Users</Link>
          <Link to="/admin/transactions" className="admin-nav-link active">Transactions</Link>
          <Link to="/admin/tracking" className="admin-nav-link">Tracking</Link>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="filter-group">
          {['all', 'pending', 'processing', 'approved', 'rejected'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td><small>{tx.reference}</small></td>
                <td><span className="badge info">{tx.type}</span></td>
                <td>{tx.sender?.first_name} {tx.sender?.last_name}</td>
                <td>{tx.receiver?.first_name} {tx.receiver?.last_name}</td>
                <td><strong>{format(tx.amount)}</strong></td>
                <td><span className={`badge ${tx.status}`}>{tx.status}</span></td>
                <td><small>{new Date(tx.created_at).toLocaleDateString()}</small></td>
                <td>
                  <div className="admin-actions">
                    {tx.status === 'pending' && (
                      <>
                        <button className="icon-btn" onClick={() => updateStatus(tx.id, 'approved')} title="Approve">
                          <FiCheckCircle size={18} color="#00A86B" />
                        </button>
                        <button className="icon-btn" onClick={() => updateStatus(tx.id, 'rejected')} title="Reject">
                          <FiXCircle size={18} color="#DC2626" />
                        </button>
                      </>
                    )}
                    {tx.proof_url && (
                      <a href={tx.proof_url} target="_blank" rel="noreferrer" className="icon-btn" title="View proof">
                        <FiEye size={18} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
