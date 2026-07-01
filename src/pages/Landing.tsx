import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPackage, FiShield, FiGlobe, FiClock, FiTruck, FiSearch } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

export function Landing() {
  const { user } = useAuth()
  const [trackInput, setTrackInput] = useState('')
  const navigate = useNavigate()

  function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (trackInput.trim()) navigate(`/track/${trackInput.trim().toUpperCase()}`)
  }

  return (
    <div className="landing">
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            Ship, Track &amp; Manage<br />
            <span className="hero-highlight">Company Funds</span>
          </h1>
          <p className="hero-subtitle">
            Internal logistics and money management platform for your organization.
            Track parcels, transfer funds, and stay connected.
          </p>
          <form onSubmit={handleTrack} className="tracking-input-group">
            <div className="tracking-input-wrapper">
              <FiSearch className="tracking-icon" />
              <input type="text" value={trackInput} onChange={e => setTrackInput(e.target.value)} placeholder="Enter tracking number" className="tracking-input" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Track</button>
          </form>
          {!user && (
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
            </div>
          )}
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Everything you need</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FiTruck className="feature-icon" />
            <h3>Parcel Tracking</h3>
            <p>Real-time tracking with milestone updates and world map integration</p>
          </div>
          <div className="feature-card">
            <FiClock className="feature-icon" />
            <h3>Fund Transfers</h3>
            <p>Send and receive money between staff with admin approval</p>
          </div>
          <div className="feature-card">
            <FiShield className="feature-icon" />
            <h3>Secure Dashboard</h3>
            <p>Personal dashboard with balance management and transaction history</p>
          </div>
          <div className="feature-card">
            <FiPackage className="feature-icon" />
            <h3>Parcel Fees</h3>
            <p>Admin-defined delivery fees with detailed notes</p>
          </div>
          <div className="feature-card">
            <FiGlobe className="feature-icon" />
            <h3>Admin Panel</h3>
            <p>Complete control over users, transactions, and tracking codes</p>
          </div>
          <div className="feature-card">
            <FiClock className="feature-icon" />
            <h3>ID Verification</h3>
            <p>Secure ID card upload and verification system</p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat">
          <span className="stat-number">500+</span>
          <span className="stat-label">Active Users</span>
        </div>
        <div className="stat">
          <span className="stat-number">10K+</span>
          <span className="stat-label">Parcels Tracked</span>
        </div>
        <div className="stat">
          <span className="stat-number">$2M+</span>
          <span className="stat-label">Funds Managed</span>
        </div>
        <div className="stat">
          <span className="stat-number">99.9%</span>
          <span className="stat-label">Uptime</span>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to streamline your operations?</h2>
        <p>Join thousands of organizations already using ShipTrack</p>
        {!user && (
          <Link to="/signup" className="btn btn-primary btn-lg">Create Account</Link>
        )}
      </section>
    </div>
  )
}
