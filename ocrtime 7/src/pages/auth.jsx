import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { User, Calendar, Shield } from 'lucide-react'
import { getSupabase } from '../lib/supabase'

const lblStyle = { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('choose')
  const [form, setForm] = useState({ email: '', password: '', name: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const back = () => { setMode('choose'); setError('') }

  const login = async () => {
    setError(''); setLoading(true)
    const { error } = await getSupabase().auth.signInWithPassword({ email: form.email, password: form.password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push(router.query.next || '/dashboard')
  }

  const signup = async (role) => {
    setError('')
    if (!form.name.trim()) { setError('Ingresá tu nombre'); return }
    if (form.password.length < 8) { setError('Mínimo 8 caracteres'); return }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    const { error } = await getSupabase().auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.name, role } }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    if (role === 'athlete') router.push('/athletes/create')
    else setMode('confirm')
  }

  const reset = async () => {
    if (!form.email) { setError('Ingresá tu email primero'); return }
    await getSupabase().auth.resetPasswordForEmail(form.email)
    alert('Email de recuperación enviado a ' + form.email)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(0,102,255,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
        <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="15" r="10" stroke="white" strokeWidth="2"/>
          <rect x="11" y="2" width="6" height="2.5" rx="1.2" fill="white"/>
          <line x1="14" y1="5" x2="14" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <line x1="14" y1="15" x2="18.5" y2="10.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="14" cy="15" r="1.5" fill="white"/>
        </svg>
        <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: 'var(--font)' }}>
          <span style={{ color: '#fff' }}>OCR</span><span style={{ color: '#0066FF' }}>TIME</span>
        </span>
      </Link>

      <div style={{ width: '100%', maxWidth: mode === 'choose' ? 660 : 420, position: 'relative', zIndex: 1 }}>

        {/* CHOOSE */}
        {mode === 'choose' && (
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.03em' }}>
              ¿Cómo querés usar OCR TIME?
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 28px' }}>
              Elegí tu tipo de cuenta
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              {[
                { role: 'athlete', icon: <User size={24} color="var(--cyan)"/>, color: 'var(--cyan)', title: 'Soy atleta', desc: 'Inscribite en carreras, obtené tu dorsal permanente y seguí tu ranking mundial.', badge: 'SIEMPRE GRATIS' },
                { role: 'organizer', icon: <Calendar size={24} color="var(--blue)"/>, color: 'var(--blue)', title: 'Organizo eventos', desc: 'Creá y cronometrá carreras OCR con herramientas profesionales en minutos.', badge: 'GRATIS HASTA 30 ATLETAS' },
              ].map(({ role, icon, color, title, desc, badge }) => (
                <button key={role} onClick={() => { setMode(role + '-reg'); setError('') }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 22px', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 20px ${color}33` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 12, background: color + '15', border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 7 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 14 }}>{desc}</div>
                  <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: '0.08em' }}>{badge} →</span>
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              ¿Ya tenés cuenta?{' '}
              <button onClick={() => { setMode('login'); setError('') }} style={{ color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font)', fontSize: 13 }}>
                Ingresar →
              </button>
            </div>
          </div>
        )}

        {/* ATHLETE REG */}
        {mode === 'athlete-reg' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 16, padding: '28px 32px', boxShadow: 'var(--glow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><User size={18} color="var(--cyan)"/><h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Crear cuenta de atleta</h2></div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 18px' }}>Gratis · Dorsal permanente · Ranking mundial</p>
            <RegForm form={form} sf={sf} showPw={showPw} setShowPw={setShowPw} error={error} loading={loading} label="Crear cuenta de atleta" onSubmit={() => signup('athlete')} onBack={back} />
          </div>
        )}

        {/* ORGANIZER REG */}
        {mode === 'organizer-reg' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,102,255,0.3)', borderRadius: 16, padding: '28px 32px', boxShadow: 'var(--glow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Calendar size={18} color="var(--blue)"/><h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Crear cuenta de organizador</h2></div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 18px' }}>Gratis hasta 30 atletas · Sin tarjeta requerida</p>
            <RegForm form={form} sf={sf} showPw={showPw} setShowPw={setShowPw} error={error} loading={loading} label="Crear cuenta de organizador" onSubmit={() => signup('organizer')} onBack={back} />
          </div>
        )}

        {/* LOGIN */}
        {mode === 'login' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', boxShadow: 'var(--glow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}><Shield size={18} color="var(--text-muted)"/><h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Ingresar</h2></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <div><label style={lblStyle}>Email</label><input type="email" value={form.email} onChange={e => sf('email', e.target.value)} placeholder="tu@email.com" style={inputStyle} /></div>
              <div>
                <label style={lblStyle}>Contraseña</label>
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => sf('password', e.target.value)} placeholder="Tu contraseña" style={inputStyle} />
              </div>
            </div>
            {error && <div style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-bg)', padding: '9px 12px', borderRadius: 7, border: '1px solid rgba(255,68,68,0.25)', marginBottom: 12 }}>{error}</div>}
            <button onClick={login} disabled={loading} style={{ width: '100%', padding: 13, background: 'var(--blue)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', boxShadow: 'var(--glow-blue)' }}>
              {loading ? '…' : 'Ingresar'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
              <button onClick={back} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, textDecoration: 'underline' }}>← Volver</button>
              <button onClick={reset} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, textDecoration: 'underline' }}>Olvidé mi contraseña</button>
            </div>
          </div>
        )}

        {/* CONFIRM */}
        {mode === 'confirm' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 32px', textAlign: 'center', boxShadow: 'var(--glow-card)' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✉️</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>Verificá tu email</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 8 }}>
              Enviamos un link a <strong style={{ color: 'var(--cyan)' }}>{form.email}</strong>
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Si no lo recibís en 2 minutos, revisá spam o escribinos a info@ocrtime.com
            </p>
            <button onClick={() => setMode('login')} style={{ color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 700 }}>
              Ya verifiqué → Ingresar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function RegForm({ form, sf, showPw, setShowPw, error, loading, label, onSubmit, onBack }) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div><label style={lblStyle}>Nombre completo</label><input value={form.name} onChange={e => sf('name', e.target.value)} placeholder="Tu nombre completo" style={inputStyle} /></div>
        <div><label style={lblStyle}>Email</label><input type="email" value={form.email} onChange={e => sf('email', e.target.value)} placeholder="tu@email.com" style={inputStyle} /></div>
        <div>
          <label style={lblStyle}>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => sf('password', e.target.value)} placeholder="Mínimo 8 caracteres" style={{ ...inputStyle, paddingRight: 40 }} />
            <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>{showPw ? '🙈' : '👁'}</button>
          </div>
        </div>
        <div><label style={lblStyle}>Confirmar contraseña</label><input type="password" value={form.confirm} onChange={e => sf('confirm', e.target.value)} placeholder="Repetí tu contraseña" style={inputStyle} /></div>
      </div>
      {error && <div style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-bg)', padding: '9px 12px', borderRadius: 7, border: '1px solid rgba(255,68,68,0.25)', marginBottom: 12 }}>{error}</div>}
      <button onClick={onSubmit} disabled={loading} style={{ width: '100%', padding: 13, background: 'var(--blue)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', boxShadow: 'var(--glow-blue)', marginBottom: 10 }}>
        {loading ? '…' : label}
      </button>
      <div style={{ textAlign: 'center' }}><button onClick={onBack} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, textDecoration: 'underline' }}>← Volver</button></div>
    </>
  )
}
