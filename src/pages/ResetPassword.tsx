import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { FiEye, FiEyeOff, FiCheck, FiLock } from 'react-icons/fi'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true)
    })
  }, [])

  const passwordVal = password
  const checks = {
    min8: passwordVal.length >= 8,
    upper: /[A-Z]/.test(passwordVal),
    lower: /[a-z]/.test(passwordVal),
    number: /[0-9]/.test(passwordVal),
    symbol: /[^A-Za-z0-9]/.test(passwordVal),
  }
  const passed = Object.values(checks).filter(Boolean).length
  const strength = passwordVal.length === 0 ? 0 : passed <= 2 ? 1 : passed <= 3 ? 2 : passed === 4 ? 3 : 4
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', '#DC2626', '#F59E0B', '#3B82F6', '#00A86B']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!passed || !checks.min8) { setError('Password does not meet security requirements'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) { setError(err.message); return }
    setSuccess(true)
    setTimeout(() => navigate('/login'), 3000)
  }

  if (!validSession) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Invalid Reset Link</h2>
            <p>This password reset link is invalid or has expired. Please request a new one.</p>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/forgot-password')}>
            Request New Reset Link
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <FiCheckCircleIcon />
            <h2>Password Updated</h2>
            <p>Your password has been successfully reset. Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Set New Password</h2>
          <p>Enter your new password below</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Create a strong password"
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {password && (
              <>
                <div className="password-strength-bar">
                  <div className="password-strength-fill" style={{ width: `${(strength / 4) * 100}%`, background: strengthColor[strength] }} />
                </div>
                <span className="password-strength-label" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
              </>
            )}
            <div className="password-checks">
              <span className={`check ${checks.min8 ? 'pass' : ''}`}><FiCheck size={12} /> 8+ characters</span>
              <span className={`check ${checks.upper ? 'pass' : ''}`}><FiCheck size={12} /> Uppercase</span>
              <span className={`check ${checks.lower ? 'pass' : ''}`}><FiCheck size={12} /> Lowercase</span>
              <span className={`check ${checks.number ? 'pass' : ''}`}><FiCheck size={12} /> Number</span>
              <span className={`check ${checks.symbol ? 'pass' : ''}`}><FiCheck size={12} /> Symbol</span>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {confirmPassword && (
              <span className={`check ${password === confirmPassword && confirmPassword ? 'pass' : ''}`} style={{ marginTop: 4, display: 'inline-block' }}>
                <FiCheck size={12} /> Passwords match
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

function FiCheckCircleIcon() {
  return <FiCheck size={48} color="#00A86B" style={{ marginBottom: '16px' }} />
}
