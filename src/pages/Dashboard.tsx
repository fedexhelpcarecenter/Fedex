import { useAuth } from '../contexts/AuthContext'
import { CreditCard } from '../components/CreditCard'
import { Sidebar } from '../components/Sidebar'
import { Link } from 'react-router-dom'
import { FiSend, FiDownload, FiPackage, FiClock } from 'react-icons/fi'

export function Dashboard() {
  const { profile } = useAuth()

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

  const initials = `${profile.first_name} ${profile.last_name}`
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const quickActions = [
    { to: '/transfer', icon: FiSend, label: 'Transfer', color: '#4D148C' },
    { to: '/deposit', icon: FiDownload, label: 'Deposit', color: '#FF6600' },
    { to: '/track', icon: FiPackage, label: 'Track Parcel', color: '#00A86B' },
    { to: '/history', icon: FiClock, label: 'History', color: '#2563EB' },
  ]

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-avatar-ring">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="dashboard-avatar-img" />
            ) : (
              <span className="dashboard-avatar-initials">{initials}</span>
            )}
          </div>
          <div>
            <h1>Welcome, {profile.first_name}</h1>
            <p>{profile.email}</p>
          </div>
        </div>

        <CreditCard profile={profile} />

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            {quickActions.map(action => (
              <Link to={action.to} key={action.to} className="action-card" style={{ '--accent': action.color } as React.CSSProperties}>
                <action.icon size={28} />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
