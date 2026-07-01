import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ParcelMap } from '../components/ParcelMap'
import { FiSearch, FiMapPin, FiCheckCircle, FiTruck, FiPackage, FiClock, FiArrowLeft } from 'react-icons/fi'

interface Milestone {
  id: string
  location: string
  description: string
  status: string
  timestamp: string
}

interface Parcel {
  id: string
  tracking_code: string
  sender_name: string
  recipient_name: string
  origin: string
  destination: string
  weight: string | null
  description: string | null
  status: string
  fee: number
  fee_note: string | null
  current_location: string | null
  parcel_image: string | null
  milestones: Milestone[]
}

const statusIcons: Record<string, any> = {
  pending: FiClock, in_transit: FiTruck,
  out_for_delivery: FiPackage, delivered: FiCheckCircle,
  on_hold: FiClock, exception: FiPackage,
}

const statusLabels: Record<string, string> = {
  pending: 'Pending', in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery', delivered: 'Delivered',
  on_hold: 'On Hold', exception: 'Exception',
}

export function PublicTracking() {
  const { code } = useParams()
  const [parcel, setParcel] = useState<Parcel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [codeInput, setCodeInput] = useState(code || '')

  useEffect(() => {
    if (code) { setCodeInput(code); fetchParcel(code) }
    else setLoading(false)
  }, [code])

  async function fetchParcel(trackingCode: string) {
    setLoading(true)
    setError('')
    try {
      const { data, error: rpcErr } = await supabase.rpc('get_parcel_by_tracking', { code: trackingCode.toUpperCase() })
      if (rpcErr || !data) { setError('Tracking code not found'); setParcel(null) }
      else setParcel(data as unknown as Parcel)
    } catch { setError('Could not load tracking data') }
    setLoading(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (codeInput.trim()) {
      window.history.pushState({}, '', `/track/${codeInput.trim().toUpperCase()}`)
      fetchParcel(codeInput.trim())
    }
  }

  const StatusIcon = parcel ? (statusIcons[parcel.status] || FiClock) : FiClock

  return (
    <div className="tracking-page">
      <div className="tracking-hero">
        <Link to="/" className="tracking-back"><FiArrowLeft size={18} /> Back to Home</Link>
        <h1>Track Your Parcel</h1>
        <p>Enter your tracking number to see real-time updates</p>
        <form onSubmit={handleSearch} className="tracking-hero-form">
          <div className="tracking-input-group">
            <FiSearch size={20} />
            <input
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. FX-2024-001"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>
      </div>

      <div className="tracking-result">
        {error && <div className="alert alert-error">{error}</div>}

        {loading && <div className="loading-screen"><div className="spinner" /></div>}

        {parcel && (
          <>
            <div className="parcel-status-bar" style={{ '--status-color': parcel.status === 'delivered' ? '#00A86B' : parcel.status === 'in_transit' ? '#3B82F6' : '#F59E0B' } as React.CSSProperties}>
              <StatusIcon size={24} />
              <span>{statusLabels[parcel.status] || parcel.status.replace('_', ' ')}</span>
            </div>

            <div className="parcel-grid">
              <div className="parcel-main-info">
                <div className="parcel-code">{parcel.tracking_code}</div>

                <div className="parcel-detail-cards">
                  <div className="pdc"><label>From</label><span>{parcel.origin}</span></div>
                  <div className="pdc"><label>To</label><span>{parcel.destination}</span></div>
                  <div className="pdc"><label>Sender</label><span>{parcel.sender_name}</span></div>
                  <div className="pdc"><label>Recipient</label><span>{parcel.recipient_name}</span></div>
                  {parcel.weight && <div className="pdc"><label>Weight</label><span>{parcel.weight}</span></div>}
                  {parcel.current_location && <div className="pdc"><label>Current Location</label><span>{parcel.current_location}</span></div>}
                </div>

                {parcel.description && (
                  <div className="parcel-description">
                    <h3>Description</h3>
                    <p>{parcel.description}</p>
                  </div>
                )}
              </div>

              {parcel.parcel_image && (
                <div className="parcel-image-section">
                  <img src={parcel.parcel_image} alt="Parcel" className="parcel-image" />
                </div>
              )}
            </div>

            <div className="parcel-section">
              <h3>Tracking Route</h3>
              <ParcelMap
                origin={parcel.origin}
                destination={parcel.destination}
                currentLocation={parcel.current_location}
                milestones={parcel.milestones}
              />
            </div>

            <div className="parcel-section">
              <h3>Tracking Timeline</h3>
              <div className="timeline">
                {parcel.milestones.length === 0 && parcel.status === 'pending' ? (
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <strong>Package Pending</strong>
                      <p>Awaiting pickup by carrier</p>
                    </div>
                  </div>
                ) : (
                  parcel.milestones.map(ms => {
                    const Icon = statusIcons[ms.status] || FiMapPin
                    return (
                      <div key={ms.id} className="timeline-item">
                        <div className="timeline-dot"><Icon size={14} /></div>
                        <div className="timeline-content">
                          <strong>{ms.location}</strong>
                          <p>{ms.description}</p>
                          <small>{new Date(ms.timestamp).toLocaleString()}</small>
                        </div>
                      </div>
                    )
                  })
                )}
                {parcel.current_location && parcel.milestones.length > 0 && (
                  <div className="timeline-item current">
                    <div className="timeline-dot"><FiMapPin size={14} /></div>
                    <div className="timeline-content">
                      <strong>Current Location</strong>
                      <p>{parcel.current_location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
