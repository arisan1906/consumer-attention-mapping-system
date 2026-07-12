import React, { useState } from 'react'
import { Play, Pause, RefreshCw, AlertTriangle, Monitor } from 'lucide-react'

export default function CameraPlayer({ camera, token }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [key, setKey] = useState(0) // Used to force image reload

  const streamUrl = isPlaying 
    ? `http://localhost:8000/api/cameras/${camera.id}/stream`
    : null

  const handleRefresh = () => {
    setKey(prev => prev + 1)
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #DBEAFE',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
      fontFamily: 'Fira Sans, sans-serif'
    }}>
      {/* Player Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #DBEAFE',
        backgroundColor: '#F8FAFC'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Monitor style={{ width: '16px', height: '16px', color: '#1E40AF' }} />
          <span style={{ fontWeight: 'bold', color: '#1E3A8A', fontSize: '14px', fontFamily: 'Fira Code, monospace' }}>
            {camera.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1E40AF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
            title={isPlaying ? 'Pause Feed' : 'Start Feed'}
          >
            {isPlaying ? <Pause style={{ width: '16px', height: '16px' }} /> : <Play style={{ width: '16px', height: '16px' }} />}
          </button>
          
          <button
            onClick={handleRefresh}
            style={{
              background: 'none',
              border: 'none',
              color: '#1E40AF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
            title="Reload Feed"
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>

      {/* Screen Frame Player */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '56.25%', // 16:9 Aspect Ratio
        backgroundColor: '#0F172A',
        overflow: 'hidden'
      }}>
        {isPlaying ? (
          <img
            key={key}
            src={streamUrl}
            alt={`${camera.name} Live Feed`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => {
              // Gracefully handle loading error
              console.error('Camera stream error');
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748B',
            fontSize: '14px'
          }}>
            <Pause style={{ width: '32px', height: '32px', marginBottom: '8px', color: '#64748B' }} />
            <span>Feed Paused</span>
          </div>
        )}
      </div>

      {/* Footer Info bar */}
      <div style={{ padding: '8px 16px', backgroundColor: '#F8FAFC', borderTop: '1px solid #DBEAFE', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
        <span style={{ fontFamily: 'Fira Code, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
          {camera.stream_url}
        </span>
        <span style={{
          color: camera.status === 'Online' ? '#15803D' : '#D97706',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          ● {camera.status}
        </span>
      </div>
    </div>
  )
}
