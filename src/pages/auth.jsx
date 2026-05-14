import { useState } from 'react'
import { useRouter } from 'next/router'
import { Eye, EyeOff } from 'lucide-react'
import { getSupabase } from '../lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ email: '', password: '', name: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLogin = async () => {
    setError(''); setLoading(true)
    const { error } = await getSupabase().auth.signInWithPassword({ email: form.email, password: form.password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/dashboard')
  }

  const handleSignup = async () => {
    setError(''); 
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    setLoading(true)
    const { error } = await getSupabase().auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.name } }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setError(''); setTab('confirm')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', marginBottom: 6 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', fontFamily: 'var(--font)' }}>OCR</span>
          <span style={{ color: '#3B8FE8', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', fontFamily: 'var(--font)' }}>TIME</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.2em' }}>UIPM · WORLD OBSTACLE</div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        {tab === 'confirm' ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Verificá tu email</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>Enviamos un link de confirmación a <strong>{form.email}</strong>. Hacé clic en el link para activar tu cuenta.</p>
            <button onClick={() => setTab('login')} style={{ marginTop: 16, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
              Volver al login →
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--gray-alt)', borderRadius: 8, padding: 4, marginBottom: 22 }}>
              {[['login', 'Ingresar'], ['signup', 'Registrarse']].map(([id, label]) => (
                <button key={id} onClick={() => { setTab(id); setError('') }}
                  style={{ flex: 1, padding: '7px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === id ? 700 : 400, background: tab === id ? '#fff' : 'transparent', color: tab === id ? 'var(--text)' : 'var(--text-muted)', boxShadow: tab === id ? 'var(--shadow-sm)' : 'none', fontFamily: 'var(--font)' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tab === 'signup' && (
                <Fld label="Nombre completo" value={form.name} onChange={v => sf('name', v)} />
              )}
              <Fld label="Email" value={form.email} onChange={v => sf('email', v)} type="email" />
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => sf('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    style={{ width: '100%', padding: '8px 36px 8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              {tab === 'signup' && (
                <Fld label="Confirmar contraseña" value={form.confirm} onChange={v => sf('confirm', v)} type="password" />
              )}
              {error && <div style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red-bg)', padding: '8px 12px', borderRadius: 6 }}>{error}</div>}
              <button onClick={tab === 'login' ? handleLogin : handleSignup} disabled={loading}
                style={{ padding: '11px', background: 'var(--blue)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'var(--font)', marginTop: 4 }}>
                {loading ? '...' : tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>
            </div>

            {tab === 'login' && (
              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                ¿Olvidaste tu contraseña? <button onClick={async () => { await getSupabase().auth.resetPasswordForEmail(form.email); setError('Email de recuperación enviado') }} style={{ color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Recuperar</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Fld({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
    </div>
  )
}
