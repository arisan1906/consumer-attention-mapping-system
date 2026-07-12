import React, { useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { LogIn, UserPlus, Shield } from 'lucide-react'

export default function AuthScreen({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Store Manager')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        
        // Fetch profile
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        
        if (pError) throw pError
        onAuthSuccess({ token: data.session.access_token, user: { ...data.user, role: profile.role } })
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error

        if (!data.user) {
          throw new Error('Verification email sent or sign up failed.')
        }

        // Create profile row (this will be confirmed automatically by db trigger)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            role: role
          })
        
        if (profileError) throw profileError

        // Log user in automatically
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (loginError) throw loginError

        onAuthSuccess({ token: loginData.session.access_token, user: { ...loginData.user, role } })
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
      if (error) throw error
    } catch (err) {
      setErrorMsg(err.message || 'Google OAuth failed')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC',
      fontFamily: 'Fira Sans, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #DBEAFE'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Shield style={{ width: '48px', height: '48px', color: '#1E40AF', margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E3A8A', margin: 0, fontFamily: 'Fira Code, monospace' }}>
            Consumer Attention Mapping
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '8px' }}>
            {isLogin ? 'Sign in to access your retail dashboard' : 'Create an account to manage layouts'}
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '16px',
            border: '1px solid #FEE2E2'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1E3A8A', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@store.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #DBEAFE',
                borderRadius: '8px',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1E3A8A', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #DBEAFE',
                borderRadius: '8px',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '15px'
              }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1E3A8A', marginBottom: '6px' }}>
                Your Dashboard Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #DBEAFE',
                  borderRadius: '8px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'inherit',
                  fontSize: '15px'
                }}
              >
                <option value="Store Manager">Store Manager</option>
                <option value="Retail Analyst">Retail Analyst</option>
                <option value="Marketing Manager">Marketing Manager</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'inherit',
              fontSize: '15px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {isLogin ? <LogIn style={{ width: '18px', height: '18px' }} /> : <UserPlus style={{ width: '18px', height: '18px' }} />}
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <hr style={{ flex: 1, border: '0.5px solid #DBEAFE' }} />
          <span style={{ padding: '0 10px', fontSize: '12px', color: '#64748B' }}>OR</span>
          <hr style={{ flex: 1, border: '0.5px solid #DBEAFE' }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            color: '#1E3A8A',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #DBEAFE',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'inherit',
            fontSize: '15px'
          }}
        >
          <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6a5.64 5.64 0 0 1-2.44 3.7v3.08h3.94c2.31-2.13 3.64-5.26 3.64-8.61z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.94-3.08c-1.1.74-2.5 1.18-4.02 1.18-3.09 0-5.7-2.09-6.64-4.89H1.27v3.2A11.98 11.98 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.36 14.3a7.16 7.16 0 0 1 0-4.6v-3.2H1.27a11.96 11.96 0 0 0 0 11v-3.2z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.97 1.19 15.24 0 12 0 7.33 0 3.28 2.68 1.27 6.6l4.09 3.2c.94-2.8 3.55-4.89 6.64-4.89z"
            />
          </svg>
          Continue with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          <span style={{ color: '#64748B' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#1E40AF',
              fontWeight: '600',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit'
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
