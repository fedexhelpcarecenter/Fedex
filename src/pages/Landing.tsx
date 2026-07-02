import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiBox, FiDollarSign, FiChevronRight, FiTruck, FiPackage, FiClock, FiShield, FiDownload } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { usePwaInstall } from '../hooks/usePwaInstall'

export function Landing() {
  const { user } = useAuth()
  const { canInstall, install } = usePwaInstall()
  const [trackInput, setTrackInput] = useState('')
  const navigate = useNavigate()
  const [activeCube, setActiveCube] = useState<'track' | 'rate' | 'ship'>('track')

  function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    if (trackInput.trim()) navigate(`/track/${trackInput.trim().toUpperCase()}`)
  }

  return (
    <div className="fedex-landing">
      <section className="fxg-hero fxg-hero_homepage">
        <div className="fxg-hero__image" style={{ backgroundImage: 'url(/fedex-assets/2019_FedEx_India_17.jpg)' }} />
        <div className="fxg-hero__header">
          <h1 className="fxg-hero-title">Welcome to FedEx Global Platform</h1>
          <p className="fxg-hero-subtitle">Internal Logistics &amp; Financial Platform</p>

          <ul className="fxg-cube-container" role="tablist">
            <li className={`fxg-cube ${activeCube === 'rate' ? 'fxg-cube--active' : ''}`} role="tab" onClick={() => setActiveCube('rate')}>
              <button className="fxg-cube__content" type="button">
                <span className="fxg-cube__icon">
                  <FiDollarSign size={24} />
                </span>
                <span className="fxg-cube__text">RATE &amp; TRANSIT TIMES</span>
              </button>
            </li>
            <li className={`fxg-cube ${activeCube === 'track' ? 'fxg-cube--active' : ''}`} role="tab" onClick={() => setActiveCube('track')}>
              <button className="fxg-cube__content" type="button">
                <span className="fxg-cube__icon">
                  <FiSearch size={24} />
                </span>
                <span className="fxg-cube__text">TRACK</span>
              </button>
            </li>
            <li className={`fxg-cube ${activeCube === 'ship' ? 'fxg-cube--active' : ''}`} role="tab" onClick={() => setActiveCube('ship')}>
              <button className="fxg-cube__content" type="button">
                <span className="fxg-cube__icon">
                  <FiBox size={24} />
                </span>
                <span className="fxg-cube__text">SHIP</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="fxg-app-container">
          {activeCube === 'rate' && (
            <div className="fxg-app-panel">
              <p className="fxg-app-info">Get rate quotes and transit times for your shipments.</p>
              <Link to={user ? '/dashboard' : '/signup'} className="fxg-btn-orange">
                Get Started <FiChevronRight />
              </Link>
            </div>
          )}
          {activeCube === 'track' && (
            <div className="fxg-app-panel fxg-app--active">
              <div className="fxg-tracking-module fxg-field__large">
                <form onSubmit={handleTrack} className="fxg-form">
                  <div className="fxg-field">
                    <input
                      type="text"
                      value={trackInput}
                      onChange={e => setTrackInput(e.target.value.toUpperCase())}
                      placeholder="TRACKING ID"
                      className="fxg-field__input-text"
                    />
                  </div>
                  <button type="submit" className="cc-aem-c-button cc-aem-c-button--primary">
                    Track <FiChevronRight />
                  </button>
                </form>
              </div>
            </div>
          )}
          {activeCube === 'ship' && (
            <div className="fxg-app-panel">
              <p className="fxg-app-info">Find a location near you to drop off your package.</p>
              <Link to={user ? '/track' : '/signup'} className="fxg-btn-orange">
                Start Shipping <FiChevronRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="fxg-cta-purple">
        <div className="fxg-cta-purple-container">
          <div className="fxg-cta-purple-icon">
            <img src="/fedex-assets/White_Offers_Icon_-_Large.svg" alt="" width={70} height={70} />
          </div>
          <div className="fxg-cta-purple-text">
            <h2>Sign up now to enjoy personalized shipping rates!</h2>
            <p>Benefit from our services and solutions tailored to your business needs.</p>
          </div>
          <div className="fxg-cta-purple-action">
            {!user ? (
              <Link to="/signup" className="fxg-btn-white">Open an Account</Link>
            ) : (
              <Link to="/dashboard" className="fxg-btn-white">Go to Dashboard</Link>
            )}
          </div>
        </div>
      </section>

      <section className="fxg-manage-section">
        <div className="fxg-wrapper">
          <h2 className="fxg-section-title-purple">Manage your shipments</h2>
          <div className="fxg-manage-grid">
            <div className="fxg-manage-card">
              <img src="/fedex-assets/Gradient_Courier_Icon.svg" alt="" className="fxg-manage-icon" />
              <h3>Schedule a Pickup</h3>
              <p>Arrange a pickup at your convenience</p>
              <Link to={user ? '/track' : '/login'} className="fxg-link--blue">Learn More</Link>
            </div>
            <div className="fxg-manage-card">
              <img src="/fedex-assets/Gradient_Location_Icon_Large_v2.svg" alt="" className="fxg-manage-icon" />
              <h3>Find Locations</h3>
              <p>Find drop-off locations near you</p>
              <Link to={user ? '/track' : '/login'} className="fxg-link--blue">Learn More</Link>
            </div>
            <div className="fxg-manage-card">
              <img src="/fedex-assets/Gradient_Dollar_Icon.svg" alt="" className="fxg-manage-icon" />
              <h3>Financial Management</h3>
              <p>Secure fund transfers between staff</p>
              <Link to={user ? '/transfer' : '/login'} className="fxg-link--blue">Learn More</Link>
            </div>
            <div className="fxg-manage-card">
              <img src="/fedex-assets/Gradient_Help_Icon.svg" alt="" className="fxg-manage-icon" />
              <h3>24/7 Support</h3>
              <p>Dedicated support team ready to assist</p>
              <Link to="/login" className="fxg-link--blue">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="fxg-safety-banner">
        <div className="fxg-wrapper">
          <div className="fxg-safety-content">
            <FiShield size={32} />
            <p>All deposit make are 100% safe, if any help is needed contact our support. We are always available to help.</p>
          </div>
        </div>
      </section>

      <section className="fxg-two-col-section">
        <div className="fxg-wrapper">
          <div className="fxg-two-col-grid">
            <div className="fxg-two-col-card">
              <div className="fxg-two-col-img">
                <img src="/fedex-assets/20181024_MK_05277_2506170.jpg" alt="Operating with agility" />
              </div>
              <div className="fxg-two-col-text">
                <h3>Operating with agility, delivering with global strength</h3>
                <p>Our integrated logistics network empowers your business to reach customers worldwide with speed and reliability.</p>
                <Link to={user ? '/dashboard' : '/signup'} className="fxg-btn-orange-outline">START SHIPPING NOW</Link>
              </div>
            </div>
            <div className="fxg-two-col-card">
              <div className="fxg-two-col-img">
                <img src="/fedex-assets/fy21_shutterstock_251.jpg" alt="Secure platform" />
              </div>
              <div className="fxg-two-col-text">
                <h3>Secure internal financial platform</h3>
                <p>Manage funds between staff with admin approval workflow, ensuring complete transparency and security.</p>
                <Link to={user ? '/transfer' : '/signup'} className="fxg-btn-orange-outline">GET STARTED</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="fxg-featured-offer">
        <div className="fxg-wrapper">
          <div className="fxg-featured-grid">
            <div className="fxg-featured-text">
              <h2>Recognize &amp; Prevent Fraud</h2>
              <p>Stay informed about the latest fraud trends and learn how to protect your business and shipments.</p>
              <Link to="/login" className="fxg-btn-orange">Learn More</Link>
            </div>
            <div className="fxg-featured-img">
              <img src="/fedex-assets/STL250513-PN-FEDEX-23531.jpg" alt="Fraud Prevention" />
            </div>
          </div>
        </div>
      </section>

      <section className="fxg-resources">
        <div className="fxg-wrapper">
          <h2 className="fxg-section-title-purple">Your Business Resource</h2>
          <div className="fxg-resources-grid">
            <div className="fxg-resource-card">
              <FiTruck size={36} />
              <h3>Customs Made Easier</h3>
              <p>Navigate international shipping regulations with our comprehensive customs tools.</p>
              <Link to="/login" className="fxg-btn-orange-outline">SEE SOLUTIONS</Link>
            </div>
            <div className="fxg-resource-card">
              <FiPackage size={36} />
              <h3>Parcel Tracking</h3>
              <p>Real-time tracking with detailed milestones and interactive map visualization.</p>
              <Link to={user ? '/track' : '/login'} className="fxg-btn-orange-outline">TRACK NOW</Link>
            </div>
            <div className="fxg-resource-card">
              <FiClock size={36} />
              <h3>Business Insights</h3>
              <p>Get valuable insights and analytics to optimize your logistics operations.</p>
              <Link to={user ? '/dashboard' : '/login'} className="fxg-btn-orange-outline">LEARN MORE</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="fxg-stats-section">
        <div className="fxg-wrapper">
          <div className="fxg-stats-grid">
            <div className="fxg-stat-item">
              <span className="fxg-stat-number">500+</span>
              <span className="fxg-stat-label">Active Users</span>
            </div>
            <div className="fxg-stat-item">
              <span className="fxg-stat-number">10K+</span>
              <span className="fxg-stat-label">Parcels Tracked</span>
            </div>
            <div className="fxg-stat-item">
              <span className="fxg-stat-number">$2M+</span>
              <span className="fxg-stat-label">Funds Managed</span>
            </div>
            <div className="fxg-stat-item">
              <span className="fxg-stat-number">99.9%</span>
              <span className="fxg-stat-label">Uptime</span>
            </div>
          </div>
          {canInstall && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button onClick={install} className="fxg-btn-orange" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', padding: '14px 32px' }}>
                <FiDownload size={20} /> Install App
              </button>
              <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-muted)' }}>Install as a standalone app for quick access</p>
            </div>
          )}
        </div>
      </section>

      {canInstall && (
        <div className="pwa-install-banner">
          <div className="pwa-install-banner-content">
            <div className="pwa-install-banner-icon">
              <img src="/logo.png" alt="FedEx" style={{ height: '40px', width: 'auto' }} />
            </div>
            <div className="pwa-install-banner-text">
              <strong>FedEx Global Platform</strong>
              <span>Install for quick access</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={install}>Install</button>
          </div>
        </div>
      )}

      <footer className="fxg-footer">
        <div className="fxg-footer-main">
          <div className="fxg-wrapper">
            <div className="fxg-footer-grid">
              <div className="fxg-footer-col">
                <h4>Our Company</h4>
                <Link to="/login">About Us</Link>
                <Link to="/login">Careers</Link>
                <Link to="/login">Contact Us</Link>
              </div>
              <div className="fxg-footer-col">
                <h4>New Customers</h4>
                <Link to="/signup">Open an Account</Link>
                <Link to="/login">Learn About Shipping</Link>
                <Link to="/login">Get a Quote</Link>
              </div>
              <div className="fxg-footer-col">
                <h4>Customer Support</h4>
                <Link to="/login">Help Center</Link>
                <Link to="/login">FAQs</Link>
                <Link to="/login">File a Claim</Link>
              </div>
              <div className="fxg-footer-col">
                <h4>More From FedEx</h4>
                <Link to="/login">Mobile App</Link>
                <Link to="/login">Developer Portal</Link>
                <Link to="/login">Supply Chain</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="fxg-footer-bottom">
          <div className="fxg-wrapper">
            <div className="fxg-footer-bottom-content">
              <span>&copy; FedEx 2026</span>
              <div className="fxg-footer-links">
                <Link to="/login">Terms of Use</Link>
                <Link to="/login">Security &amp; Privacy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
