import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')

  const handleToggle = () => {
    setIsRegister(!isRegister)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    let url = `${API}/api/auth/login`

    if (isRegister) {
      url = `${API}/api/auth/register`
      formData.append('username', username)
      formData.append('phone', phone)
      formData.append('bio', bio)
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong')
      }

      setSuccess(isRegister ? 'Registration successful! Logging in...' : 'Login successful!')
      
      // Store token and user details
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Trigger custom storage event to update other components
      window.dispatchEvent(new Event('authChange'))

      setTimeout(() => {
        navigate('/marketplace')
      }, 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isRegister ? 'Tengeneza Akaunti' : 'Karibu Tena'}</h2>
          <p>{isRegister ? 'Sajili credentials zako kuanza biashara' : 'Ingia kuweka matangazo au kununua bidhaa'}</p>
        </div>

        {error && <div className="auth-alert error">⚠️ {error}</div>}
        {success && <div className="auth-alert success">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>Jina la Mtumiaji (Username)</label>
              <input
                type="text"
                placeholder="Mfano: abely_tz"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Barua Pepe (Email Address)</label>
            <input
              type="email"
              placeholder="Mfano: user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Nenosiri (Password)</label>
            <input
              type="password"
              placeholder="Weka password yako"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label>Nambari ya Simu (Phone Number)</label>
                <input
                  type="tel"
                  placeholder="Mfano: +255 712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Maelezo Mafupi (Bio Description)</label>
                <textarea
                  placeholder="Eleza kwa ufupi kuhusu biashara yako..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="3"
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Subiri kidogo...' : isRegister ? 'Jisajili (Sign Up)' : 'Ingia (Login)'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isRegister ? 'Tayari unayo akaunti?' : 'Huna akaunti bado?'}{' '}
            <button type="button" className="btn-toggle-auth" onClick={handleToggle}>
              {isRegister ? 'Ingia hapa (Login)' : 'Jisajili hapa (Sign Up)'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
