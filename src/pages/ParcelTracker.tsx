import { useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { useCurrency } from '../hooks/useCurrency'
import { supabase } from '../lib/supabase'
import { FiSearch, FiMapPin, FiCheckCircle, FiTruck, FiPackage, FiClock } from 'react-icons/fi'

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
  milestones: Milestone[]
}

export function ParcelTracker() {
  const { format } = useCurrency()
  const [trackingCode, setTrackingCode] = useState('')
  const [parcel, setParcel] = useState<Parcel | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const statusIcons: Record<string, any> = {
    pending: FiClock,
    in_transit: FiTruck,
    out_for_delivery: FiPackage,
    delivered: FiCheckCircle,
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!trackingCode.trim()) { setError('Enter a tracking number'); return }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('parcels')
      .select(`
        *,
        milestones:tracking_milestones(*)
      `)
      .eq('tracking_code', trackingCode.toUpperCase())
      .single()
    setLoading(false)
    if (err || !data) { setError('Tracking code not found'); setParcel(null); return }
    setParcel(data as unknown as Parcel)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <h1>Track Parcel</h1>
        <form onSubmit={handleTrack} className="track-form">
          <div className="track-input-group">
            <FiSearch size={20} />
            <input
              type="text"
              value={trackingCode}
              onChange={e => setTrackingCode(e.target.value.toUpperCase())}
              placeholder="Enter tracking number (e.g. FX-2024-001)"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>
        {error && <div className="alert alert-error">{error}</div>}

        {parcel && (
          <div className="parcel-details">
            <div className="parcel-header">
              <h2>{parcel.tracking_code}</h2>
              <span className={`parcel-status status-${parcel.status}`}>
                {parcel.status.replace('_', ' ')}
              </span>
            </div>

            <div className="parcel-info-grid">
              <div className="parcel-info-card">
                <label>From</label>
                <p>{parcel.origin}</p>
              </div>
              <div className="parcel-info-card">
                <label>To</label>
                <p>{parcel.destination}</p>
              </div>
              <div className="parcel-info-card">
                <label>Sender</label>
                <p>{parcel.sender_name}</p>
              </div>
              <div className="parcel-info-card">
                <label>Recipient</label>
                <p>{parcel.recipient_name}</p>
              </div>
              {parcel.weight && (
                <div className="parcel-info-card">
                  <label>Weight</label>
                  <p>{parcel.weight}</p>
                </div>
              )}
              {parcel.fee > 0 && (
                <div className="parcel-info-card">
                  <label>Fee</label>
                  <p>{format(parcel.fee)}</p>
                  {parcel.fee_note && <small>{parcel.fee_note}</small>}
                </div>
              )}
            </div>

            {parcel.description && (
              <div className="parcel-description">
                <h3>Description</h3>
                <p>{parcel.description}</p>
              </div>
            )}

            <div className="parcel-timeline">
              <h3>Tracking Timeline</h3>
              <div className="timeline">
                {(parcel.milestones || []).length === 0 && parcel.status === 'pending' ? (
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <strong>Package Pending</strong>
                      <p>Awaiting pickup by carrier</p>
                    </div>
                  </div>
                ) : (
                  (parcel.milestones || []).map(ms => {
                    const Icon = statusIcons[ms.status] || FiMapPin
                    return (
                      <div key={ms.id} className="timeline-item">
                        <div className="timeline-dot">
                          <Icon size={14} />
                        </div>
                        <div className="timeline-content">
                          <strong>{ms.location}</strong>
                          <p>{ms.description}</p>
                          <small>{new Date(ms.timestamp).toLocaleString()}</small>
                        </div>
                      </div>
                    )
                  })
                )}
                {parcel.current_location && (
                  <div className="timeline-item current">
                    <div className="timeline-dot">
                      <FiMapPin size={14} />
                    </div>
                    <div className="timeline-content">
                      <strong>Current Location</strong>
                      <p>{parcel.current_location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
