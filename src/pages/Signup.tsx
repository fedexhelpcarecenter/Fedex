import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ImageUpload } from '../components/ImageUpload'
import { SearchSelect } from '../components/SearchSelect'
import { supabase } from '../lib/supabase'
import { FiEye, FiEyeOff, FiCheck } from 'react-icons/fi'

const dialCodes = [
  '+1', '+7', '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36',
  '+39', '+40', '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49',
  '+51', '+52', '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61',
  '+62', '+63', '+64', '+65', '+66', '+81', '+82', '+84', '+86', '+90',
  '+91', '+92', '+93', '+94', '+95', '+98', '+211', '+212', '+213', '+216',
  '+218', '+220', '+221', '+222', '+223', '+224', '+225', '+226', '+227', '+228',
  '+229', '+230', '+231', '+232', '+233', '+234', '+235', '+236', '+237', '+238',
  '+239', '+240', '+241', '+242', '+243', '+244', '+245', '+246', '+247', '+248',
  '+249', '+250', '+251', '+252', '+253', '+254', '+255', '+256', '+257', '+258',
  '+260', '+261', '+262', '+263', '+264', '+265', '+266', '+267', '+268', '+269',
  '+290', '+291', '+292', '+293', '+294', '+295', '+296', '+297', '+298', '+299',
  '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359',
  '+370', '+371', '+372', '+373', '+374', '+375', '+376', '+377', '+378', '+379',
  '+380', '+381', '+382', '+383', '+385', '+386', '+387', '+389', '+420', '+421',
  '+423', '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508',
  '+509', '+590', '+591', '+592', '+593', '+594', '+595', '+596', '+597', '+598',
  '+599', '+670', '+672', '+673', '+674', '+675', '+676', '+677', '+678', '+679',
  '+680', '+681', '+682', '+683', '+684', '+685', '+686', '+687', '+688', '+689',
  '+690', '+691', '+692', '+850', '+852', '+853', '+855', '+856', '+880', '+886',
  '+960', '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970',
  '+971', '+972', '+973', '+974', '+975', '+976', '+977', '+992', '+993', '+994',
  '+995', '+996', '+998',
]

export function Signup() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    first_name: '', last_name: '', gender: '',
    dialCode: '+1', phoneNumber: '',
    country: '', state: '', city: '',
  })
  const [filteredCodes, setFilteredCodes] = useState(dialCodes)
  const [showDialDropdown, setShowDialDropdown] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [idFront, setIdFront] = useState<File | null>(null)
  const [idBack, setIdBack] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const passwordVal = form.password
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

  function update(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function filterDialCodes(query: string) {
    setForm({ ...form, dialCode: query })
    if (query.startsWith('+')) {
      setFilteredCodes(dialCodes.filter(c => c.includes(query)))
      setShowDialDropdown(true)
    } else {
      setShowDialDropdown(false)
    }
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!passed || !checks.min8) { setError('Password does not meet security requirements'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    let idFrontUrl = ''
    let idBackUrl = ''

    if (idFront) {
      const ext = idFront.name.split('.').pop()
      const path = `${Date.now()}-front.${ext}`
      const { error: uploadErr } = await supabase.storage.from('id-cards').upload(path, idFront, {
        cacheControl: '3600',
        upsert: false
      })
      if (uploadErr) { setError(`Upload failed: ${uploadErr.message}`); setLoading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('id-cards').getPublicUrl(path)
      idFrontUrl = publicUrl
    }

    if (idBack) {
      const ext = idBack.name.split('.').pop()
      const path = `${Date.now()}-back.${ext}`
      const { error: uploadErr } = await supabase.storage.from('id-cards').upload(path, idBack, {
        cacheControl: '3600',
        upsert: false
      })
      if (uploadErr) { setError(`Upload failed: ${uploadErr.message}`); setLoading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('id-cards').getPublicUrl(path)
      idBackUrl = publicUrl
    }

    const location = [form.city, form.state, form.country].filter(Boolean).join(', ')
    const phone = `${form.dialCode}${form.phoneNumber}`

    const { error: err } = await signup(form.email, form.password, {
      first_name: form.first_name,
      last_name: form.last_name,
      phone,
      gender: form.gender,
      location,
      id_card_front: idFrontUrl,
      id_card_back: idBackUrl,
      preferred_currency: 'USD',
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Step {step} of 2</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleStep1}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" value={form.first_name} onChange={e => update('first_name', e.target.value)} required placeholder="John" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" value={form.last_name} onChange={e => update('last_name', e.target.value)} required placeholder="Smith" />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required placeholder="john@company.com" />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="phone-input-group">
                <div className="dial-code-wrapper">
                  <input
                    type="text"
                    value={form.dialCode}
                    onChange={e => filterDialCodes(e.target.value)}
                    onFocus={() => { setFilteredCodes(dialCodes); setShowDialDropdown(true) }}
                    onBlur={() => setTimeout(() => setShowDialDropdown(false), 200)}
                    className="dial-code-input"
                    placeholder="+1"
                  />
                  {showDialDropdown && (
                    <div className="dial-code-dropdown">
                      {filteredCodes.map(code => (
                        <button
                          key={code}
                          type="button"
                          className={`dial-code-option ${code === form.dialCode ? 'selected' : ''}`}
                          onMouseDown={() => { setForm({ ...form, dialCode: code }); setShowDialDropdown(false) }}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input type="tel" value={form.phoneNumber} onChange={e => update('phoneNumber', e.target.value)} required placeholder="5550123456" />
              </div>
            </div>

            <div className="form-group">
              <SearchSelect
                label="Gender"
                value={form.gender}
                onChange={v => update('gender', v)}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                placeholder="Select gender"
                searchable={false}
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input type="text" value={form.country} onChange={e => update('country', e.target.value)} required placeholder="e.g. United States" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State/Region</label>
                <input type="text" value={form.state} onChange={e => update('state', e.target.value)} required placeholder="e.g. California" />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" value={form.city} onChange={e => update('city', e.target.value)} required placeholder="e.g. Los Angeles" />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                  placeholder="Create a strong password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {form.password && (
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
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  required
                  placeholder="Re-enter password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {form.confirmPassword && (
                <span className={`check ${form.password === form.confirmPassword && form.confirmPassword ? 'pass' : ''}`} style={{ marginTop: 4, display: 'inline-block' }}>
                  <FiCheck size={12} /> Passwords match
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-block">Next: Upload ID</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <ImageUpload
              label="ID Card (Front)"
              onFile={setIdFront}
              crop={false}
            />
            <ImageUpload
              label="ID Card (Back)"
              onFile={setIdBack}
              crop={false}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
