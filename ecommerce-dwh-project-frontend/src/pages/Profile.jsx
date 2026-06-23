import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CATEGORY_DEFAULTS = {
  Houses: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  Cars: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
  Livestock: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
  Clothes: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
  Shoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
  General: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
}

export default function Profile() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [myProducts, setMyProducts] = useState([])
  const [loadingListings, setLoadingListings] = useState(true)
  
  // Edit Profile Mode
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setToken(storedToken)
      setBio(parsedUser.bio || '')
      setPhone(parsedUser.phone || '')
    } else {
      navigate('/auth')
    }
  }, [])

  const fetchMyProducts = async () => {
    if (!user) return
    try {
      setLoadingListings(true)
      const res = await fetch(`${API}/api/products?user_id=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setMyProducts(data)
      }
    } catch (e) {
      console.error('Error fetching my products:', e)
    } finally {
      setLoadingListings(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMyProducts()
    }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('authChange'))
    navigate('/marketplace')
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('bio', bio)
    formData.append('phone', phone)

    try {
      const res = await fetch(`${API}/api/auth/profile/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Imeshindikana kusasisha wasifu')
      }

      // Update local user state
      const updatedUser = { ...user, bio: data.bio, phone: data.phone }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccess('Wasifu wako umesasishwa kwa mafanikio!')
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkSold = async (productId) => {
    try {
      const res = await fetch(`${API}/api/products/${productId}/sold`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Imeshindikana kubadilisha hali ya bidhaa')

      setSuccess('Bidhaa imesasishwa kama SOLDOUT. Itaondolewa sokoni baada ya dakika 3.')
      fetchMyProducts()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Je, una uhakika unataka kufuta tangazo hili?')) return
    try {
      const res = await fetch(`${API}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Imeshindikana kufuta tangazo')

      setSuccess('Tangazo limefutwa kwa mafanikio!')
      setMyProducts(myProducts.filter((p) => p.id !== productId))
    } catch (e) {
      setError(e.message)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(price).replace('TZS', 'TSh')
  }

  if (!user) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <span>Kupakia wasifu wako...</span>
      </div>
    )
  }

  // Calculate statistics
  const activeCount = myProducts.filter((p) => p.status === 'active').length
  const soldCount = myProducts.filter((p) => p.status === 'sold' || p.status === 'expired').length
  const totalRevenue = myProducts
    .filter((p) => p.status === 'sold' || p.status === 'expired')
    .reduce((sum, p) => sum + p.price, 0)

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="header-badge">👤 Wasifu Wangu</div>
        <h1>Wasifu wa Mtumiaji</h1>
        <p>Simamia taarifa zako za kibinafsi, wasifu wa biashara, na bidhaa ulizopost.</p>
      </div>

      <div className="profile-layout">
        {/* Profile Card */}
        <div className="profile-details-card">
          <div className="profile-avatar-large">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <h2>@{user.username}</h2>
          <p className="profile-email">📧 {user.email}</p>
          
          <div className="profile-bio-section">
            <h4>Kuhusu Mimi / Biashara:</h4>
            <p className="profile-bio-text">{user.bio || 'Mtumiaji hajaweka maelezo ya bio bado. Bonyeza hariri (edit) kuweka maelezo.'}</p>
          </div>

          <div className="profile-meta-info">
            <p><strong>Nambari ya Simu:</strong> {user.phone || 'Hajaweka'}</p>
            <p><strong>Mwanachama tangu:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Leo'}</p>
          </div>

          {error && <div className="auth-alert error">⚠️ {error}</div>}
          {success && <div className="auth-alert success">✅ {success}</div>}

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="profile-edit-form">
              <div className="form-group">
                <label>Simu ya Biashara</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mfano: +255 712 345 678"
                  required
                />
              </div>
              <div className="form-group">
                <label>Maelezo ya Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Eleza biashara zako..."
                  rows="3"
                />
              </div>
              <div className="edit-actions">
                <button type="button" className="btn-cancel-edit" onClick={() => setIsEditing(false)}>
                  Ghairi
                </button>
                <button type="submit" className="btn-save-profile" disabled={loading}>
                  {loading ? 'Hifadhi...' : 'Hifadhi'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-card-actions">
              <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                ✏️ Hariri Wasifu (Edit Profile)
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                🚪 Toka (Log Out)
              </button>
            </div>
          )}
        </div>

        {/* Profile Statistics & Listings */}
        <div className="profile-listings-area">
          {/* Stats Summary Grid */}
          <div className="profile-stats-grid">
            <div className="profile-stat-box">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{activeCount}</h3>
                <p>Bidhaa Amilifu (Active)</p>
              </div>
            </div>
            <div className="profile-stat-box">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>{soldCount}</h3>
                <p>Zilizouzwa (Soldout)</p>
              </div>
            </div>
            <div className="profile-stat-box">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>{formatPrice(totalRevenue)}</h3>
                <p>Mapato ya Mauzo</p>
              </div>
            </div>
          </div>

          {/* User's Listings Manager */}
          <div className="my-listings-section">
            <h3>Matangazo Yako ya Biashara ({myProducts.length})</h3>
            
            {loadingListings ? (
              <div className="loading-spinner">
                <div className="spinner" />
                <span>Kupakia matangazo yako...</span>
              </div>
            ) : myProducts.length === 0 ? (
              <div className="empty-listings-state">
                <p>Bado haujaweka tangazo lolote la biashara.</p>
                <button onClick={() => navigate('/post-ad')}>Tengeneza Tangazo Jipya Sasa ➕</button>
              </div>
            ) : (
              <div className="listings-list">
                {myProducts.map((prod) => (
                  <div key={prod.id} className={`my-listing-row ${prod.status}`}>
                    <div className="row-thumb">
                      <img
                        src={prod.image_url || CATEGORY_DEFAULTS[prod.category] || CATEGORY_DEFAULTS.General}
                        alt={prod.title}
                      />
                    </div>
                    <div className="row-info">
                      <span className="row-category">{prod.category}</span>
                      <h4>{prod.title}</h4>
                      <p className="row-price">{formatPrice(prod.price)}</p>
                      <p className="row-date">Uliweka: {new Date(prod.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="row-status-actions">
                      <div className="status-indicator">
                        <span className={`status-dot ${prod.status}`} />
                        <span className="status-text">
                          {prod.status === 'active' ? 'Amilifu (Active)' : prod.status === 'sold' ? 'Imeuzwa (Soldout)' : 'Kipindi Kimeisha (Expired)'}
                        </span>
                      </div>
                      
                      <div className="row-actions">
                        {prod.status === 'active' && (
                          <button
                            className="btn-mark-sold"
                            onClick={() => handleMarkSold(prod.id)}
                            title="Weka alama kuwa Imeuzwa"
                          >
                            Mark Sold ✅
                          </button>
                        )}
                        <button
                          className="btn-delete-row"
                          onClick={() => handleDelete(prod.id)}
                          title="Futa Tangazo hili kabisa"
                        >
                          Futa Tangazo 🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
