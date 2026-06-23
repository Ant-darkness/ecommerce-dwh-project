import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CATEGORIES = ['Houses', 'Cars', 'Livestock', 'Clothes', 'Shoes', 'General']

export default function PostAd() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('General')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
  }, [])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      setError('Lazima uwe umeingia kwenye akaunti ili kupost tangazo.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('title', title)
    formData.append('price', price)
    formData.append('category', category)
    formData.append('description', description)
    if (file) {
      formData.append('file', file)
    }

    try {
      const response = await fetch(`${API}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Imeshindikana kuweka tangazo')
      }

      setSuccess('Tangazo lako limewekwa kwa mafanikio!')
      setTimeout(() => {
        navigate('/marketplace')
      }, 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="unauthorized-state">
        <div className="unauthorized-card">
          <div className="lock-icon">🔒</div>
          <h2>Ukurasa Umezuiwa</h2>
          <p>Huruhusiwi kupost tangazo la biashara bila kuwa umeingia (login) kwenye akaunti yako kwanza.</p>
          <button className="btn-redirect-auth" onClick={() => navigate('/auth')}>
            Ingia kwenye Akaunti / Jisajili
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="post-ad-container">
      <div className="page-header">
        <div className="header-badge">➕ Tangazo Jipya</div>
        <h1>Weka Tangazo la Biashara</h1>
        <p>Jaza maelezo sahihi ya bidhaa yako ili kuanza kupokea wateja sokoni.</p>
      </div>

      <div className="post-ad-card">
        {error && <div className="auth-alert error">⚠️ {error}</div>}
        {success && <div className="auth-alert success">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="post-ad-form">
          <div className="form-group">
            <label>Kichwa cha Tangazo (Title)</label>
            <input
              type="text"
              placeholder="Mfano: Toyota Harrier ya Mwaka 2015 safi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Kategoria ya Bidhaa (Category)</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group half">
              <label>Bei ya Bidhaa (Price in TSh)</label>
              <input
                type="number"
                placeholder="Mfano: 15000000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Picha ya Bidhaa (Product Image)</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept="image/*"
              />
              <label htmlFor="file-upload" className="custom-file-upload">
                {file ? `📂 ${file.name}` : '📷 Bonyeza kupakia picha ya bidhaa'}
              </label>
              <p className="file-upload-tip">Inasaidia picha za JPEG, PNG na WebP. Ukikosa picha, soko litatumia picha ya kategoria kama mbadala.</p>
            </div>
          </div>

          <div className="form-group">
            <label>Maelezo ya Kina ya Bidhaa (Description)</label>
            <textarea
              placeholder="Eleza sifa zote muhimu za bidhaa hii kama vile rangi, ukubwa, ubora, eneo ilipo na maelezo ya mawasiliano ya ziada..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              required
            />
          </div>

          <div className="post-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/marketplace')}>
              Ghairi (Cancel)
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Subiri kidogo...' : 'Tuma Tangazo (Post Ad) 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
