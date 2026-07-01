import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiSend, FiDownload, FiClock, FiPackage, FiBell, FiSettings, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

const links = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/transfer', icon: FiSend, label: 'Transfer' },
  { to: '/deposit', icon: FiDownload, label: 'Deposit' },
  { to: '/history', icon: FiClock, label: 'History' },
  { to: '/track', icon: FiPackage, label: 'Parcel Tracker' },
  { to: '/notifications', icon: FiBell, label: 'Notifications' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
  { to: '/settings', icon: FiSettings, label: 'Settings' },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const { profile, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const initials = profile
    ? `${profile.first_name} ${profile.last_name}`
        .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '→' : '←'}
      </button>

      <div className="sidebar-profile">
        <div className="sidebar-avatar-ring">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="sidebar-avatar-img" />
          ) : (
            <span className="sidebar-avatar-initials">{initials}</span>
          )}
        </div>
        {!collapsed && (
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-name">{profile?.first_name} {profile?.last_name}</span>
            <span className="sidebar-profile-role">{profile?.role}</span>
          </div>
        )}
      </div>

      <div className="sidebar-links">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`sidebar-link ${pathname === link.to ? 'active' : ''}`}
          >
            <link.icon size={20} />
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </div>
      <button className="sidebar-link logout" onClick={() => logout()}>
        <FiLogOut size={20} />
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  )
}
