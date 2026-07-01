import { useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { ImageUpload } from '../components/ImageUpload'
import { useCurrency } from '../hooks/useCurrency'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function Deposit() {
  const { user } = useAuth()
  const { format, info } = useCurrency()
  const [amount, setAmount] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError('Invalid amount'); return }
    if (!proofFile) { setError('Please upload payment proof'); return }
    setLoading(true)

    const ext = proofFile.name.split('.').pop()
    const path = `proofs/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('proofs').upload(path, proofFile)
    if (uploadErr) { setError('Failed to upload proof'); setLoading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(path)

    const { error: err } = await supabase.from('transactions').insert({
      sender_id: user?.id,
      amount: amt,
      type: 'deposit',
      status: 'pending',
      reference: `DEP-${Date.now()}`,
      proof_url: publicUrl,
      description: `Deposit of ${format(amt)}`
    })

    if (err) { setError(err.message); setLoading(false); return }

    await supabase.from('notifications').insert({
      user_id: user?.id,
      title: 'Deposit Submitted',
      message: `Your deposit of ${format(amt)} has been submitted and is pending approval.`,
      type: 'info',
    })

    setLoading(false)
    setSuccess('Deposit pending approval. Admin will verify your payment.')
    setAmount('')
    setProofFile(null)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <h1>Deposit Funds</h1>
        <div className="deposit-info">
          <h3>How to Deposit</h3>
          <p>Transfer the desired amount to the company account and upload the payment receipt below. Admin will verify and approve your deposit.</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount ({info.code})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" step="0.01" required placeholder="0.00" />
          </div>
          <ImageUpload
            label="Payment Proof (Screenshot/Receipt)"
            onFile={setProofFile}
            crop={false}
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 16 }}>
            {loading ? 'Submitting...' : 'Submit Deposit'}
          </button>
        </form>
      </main>
    </div>
  )
}
