import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useCurrency } from '../../hooks/useCurrency'
import { Link } from 'react-router-dom'
import { FiPlus, FiMapPin, FiEdit2, FiX } from 'react-icons/fi'

interface Parcel {
  id: string
  tracking_code: string
  sender_name: string
  recipient_name: string
  origin: string
  destination: string
  status: string
  fee: number
  fee_note: string | null
  current_location: string | null
  parcel_image: string | null
  created_at: string
}

export function AdminTracking() {
  const { format, info } = useCurrency()
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    tracking_code: '', sender_name: '', recipient_name: '',
    origin: '', destination: '', weight: '', description: '',
    fee: '', fee_note: '',
  })

  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ fee: '', fee_note: '', current_location: '' })
  const [editImage, setEditImage] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState('')

  useEffect(() => { loadParcels() }, [])

  function genCode() {
    return `FX-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
  }

  async function loadParcels() {
    const { data } = await supabase.from('parcels').select('*').order('created_at', { ascending: false })
    setParcels((data || []) as Parcel[])
    setLoading(false)
  }

  async function createParcel(e: React.FormEvent) {
    e.preventDefault()
    const code = form.tracking_code || genCode()
    const user = await supabase.auth.getUser()
    const { error } = await supabase.from('parcels').insert({
      tracking_code: code, sender_name: form.sender_name,
      recipient_name: form.recipient_name, origin: form.origin,
      destination: form.destination, weight: form.weight || null,
      description: form.description || null,
      fee: parseFloat(form.fee) || 0, fee_note: form.fee_note || null,
      created_by: user.data.user?.id,
    })
    if (!error) {
      setShowForm(false)
      setForm({ tracking_code: '', sender_name: '', recipient_name: '', origin: '', destination: '', weight: '', description: '', fee: '', fee_note: '' })
      loadParcels()
    }
  }

  function openEdit(p: Parcel) {
    setEditId(p.id)
    setEditForm({ fee: String(p.fee), fee_note: p.fee_note || '', current_location: p.current_location || '' })
    setEditImage(null)
    setEditImagePreview(p.parcel_image || '')
  }

  async function saveEdit(id: string) {
    let imageUrl = editImagePreview && !editImage ? editImagePreview : undefined
    if (editImage) {
      const ext = editImage.name.split('.').pop() || 'jpg'
      const path = `parcels/${id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('proofs').upload(path, editImage)
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(path)
        imageUrl = publicUrl
      }
    }
    await supabase.from('parcels').update({
      fee: parseFloat(editForm.fee) || 0,
      fee_note: editForm.fee_note || null,
      current_location: editForm.current_location || null,
      ...(imageUrl !== undefined ? { parcel_image: imageUrl } : {}),
    }).eq('id', id)
    setEditId(null)
    loadParcels()
  }

  async function addMilestone(parcelId: string) {
    const location = prompt('Enter milestone location:')
    if (!location) return
    const description = prompt('Enter milestone description:')
    await supabase.from('tracking_milestones').insert({
      parcel_id: parcelId, location, description: description || '', status: 'in_transit',
    })
    await supabase.from('parcels').update({ current_location: location }).eq('id', parcelId)
    loadParcels()
  }

  if (loading) return <div className="admin-page"><div className="loading-screen"><div className="spinner" /></div></div>

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Parcel Tracking</h1>
        <div className="admin-nav">
          <Link to="/admin" className="admin-nav-link">Overview</Link>
          <Link to="/admin/users" className="admin-nav-link">Users</Link>
          <Link to="/admin/transactions" className="admin-nav-link">Transactions</Link>
          <Link to="/admin/tracking" className="admin-nav-link active">Tracking</Link>
        </div>
      </div>

      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setForm({ ...form, tracking_code: genCode() }) }}>
          <FiPlus size={16} /> Create Tracking Code
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>New Parcel</h3>
          <form onSubmit={createParcel}>
            <div className="form-group">
              <label>Tracking Code</label>
              <input type="text" value={form.tracking_code} onChange={e => setForm({ ...form, tracking_code: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Sender Name</label>
                <input type="text" value={form.sender_name} onChange={e => setForm({ ...form, sender_name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Recipient Name</label>
                <input type="text" value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Origin</label>
                <input type="text" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input type="text" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Weight</label>
                <input type="text" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 2.5kg" />
              </div>
              <div className="form-group">
                <label>Fee ({info.code})</label>
                <input type="number" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label>Fee Note</label>
              <input type="text" value={form.fee_note} onChange={e => setForm({ ...form, fee_note: e.target.value })} placeholder="Reason for fee" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Parcel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tracking Code</th>
              <th>Sender</th>
              <th>Recipient</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Fee</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map(p => (
              <tr key={p.id}>
                <td><strong>{p.tracking_code}</strong></td>
                <td>{p.sender_name}</td>
                <td>{p.recipient_name}</td>
                <td>{p.origin}</td>
                <td>{p.destination}</td>
                <td><span className={`badge ${p.status}`}>{p.status.replace('_', ' ')}</span></td>
                <td>{p.fee > 0 ? format(p.fee) : '—'}</td>
                <td>{p.parcel_image ? <img src={p.parcel_image} alt="" className="admin-thumb" /> : '—'}</td>
                <td>
                  <div className="admin-actions">
                    <button className="icon-btn" onClick={() => openEdit(p)} title="Edit"><FiEdit2 size={18} /></button>
                    <button className="icon-btn" onClick={() => addMilestone(p.id)} title="Add milestone"><FiMapPin size={18} /></button>
                  </div>
                  {editId === p.id && (
                    <div className="admin-edit-overlay" onClick={() => setEditId(null)}>
                      <div className="admin-edit-card" onClick={e => e.stopPropagation()}>
                        <div className="admin-edit-header">
                          <h3>Edit {p.tracking_code}</h3>
                          <button className="icon-btn" onClick={() => setEditId(null)}><FiX size={20} /></button>
                        </div>
                        <div className="form-group">
                          <label>Fee ({info.code})</label>
                          <input type="number" value={editForm.fee} onChange={e => setEditForm({ ...editForm, fee: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Fee Note</label>
                          <input type="text" value={editForm.fee_note} onChange={e => setEditForm({ ...editForm, fee_note: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Current Location</label>
                          <input type="text" value={editForm.current_location} onChange={e => setEditForm({ ...editForm, current_location: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Parcel Image</label>
                          {editImagePreview && <img src={editImagePreview} alt="" className="admin-thumb" style={{ display: 'block', marginBottom: 8 }} />}
                          <input type="file" accept="image/*" onChange={e => {
                            const f = e.target.files?.[0]
                            if (f) { setEditImage(f); setEditImagePreview(URL.createObjectURL(f)) }
                          }} />
                        </div>
                        <button className="btn btn-primary btn-block" onClick={() => saveEdit(p.id)}>Save Changes</button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
