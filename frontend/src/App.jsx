import React, { useState, useEffect } from 'react'
import AuthScreen from './components/Auth/AuthScreen'
import Canvas from './components/LayoutEditor/Canvas'
import CameraPlayer from './components/LiveStream/CameraPlayer'
import { supabase } from './services/supabaseClient'
import { LogOut, Store, Plus, Grid, Video, Settings, Shield } from 'lucide-react'

export default function App() {
  const [sessionData, setSessionData] = useState(null)
  
  // Store management state
  const [stores, setStores] = useState([])
  const [newStore, setNewStore] = useState({ name: '', location: '', width: 20, height: 10 })
  const [loading, setLoading] = useState(false)
  
  // Navigation states
  const [activeView, setActiveView] = useState('stores') // 'stores', 'editor', 'cameras'
  const [selectedStore, setSelectedStore] = useState(null)
  const [activeStoreCameras, setActiveStoreCameras] = useState([])

  useEffect(() => {
    // Check local session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Fetch profile
        supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data: profile }) => {
          setSessionData({
            token: session.access_token,
            user: { ...session.user, role: profile?.role || 'User' }
          })
        })
      }
    })
  }, [])

  useEffect(() => {
    if (sessionData) {
      fetchStores()
    }
  }, [sessionData])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/stores', {
        headers: { 'Authorization': `Bearer ${sessionData.token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (err) {
      console.error('Failed to load stores', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterStore = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.token}`
        },
        body: JSON.stringify(newStore)
      })
      if (response.ok) {
        setNewStore({ name: '', location: '', width: 20, height: 10 })
        fetchStores()
      } else {
        const err = await response.json()
        alert(err.detail || 'Failed to create store')
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSessionData(null)
    setActiveView('stores')
  }

  const openEditor = (store) => {
    setSelectedStore(store)
    setActiveView('editor')
  }

  const openCameras = async (store) => {
    setSelectedStore(store)
    try {
      const response = await fetch(`http://localhost:8000/api/stores/${store.id}/layout`, {
        headers: { 'Authorization': `Bearer ${sessionData.token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setActiveStoreCameras(data.cameras || [])
        setActiveView('cameras')
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!sessionData) {
    return <AuthScreen onAuthSuccess={(data) => setSessionData(data)} />
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'Fira Sans, sans-serif' }}>
      {/* Top Navbar */}
      <nav style={{
        backgroundColor: '#1E40AF',
        color: '#FFFFFF',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield style={{ width: '24px', height: '24px', color: '#D97706' }} />
          <span style={{ fontWeight: 'bold', fontSize: '18px', fontFamily: 'Fira Code, monospace' }}>
            Attention Mapping System
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{sessionData.user.email}</div>
            <div style={{ fontSize: '11px', color: '#DBEAFE' }}>Role: {sessionData.user.role}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <LogOut style={{ width: '14px', height: '14px' }} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div style={{ padding: '24px' }}>
        {activeView === 'stores' && (
          <div>
            <h1 style={{ fontSize: '24px', color: '#1E3A8A', marginBottom: '24px', fontFamily: 'Fira Code, monospace' }}>
              Stores Directory
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Store List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                  <p>Loading stores...</p>
                ) : stores.length > 0 ? (
                  stores.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #DBEAFE',
                        borderRadius: '12px',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div>
                        <h3 style={{ margin: '0 0 6px 0', color: '#1E3A8A', fontSize: '18px', fontWeight: 'bold' }}>
                          {s.name}
                        </h3>
                        <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>
                          Location: {s.location} | Grid: {s.width}m x {s.height}m
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => openCameras(s)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            color: '#1E40AF',
                            border: '1px solid #DBEAFE',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}
                        >
                          <Video style={{ width: '16px', height: '16px' }} />
                          Live Feeds
                        </button>

                        <button
                          onClick={() => openEditor(s)}
                          style={{
                            backgroundColor: '#1E40AF',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}
                        >
                          <Grid style={{ width: '16px', height: '16px' }} />
                          Edit Layout
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px dashed #DBEAFE', borderRadius: '12px' }}>
                    <p style={{ color: '#64748B', margin: 0 }}>No stores registered yet.</p>
                  </div>
                )}
              </div>

              {/* Register Store Panel (Admins Only) */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #DBEAFE',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                alignSelf: 'start'
              }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1E3A8A', fontSize: '18px', fontWeight: 'bold', fontFamily: 'Fira Code, monospace' }}>
                  Register Store Location
                </h3>

                {sessionData.user.role === 'Admin' ? (
                  <form onSubmit={handleRegisterStore}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>Store Name</label>
                      <input
                        required
                        value={newStore.name}
                        onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                        placeholder="Downtown MegaMart"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #DBEAFE', borderRadius: '6px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>Location/Address</label>
                      <input
                        required
                        value={newStore.location}
                        onChange={(e) => setNewStore({ ...newStore, location: e.target.value })}
                        placeholder="Floor 1, Block B"
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #DBEAFE', borderRadius: '6px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>Width (meters)</label>
                        <input
                          type="number"
                          required
                          value={newStore.width}
                          onChange={(e) => setNewStore({ ...newStore, width: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #DBEAFE', borderRadius: '6px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>Height (meters)</label>
                        <input
                          type="number"
                          required
                          value={newStore.height}
                          onChange={(e) => setNewStore({ ...newStore, height: parseFloat(e.target.value) || 0 })}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #DBEAFE', borderRadius: '6px' }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        backgroundColor: '#D97706',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus style={{ width: '16px', height: '16px' }} />
                      Register Store
                    </button>
                  </form>
                ) : (
                  <p style={{ color: '#DC2626', fontSize: '13px', margin: 0 }}>
                    Only Administrators can register new store locations.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'editor' && (
          <Canvas
            store={selectedStore}
            token={sessionData.token}
            onBack={() => setActiveView('stores')}
          />
        )}

        {activeView === 'cameras' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <button
                  onClick={() => setActiveView('stores')}
                  style={{ background: 'none', border: 'none', color: '#1E40AF', cursor: 'pointer', fontWeight: '600', marginRight: '16px' }}
                >
                  &larr; Back to Stores
                </button>
                <h1 style={{ display: 'inline-block', fontSize: '24px', color: '#1E3A8A', margin: 0, fontFamily: 'Fira Code, monospace' }}>
                  Live Video Dashboard: {selectedStore.name}
                </h1>
              </div>
            </div>

            {activeStoreCameras.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                {activeStoreCameras.map((cam) => (
                  <CameraPlayer
                    key={cam.id}
                    camera={cam}
                    token={sessionData.token}
                  />
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px dashed #DBEAFE', borderRadius: '12px' }}>
                <p style={{ color: '#64748B', margin: 0 }}>No cameras registered for this store. Place cameras using the Edit Layout editor first.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
