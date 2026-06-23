import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CATEGORY_ICONS = {
  All: '🌐',
  Houses: '🏠',
  Cars: '🚗',
  Livestock: '🐏',
  Clothes: '👕',
  Shoes: '👟',
  General: '📦',
}

const CATEGORY_DEFAULTS = {
  Houses: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  Cars: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
  Livestock: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
  Clothes: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
  Shoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
  General: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
}

export default function Marketplace() {
  const [products, setProducts] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Current user info
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  // Notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' })

  const loadAuth = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    } else {
      setUser(null)
      setToken(null)
    }
  }

  useEffect(() => {
    loadAuth()
    // Listen for auth changes
    window.addEventListener('authChange', loadAuth)
    return () => window.removeEventListener('authChange', loadAuth)
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000)
  }

  // Fetch products and recommendations
  const fetchProducts = async () => {
    try {
      setLoading(true)
      let url = `${API}/api/products`
      const params = []
      if (selectedCategory !== 'All') params.push(`category=${selectedCategory}`)
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`)
      
      if (params.length > 0) {
        url += `?${params.join('&')}`
      }

      const res = await fetch(url)
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      showToast('Kushindwa kupata bidhaa', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const res = await fetch(`${API}/api/recommendations`, { headers })
      if (res.ok) {
        const data = await res.json()
        setRecommendations(data)
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    fetchRecommendations()
  }, [token])

  // Countdowns for sold products
  useEffect(() => {
    const interval = setInterval(() => {
      setProducts((prevProducts) =>
        prevProducts
          .map((p) => {
            if (p.status === 'sold' && p.seconds_left > 0) {
              return { ...p, seconds_left: p.seconds_left - 1 }
            }
            return p;
          })
          .filter((p) => !(p.status === 'sold' && p.seconds_left <= 0))
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleBuy = async (productId, e) => {
    if (e) e.stopPropagation()
    try {
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API}/api/products/${productId}/buy`, {
        method: 'POST',
        headers
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.detail || 'Imeshindikana kununua')
      }

      showToast('Hongera! Bidhaa imenunuliwa. Itaonekana ikiwa SOLDOUT kwa dakika 3 kisha itatoweka.')
      fetchProducts()
      fetchRecommendations()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (productId, e) => {
    if (e) e.stopPropagation()
    if (!token) return
    if (!confirm('Je, una uhakika unataka kufuta tangazo hili?')) return

    try {
      const res = await fetch(`${API}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Imeshindikana kufuta tangazo')
      }

      showToast('Tangazo limefutwa kwa mafanikio!')
      setProducts(products.filter((p) => p.id !== productId))
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(null)
      }
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleMarkSold = async (productId, e) => {
    if (e) e.stopPropagation()
    if (!token) return

    try {
      const res = await fetch(`${API}/api/products/${productId}/sold`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Imeshindikana kubadilisha hali ya bidhaa')
      }

      showToast('Bidhaa imewasilishwa kama SOLDOUT. Itaondolewa baada ya dakika 3.')
      fetchProducts()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const viewProductDetails = async (product) => {
    setSelectedProduct(product)
    
    // Log view interaction on backend
    try {
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      // Call details endpoint to log view interaction
      await fetch(`${API}/api/products/${product.id}`, { headers })
      // Refresh recommendations list after logging a view
      fetchRecommendations()
    } catch (e) {
      console.error('Failed to log view:', e)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(price).replace('TZS', 'TSh')
  }

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s left`
  }

  return (
    <div className="marketplace">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'error' ? '⚠️' : '✨'} {toast.message}
        </div>
      )}

      {/* Header Banner */}
      <div className="page-header">
        <div className="header-badge">🛍️ Soko la Kidijitali</div>
        <h1>Soko Kuu la Bidhaa</h1>
        <p>Gundua bidhaa mbalimbali, weka matangazo yako na ununue bidhaa kwa usalama hapa.</p>
      </div>

      {/* Search and Category Filters */}
      <div className="marketplace-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tafuta magari, nyumba, nguo, viatu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="categories-bar">
          {Object.keys(CATEGORY_ICONS).map((cat) => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span className="chip-icon">{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <div className="section-title-wrap">
            <h2>✨ Mapendekezo Yako (Recommended For You)</h2>
            <p>Kulingana na bidhaa unazotembelea mara kwa mara</p>
          </div>
          <div className="recommendations-scroll">
            {recommendations.map((prod) => (
              <div 
                key={`rec-${prod.id}`} 
                className="recommendation-card"
                onClick={() => viewProductDetails(prod)}
              >
                <div className="rec-image-wrapper">
                  <img
                    src={prod.image_url || CATEGORY_DEFAULTS[prod.category] || CATEGORY_DEFAULTS.General}
                    alt={prod.title}
                  />
                  {prod.status === 'sold' && <div className="soldout-badge-rec">SOLDOUT</div>}
                </div>
                <div className="rec-details">
                  <span className="rec-category">{prod.category}</span>
                  <h3>{prod.title}</h3>
                  <div className="rec-price">{formatPrice(prod.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Listings */}
      <div className="listings-section">
        <h2>Matangazo Yote</h2>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <span>Kupakia bidhaa...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Hakuna bidhaa zilizopatikana</h3>
            <p>Jaribu kubadilisha kategoria au maneno ya utafutaji.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((prod) => (
              <div 
                key={prod.id} 
                className={`product-card ${prod.status === 'sold' ? 'sold' : ''}`}
                onClick={() => viewProductDetails(prod)}
              >
                <div className="product-image-wrapper">
                  <img
                    src={prod.image_url || CATEGORY_DEFAULTS[prod.category] || CATEGORY_DEFAULTS.General}
                    alt={prod.title}
                  />
                  {prod.status === 'sold' && (
                    <div className="soldout-overlay">
                      <div className="soldout-banner">SOLDOUT</div>
                      {prod.seconds_left > 0 && (
                        <div className="countdown-timer">
                          ⏳ {formatTimeLeft(prod.seconds_left)}
                        </div>
                      )}
                    </div>
                  )}
                  <span className="product-card-category">{prod.category}</span>
                </div>

                <div className="product-card-details">
                  <h3>{prod.title}</h3>
                  <p className="product-owner">Weka na: 👤 {prod.owner_name}</p>
                  <p className="product-desc-preview">{prod.description}</p>
                  
                  <div className="product-card-footer">
                    <span className="product-price">{formatPrice(prod.price)}</span>
                    <div className="product-actions">
                      {prod.status === 'active' && (
                        <button
                          className="btn-buy"
                          onClick={(e) => handleBuy(prod.id, e)}
                        >
                          Buy Now 🛒
                        </button>
                      )}
                      {user && user.id === prod.owner_id && (
                        <div className="owner-quick-actions">
                          {prod.status === 'active' && (
                            <button
                              className="btn-sold-owner"
                              title="Weka alama kuwa Imeuzwa"
                              onClick={(e) => handleMarkSold(prod.id, e)}
                            >
                              ✅ Sold
                            </button>
                          )}
                          <button
                            className="btn-delete"
                            title="Futa Tangazo"
                            onClick={(e) => handleDelete(prod.id, e)}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>✖</button>
            <div className="modal-content">
              <div className="modal-media">
                <img
                  src={selectedProduct.image_url || CATEGORY_DEFAULTS[selectedProduct.category] || CATEGORY_DEFAULTS.General}
                  alt={selectedProduct.title}
                />
              </div>
              <div className="modal-info">
                <span className="modal-category">{selectedProduct.category}</span>
                <h2>{selectedProduct.title}</h2>
                <div className="modal-price">{formatPrice(selectedProduct.price)}</div>
                
                <div className="modal-owner-details">
                  <h4>Taarifa za Muuzaji:</h4>
                  <p>👤 <strong>Jina:</strong> {selectedProduct.owner_name}</p>
                  <p>📧 <strong>Email:</strong> {selectedProduct.owner_email || 'Bila Barua Pepe'}</p>
                </div>

                <div className="modal-desc">
                  <h4>Maelezo ya Bidhaa:</h4>
                  <p>{selectedProduct.description}</p>
                </div>

                <div className="modal-actions">
                  {selectedProduct.status === 'active' && (
                    <button
                      className="btn-modal-buy"
                      onClick={() => {
                        handleBuy(selectedProduct.id)
                        setSelectedProduct(null)
                      }}
                    >
                      Kununua Sasa (Buy Now) 🛒
                    </button>
                  )}
                  {selectedProduct.status === 'sold' && (
                    <div className="modal-sold-status">
                      ❌ Bidhaa Hii Imeuzwa (SOLDOUT)
                    </div>
                  )}
                  {user && user.id === selectedProduct.owner_id && (
                    <div className="modal-owner-panel">
                      {selectedProduct.status === 'active' && (
                        <button
                          className="btn-modal-sold-owner"
                          onClick={() => {
                            handleMarkSold(selectedProduct.id)
                            setSelectedProduct(null)
                          }}
                        >
                          Weka Alama Imeuzwa (Mark Sold)
                        </button>
                      )}
                      <button
                        className="btn-modal-delete"
                        onClick={() => {
                          handleDelete(selectedProduct.id)
                        }}
                      >
                        Futa Tangazo Hili (Delete Ad) 🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
