import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { formatCurrency } from '../lib/currency'
import { useCurrency } from '../hooks/useCurrency'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { FiCopy, FiCheck } from 'react-icons/fi'

interface CompanyAccount {
  id: string
  image_url: string | null
  account_name: string
  account_number: string
  bank_name: string
}

export function Deposit() {
  const { user, profile } = useAuth()
  const { format, info } = useCurrency()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<CompanyAccount[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadAccounts()
  }, [])

  async function loadAccounts() {
    const { data } = await supabase.from('company_accounts').select('*').eq('is_active', true).order('sort_order')
    setAccounts(data || [])
  }

  if (!profile) return null

  if (!profile.is_active) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="inactive-banner">
            <h2>Account Inactive</h2>
            <p>Your account is currently inactive. Please contact customer support for assistance.</p>
          </div>
        </main>
      </div>
    )
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError('Invalid amount'); return }
    setLoading(true)

    const { error: err } = await supabase.from('transactions').insert({
      sender_id: user?.id,
      amount: amt,
      type: 'deposit',
      status: 'pending',
      reference: `DEP-${Date.now()}`,
      description: `Deposit of ${format(amt)}`
    })

    if (err) { setError(err.message); setLoading(false); return }

    await supabase.from('notifications').insert({
      user_id: user?.id,
      title: 'Deposit Submitted',
      message: `Your deposit of ${formatCurrency(amt, profile?.preferred_currency as any)} has been submitted and is pending approval.`,
      type: 'info',
    })

    setLoading(false)
    setSuccess('Deposit submitted! Pending approval.')
    setAmount('')
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <h1>Deposit Funds</h1>

        {accounts.length > 0 && (
          <div className="company-accounts-grid">
            {accounts.map(acc => (
              <div key={acc.id} className="company-account-card deposit-card">
                {acc.image_url && (
                  <div className="company-account-image deposit-image">
                    <img src={acc.image_url} alt={acc.bank_name} />
                  </div>
                )}
                <div className="company-account-details">
                  <h4>{acc.bank_name}</h4>
                  <p className="company-account-desc">{acc.account_name}</p>
                  <div className="company-account-number-row">
                    <span className="company-account-number crypto-address">{acc.account_number}</span>
                    <button
                      className="icon-btn"
                      onClick={() => copyToClipboard(acc.account_number, acc.id)}
                      title="Copy address"
                    >
                      {copiedId === acc.id ? <FiCheck color="#00A86B" /> : <FiCopy />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {accounts.length === 0 && (
          <div className="alert alert-info">No company accounts configured yet. Please contact support.</div>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="deposit-form">
          <div className="form-group">
            <label>Amount ({info.code})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" step="0.01" required placeholder="0.00" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? 'Submitting...' : 'Submit Deposit'}
          </button>
        </form>
      </main>
    </div>
  )
}
