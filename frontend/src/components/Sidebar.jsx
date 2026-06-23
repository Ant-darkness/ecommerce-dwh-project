import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const [user, setUser] = useState(null)

  const loadUser = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    loadUser()
    window.addEventListener('authChange', loadUser)
    return () => window.removeEventListener('authChange', loadUser)
  }, [])

  const navItems = [
    { to: '/marketplace', icon: '🛍️', label: 'Marketplace' },
    { to: '/post-ad',      icon: '➕', label: 'Post an Ad' },
    { to: '/dashboard',    icon: '📊', label: 'Admin Panel' },
    { to: '/customers',    icon: '👥', label: 'Customers List' },
    { to: '/pipeline',     icon: '⚙️', label: 'Pipeline Status' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛍️</div>
        <div>
          <div className="logo-text">Soko Kuu</div>
          <div className="logo-sub">DWH Marketplace</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Kuhusu Soko</div>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <NavLink to="/profile" className="sidebar-user-badge">
            <div className="user-avatar-mini">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="user-info-mini">
              <span className="username-text">@{user.username}</span>
              <span className="user-role-text">Biashara Profile</span>
            </div>
          </NavLink>
        ) : (
          <NavLink to="/auth" className="sidebar-auth-button">
            <span className="auth-icon">🔑</span>
            Ingia / Jisajili
          </NavLink>
        )}
        
        <div className="pipeline-badge" style={{ marginTop: '12px' }}>
          <div className="pulse-dot" />
          DWH Live Analytics
        </div>
      </div>
    </aside>
  )
}
