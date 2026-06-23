import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Pipeline from './pages/Pipeline'
import Marketplace from './pages/Marketplace'
import PostAd from './pages/PostAd'
import Profile from './pages/Profile'
import Auth from './pages/Auth'

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/marketplace" replace />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/post-ad" element={<PostAd />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/pipeline" element={<Pipeline />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
