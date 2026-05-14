import { useState } from 'react'
import { useRouter } from 'next/router'
import { Eye, EyeOff } from 'lucide-react'
import { getSupabase } from '../lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLogin = async () => {
    setError(''); setLoading(true)
    const { error } = await getSupabase().auth.signInWithPassword({ email: form.email, password: form.password })
    setLoading(false)
    if (error) { setError(error.message); return }
    const next = router.query.next || '/dashboard'
    router.push(next)
  }

  const handleSignup = async () => {
    setError('')
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 8) { setError('Mínimo 8 caracteres'); return }
    setLoading(true)
    const { error } = await getSupabase().auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.name } }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setTab('confirm')
  }

  const handleReset = async () => {
    if (!form.email) { setError('Ingresá tu email primero'); return }
    await getSupabase().auth.resetPasswordForEmail(form.email)
    setSuccess('Email de recuperación enviado ✓')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(ellipse, rgba(0,102,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ marginBottom: 36, textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 8 }}>
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="15" r="10" stroke="white" strokeWidth="2"/>
            <rect x="11" y="2" width="6" height="2.5" rx="1.2" fill="white"/>
            <line x1="14" y1="5" x2="14" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="14" y1="15" x2="18.5" y2="10.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="14" cy="15" r="1.5" fill="white"/>
          </svg>
          <span style={{ fontFamily: 'var(--font)', fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
            <span style={{ color: '#fff' }}>OCR</span>
            <span style={{ color: '#0066FF' }}>TIME</span>
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>UIPM · WORLD OBSTACLE</div>
      </div>

      {/* Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', width: '100%', maxWidth: 400, boxShadow: 'var(--glow-card)', position: 'relative' }}>

        {tab === 'confirm' ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>✉️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Verificá tu email</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Enviamos un link a <strong style={{ color: 'var(--cyan)' }}>{form.email}</strong>.<br/>Hacé clic para activar tu cuenta.
            </p>
            <button onClick={() => setTab('login')} style={{ marginTop: 20, color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)' }}>
              Volver al login →
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 9, padding: 3, marginBottom: 24, border: '1px solid var(--border)' }}>
              {[['login', 'Ingresar'], ['signup', 'Registrarse']].map(([id, label]) => (
                <button key={id} onClick={() => { setTab(id); setError(''); setSuccess('') }}
                  style={{ flex: 1, padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === id ? 700 : 500, background: tab === id ? 'rgba(0,102,255,0.25)' : 'transparent', color: tab === id ? '#fff' : 'rgba(255,255,255,0.45)', fontFamily: 'var(--font)', transition: 'all 0.15s', border: tab === id ? '1px solid rgba(0,102,255,0.4)' : '1px solid transparent' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tab === 'signup' && <Fld label="Nombre completo" value={form.name} onChange={v => sf('name', v)} />}
              <Fld label="Email" value={form.email} onChange={v => sf('email', v)} type="email" placeholder="tu@email.com" />
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => sf('password', e.target.value)}
                    placeholder={tab === 'signup' ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                    style={{ width: '100%', padding: '9px 38px 9px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              {tab === 'signup' && <Fld label="Confirmar contraseña" value={form.confirm} onChange={v => sf('confirm', v)} type="password" />}

              {error && (
                <div style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red-bg)', padding: '9px 12px', borderRadius: 7, border: '1px solid rgba(255,68,68,0.25)' }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ fontSize: 12, color: 'var(--green)', background: 'var(--green-bg)', padding: '9px 12px', borderRadius: 7, border: '1px solid rgba(0,200,150,0.25)' }}>
                  {success}
                </div>
              )}

              <button onClick={tab === 'login' ? handleLogin : handleSignup} disabled={loading}
                style={{ padding: '12px', background: 'var(--blue)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'var(--font)', marginTop: 4, boxShadow: '0 4px 16px rgba(0,102,255,0.35)', transition: 'all 0.15s' }}>
                {loading ? '…' : tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>

              {tab === 'login' && (
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  <button onClick={handleReset} style={{ color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font)' }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
            </div>

            {/* Access info */}
            {tab === 'login' && (
              <div style={{ marginTop: 20, padding: '12px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 700, color: 'var(--cyan)', marginBottom: 4 }}>Acceso por sección:</div>
                  <div>🏃 <strong>Atleta:</strong> Registrate → creás tu perfil en /athletes/create</div>
                  <div>📋 <strong>Organizador:</strong> Registrate → creás un evento</div>
                  <div>🔒 <strong>Super Admin:</strong> Solo con info@ocrtime.com</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Fld({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}
