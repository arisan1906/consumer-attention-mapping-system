import React, { useState, useRef, useEffect } from 'react'
import { Plus, Save, Trash2, Video, MapPin, Layers, RefreshCw } from 'lucide-react'
import { supabase } from '../../services/supabaseClient'

export default function Canvas({ store, token, onBack }) {
  const [zones, setZones] = useState([])
  const [shelves, setShelves] = useState([])
  const [cameras, setCameras] = useState([])
  
  const [mode, setMode] = useState('select') // 'select', 'add_zone', 'add_shelf', 'add_camera'
  const [selectedItem, setSelectedItem] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState('success') // 'success', 'error'
  
  // Drag drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 })
  
  const svgRef = useRef(null)
  
  // New Camera Form Dialog
  const [showCamModal, setShowCamModal] = useState(false)
  const [newCam, setNewCam] = useState({ name: '', stream_url: '', x: 0, y: 0 })

  // Scale calculations: Map physical dimensions (meters) to SVG pixels
  const svgWidth = 800
  const svgHeight = 450
  
  const scaleX = svgWidth / store.width
  const scaleY = svgHeight / store.height

  useEffect(() => {
    fetchLayout()
  }, [store.id])

  const fetchLayout = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/stores/${store.id}/layout`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load layout')
      const data = await response.json()
      
      setZones(data.zones || [])
      setShelves(data.shelves || [])
      setCameras(data.cameras || [])
    } catch (err) {
      showMsg(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMsg = (txt, type = 'success') => {
    setMessage(txt)
    setMsgType(type)
    setTimeout(() => setMessage(''), 4000)
  }

  // Translate client coordinate to store physical meter coordinates
  const getCoords = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const xPixels = ((e.clientX - rect.left) / rect.width) * svgWidth
    const yPixels = ((e.clientY - rect.top) / rect.height) * svgHeight
    
    return {
      x: xPixels / scaleX,
      y: yPixels / scaleY
    }
  }

  const handleMouseDown = (e) => {
    if (mode === 'select') return
    
    const coords = getCoords(e)
    if (mode === 'add_camera') {
      // Place camera immediately
      setNewCam({
        name: `Camera ${cameras.length + 1}`,
        stream_url: 'rtsp://192.168.1.100/h264',
        x: coords.x,
        y: coords.y
      })
      setShowCamModal(true)
      setMode('select')
      return
    }

    // Zone or Shelf drawing start
    setIsDrawing(true)
    setStartPoint(coords)
    setCurrentPoint(coords)
  }

  const handleMouseMove = (e) => {
    if (!isDrawing) return
    const coords = getCoords(e)
    setCurrentPoint(coords)
  }

  const handleMouseUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const x_min = Math.min(startPoint.x, currentPoint.x)
    const x_max = Math.max(startPoint.x, currentPoint.x)
    const y_min = Math.min(startPoint.y, currentPoint.y)
    const y_max = Math.max(startPoint.y, currentPoint.y)

    // Ensure size is meaningful
    if (x_max - x_min < 0.2 || y_max - y_min < 0.2) {
      setMode('select')
      return
    }

    if (mode === 'add_zone') {
      const name = prompt('Enter Zone Name (e.g. Produce Section):', `Zone ${zones.length + 1}`)
      if (name) {
        setZones([...zones, { name, x_min, y_min, x_max, y_max }])
      }
    } else if (mode === 'add_shelf') {
      // Find matching zone if any
      let matchedZoneName = 'Default Zone'
      for (const z of zones) {
        if (x_min >= z.x_min && x_max <= z.x_max && y_min >= z.y_min && y_max <= z.y_max) {
          matchedZoneName = z.name
          break
        }
      }

      const name = prompt('Enter Shelf Name (e.g. Apple Shelf A):', `Shelf ${shelves.length + 1}`)
      const layersStr = prompt('Enter Number of Layers:', '4')
      if (name) {
        setShelves([...shelves, {
          name,
          zone_name: matchedZoneName,
          x_min,
          y_min,
          x_max,
          y_max,
          layers: parseInt(layersStr) || 1
        }])
      }
    }

    setMode('select')
  }

  const saveLayout = async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/stores/${store.id}/layout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ zones, shelves })
      })
      if (!response.ok) throw new Error('Failed to save layout')
      showMsg('Layout saved successfully!')
      fetchLayout()
    } catch (err) {
      showMsg(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const saveCamera = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/cameras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          store_id: store.id,
          name: newCam.name,
          stream_url: newCam.stream_url,
          location_x: newCam.x,
          location_y: newCam.y
        })
      })
      if (!response.ok) throw new Error('Failed to register camera')
      showMsg('Camera registered successfully!')
      setShowCamModal(false)
      fetchLayout()
    } catch (err) {
      alert(err.message)
    }
  }

  const deleteItem = (item, type) => {
    if (type === 'zone') {
      setZones(zones.filter(z => z !== item))
    } else if (type === 'shelf') {
      setShelves(shelves.filter(s => s !== item))
    } else if (type === 'camera') {
      // Direct DB delete for camera since it is stored separate
      supabase.from('cameras').delete().eq('id', item.id).then(() => {
        setCameras(cameras.filter(c => c !== item))
        showMsg('Camera deleted')
      })
    }
    setSelectedItem(null)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Fira Sans, sans-serif', backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#1E40AF', cursor: 'pointer', fontWeight: '600', marginRight: '16px' }}>
            &larr; Back to Stores
          </button>
          <h2 style={{ display: 'inline-block', fontSize: '20px', color: '#1E3A8A', margin: 0, fontFamily: 'Fira Code, monospace' }}>
            Store Editor: {store.name} ({store.width}m x {store.height}m)
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setMode('add_zone')}
            style={{
              backgroundColor: mode === 'add_zone' ? '#1E40AF' : '#FFFFFF',
              color: mode === 'add_zone' ? '#FFFFFF' : '#1E40AF',
              border: '1px solid #DBEAFE',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600'
            }}
          >
            <MapPin style={{ width: '16px', height: '16px' }} />
            + Add Zone
          </button>

          <button
            onClick={() => setMode('add_shelf')}
            style={{
              backgroundColor: mode === 'add_shelf' ? '#1E40AF' : '#FFFFFF',
              color: mode === 'add_shelf' ? '#FFFFFF' : '#1E40AF',
              border: '1px solid #DBEAFE',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600'
            }}
          >
            <Layers style={{ width: '16px', height: '16px' }} />
            + Add Shelf
          </button>

          <button
            onClick={() => setMode('add_camera')}
            style={{
              backgroundColor: mode === 'add_camera' ? '#1E40AF' : '#FFFFFF',
              color: mode === 'add_camera' ? '#FFFFFF' : '#1E40AF',
              border: '1px solid #DBEAFE',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600'
            }}
          >
            <Video style={{ width: '16px', height: '16px' }} />
            + Place Camera
          </button>

          <button
            onClick={saveLayout}
            disabled={loading}
            style={{
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600'
            }}
          >
            <Save style={{ width: '16px', height: '16px' }} />
            Save Layout
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          backgroundColor: msgType === 'error' ? '#FEF2F2' : '#F0FDF4',
          color: msgType === 'error' ? '#DC2626' : '#15803D',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontWeight: '500',
          border: `1px solid ${msgType === 'error' ? '#FEE2E2' : '#DCFCE7'}`
        }}>
          {message}
        </div>
      )}

      {/* Editor Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
        {/* SVG Canvas Board */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #DBEAFE',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          cursor: mode !== 'select' ? 'crosshair' : 'default'
        }}>
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              border: '2px dashed #DBEAFE',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px'
            }}
          >
            {/* Draw Gridlines for Reference */}
            {Array.from({ length: Math.ceil(store.width) }).map((_, i) => (
              <line
                key={`grid-x-${i}`}
                x1={i * scaleX}
                y1={0}
                x2={i * scaleX}
                y2={svgHeight}
                stroke="#E2E8F0"
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: Math.ceil(store.height) }).map((_, i) => (
              <line
                key={`grid-y-${i}`}
                x1={0}
                y1={i * scaleY}
                x2={svgWidth}
                y2={i * scaleY}
                stroke="#E2E8F0"
                strokeWidth={0.5}
              />
            ))}

            {/* Render Zones */}
            {zones.map((z, idx) => (
              <g key={`z-group-${idx}`}>
                <rect
                  x={z.x_min * scaleX}
                  y={z.y_min * scaleY}
                  width={(z.x_max - z.x_min) * scaleX}
                  height={(z.y_max - z.y_min) * scaleY}
                  fill="#E9EEF6"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={0.4}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedItem({ data: z, type: 'zone' })}
                />
                <text
                  x={z.x_min * scaleX + 6}
                  y={z.y_min * scaleY + 16}
                  fill="#1E3A8A"
                  fontSize="12px"
                  fontWeight="bold"
                >
                  {z.name}
                </text>
              </g>
            ))}

            {/* Render Shelves */}
            {shelves.map((s, idx) => (
              <g key={`s-group-${idx}`}>
                <rect
                  x={s.x_min * scaleX}
                  y={s.y_min * scaleY}
                  width={(s.x_max - s.x_min) * scaleX}
                  height={(s.y_max - s.y_min) * scaleY}
                  fill="#1E40AF"
                  stroke="#1E3A8A"
                  strokeWidth={1}
                  fillOpacity={0.85}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedItem({ data: s, type: 'shelf' })}
                />
                <text
                  x={s.x_min * scaleX + 4}
                  y={s.y_min * scaleY + 14}
                  fill="#FFFFFF"
                  fontSize="10px"
                  fontWeight="bold"
                >
                  {s.name} ({s.layers}L)
                </text>
              </g>
            ))}

            {/* Render Camera nodes */}
            {cameras.map((c, idx) => (
              <g
                key={`c-group-${idx}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedItem({ data: c, type: 'camera' })}
              >
                <circle
                  cx={c.location_x * scaleX}
                  cy={c.location_y * scaleY}
                  r={12}
                  fill="#D97706"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
                <circle
                  cx={c.location_x * scaleX}
                  cy={c.location_y * scaleY}
                  r={4}
                  fill="#FFFFFF"
                />
                <text
                  x={c.location_x * scaleX + 15}
                  y={c.location_y * scaleY + 4}
                  fill="#1E3A8A"
                  fontSize="10px"
                  fontWeight="bold"
                >
                  {c.name}
                </text>
              </g>
            ))}

            {/* Render Active Draw Box */}
            {isDrawing && (
              <rect
                x={Math.min(startPoint.x, currentPoint.x) * scaleX}
                y={Math.min(startPoint.y, currentPoint.y) * scaleY}
                width={Math.abs(currentPoint.x - startPoint.x) * scaleX}
                height={Math.abs(currentPoint.y - startPoint.y) * scaleY}
                fill="#3B82F6"
                stroke="#1E40AF"
                strokeWidth={1}
                fillOpacity={0.2}
              />
            )}
          </svg>
        </div>

        {/* Selected element properties panel */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #DBEAFE',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '16px', color: '#1E3A8A', marginTop: 0, marginBottom: '16px', fontFamily: 'Fira Code, monospace' }}>
            Properties
          </h3>
          
          {selectedItem ? (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Type:</span>
                <div style={{ fontWeight: '600', textTransform: 'capitalize', color: '#1E3A8A' }}>{selectedItem.type}</div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Name:</span>
                <div style={{ fontWeight: '600', color: '#1E3A8A' }}>{selectedItem.data.name}</div>
              </div>

              {selectedItem.type === 'shelf' && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Layers:</span>
                  <div style={{ fontWeight: '600', color: '#1E3A8A' }}>{selectedItem.data.layers} Layers</div>
                </div>
              )}

              {selectedItem.type === 'camera' && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Stream URL:</span>
                  <div style={{ fontSize: '11px', wordBreak: 'break-all', color: '#64748B', fontFamily: 'Fira Code, monospace' }}>
                    {selectedItem.data.stream_url}
                  </div>
                </div>
              )}

              <button
                onClick={() => deleteItem(selectedItem.data, selectedItem.type)}
                style={{
                  width: '100%',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FEE2E2',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontWeight: '600',
                  marginTop: '20px'
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                Delete Element
              </button>
            </div>
          ) : (
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              Select an element on the canvas to edit or view its parameters.
            </p>
          )}
        </div>
      </div>

      {/* New Camera Modal Dialog */}
      {showCamModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
            border: '1px solid #DBEAFE'
          }}>
            <h3 style={{ fontSize: '18px', color: '#1E3A8A', marginTop: 0, marginBottom: '16px', fontFamily: 'Fira Code, monospace' }}>
              Register Camera Feed
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>Camera Name</label>
              <input
                value={newCam.name}
                onChange={(e) => setNewCam({ ...newCam, name: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #DBEAFE', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>RTSP / Live Stream URL</label>
              <input
                value={newCam.stream_url}
                onChange={(e) => setNewCam({ ...newCam, stream_url: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #DBEAFE', borderRadius: '6px', fontSize: '14px', fontFamily: 'Fira Code, monospace' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCamModal(false)}
                style={{ backgroundColor: '#F1F5F9', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#64748B' }}
              >
                Cancel
              </button>
              <button
                onClick={saveCamera}
                style={{ backgroundColor: '#D97706', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: '#FFFFFF' }}
              >
                Save Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
