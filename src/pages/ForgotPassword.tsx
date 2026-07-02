import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>{sent ? 'Check your email' : 'Enter your email to receive a reset link'}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <FiCheckCircle size={48} color="#00A86B" style={{ marginBottom: '16px' }} />
            <p style={{ marginBottom: '12px', color: 'var(--color-text-secondary)' }}>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              Didn't receive it? Check your spam folder or{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#4D148C', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font)', fontSize: '0.85rem' }}
                onClick={() => { setSent(false); setLoading(false) }}
              >
                try again
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-with-icon">
                <FiMail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="john@company.com"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: '16px' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4D148C', textDecoration: 'none' }}>
            <FiArrowLeft size={14} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
