import { useState } from 'react'
import { FiEye, FiEyeOff, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { useCurrency } from '../hooks/useCurrency'
import type { Profile } from '../contexts/AuthContext'

interface Props {
  profile: Profile
}

export function CreditCard({ profile }: Props) {
  const [showBalance, setShowBalance] = useState(false)
  const { format } = useCurrency()

  return (
    <div className={`credit-card ${profile.is_active ? 'active' : 'inactive'}`}>
      <div className="card-bg" />
      <div className="card-content">
        <div className="card-top">
          <span className="card-label">{profile.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
          {profile.is_active
            ? <FiCheckCircle size={20} />
            : <FiXCircle size={20} />
          }
        </div>
        <div className="card-balance">
          <span className="card-balance-label">Balance</span>
          <div className="card-balance-row">
            <span className="card-balance-amount">
              {showBalance ? format(profile.balance) : '****'}
            </span>
            <button className="icon-btn" onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>
        <div className="card-footer">
          <span className="card-name">{profile.first_name} {profile.last_name}</span>
          <span className="card-role">{profile.role}</span>
        </div>
      </div>
    </div>
  )
}
