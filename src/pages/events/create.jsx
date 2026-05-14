import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { getSupabase } from '../../lib/supabase'
import { DISCIPLINES, COUNTRIES } from '../../lib/constants'
import { CheckCircle, Upload, Image as ImageIcon } from 'lucide-react'

const iStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }
const lblStyle = { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }

export default function CreateEvent({ user, authLoading }) {
  const router = useRouter()
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [coverPreview, setCoverPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const coverRef = useRef()
  const logoRef = useRef()
  const L = lang === 'es'

  const [form, setForm] = useState({
    name: '', location: '', country: 'ARG', event_date: '', event_date_end: '',
    organizer: '', description: '', disciplines: ['ocr100'], track_type: '', plan: 'free',
  })
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const togDisc = (d) => setForm(p => ({ ...p, disciplines: p.disciplines.includes(d) ? p.disciplines.filter(x => x !== d) : [...p.disciplines, d] }))

  useEffect(() => { if (!authLoading && !user) router.push('/auth') }, [user, authLoading])
  useEffect(() => { if (user?.user_metadata?.full_name) sf('organizer', user.user_metadata.full_name) }, [user])

  const handleFileImg = (file, type) => {
    if (!file) return
    if (type === 'cover') { setCoverFile(file); const r = new FileReader(); r.onload = e => setCoverPreview(e.target.result); r.readAsDataURL(file) }
    else { setLogoFile(file); const r = new FileReader(); r.onload = e => setLogoPreview(e.target.result); r.readAsDataURL(file) }
  }

  const uploadImg = async (file, path) => {
    const ext = file.name.split('.').pop()
    const fullPath = `events/${path}.${ext}`
    const { error } = await getSupabase().storage.from('event-media').upload(fullPath, file, { upsert: true })
    if (error) return null
    return getSupabase().storage.from('event-media').getPublicUrl(fullPath).data.publicUrl
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError(L ? 'El nombre del evento es obligatorio' : 'Event name is required'); return }
    if (!form.track_type) { setError(L ? 'Seleccioná un tipo de pista' : 'Select a track type'); return }
    if (form.disciplines.length === 0) { setError(L ? 'Seleccioná al menos una modalidad' : 'Select at least one discipline'); return }
    setLoading(true); setError('')

    const supabase = getSupabase()
    let cover_url = null, logo_url = null
    if (coverFile) cover_url = await uploadImg(coverFile, `cover_${Date.now()}`)
    if (logoFile) logo_url = await uploadImg(logoFile, `logo_${Date.now()}`)

    const { data, error: dbErr } = await supabase.from('events').insert({
      name: form.name, location: form.location, country: form.country,
      event_date: form.event_date || null, event_date_end: form.event_date_end || null,
      organizer: form.organizer, description: form.description,
      disciplines: form.disciplines, track_type: form.track_type,
      cover_url, logo_url, is_published: false,
      billing_status: form.plan === 'free' ? 'free' : 'pending',
      created_by: user.id,
    }).select().single()

    setLoading(false)
    if (dbErr) { setError(dbErr.message); return }

    try {
      await fetch('/api/send-event-created', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, event: data }) })
    } catch(e) {}

    router.push('/dashboard')
  }

  const steps = [L ? 'Información básica' : 'Basic info', L ? 'Fechas y modalidades' : 'Dates & disciplines', L ? 'Pista y media' : 'Track & media', L ? 'Plan' : 'Plan']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '36px 24px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{L ? 'Crear evento' : 'Create event'}</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 28px' }}>{L ? 'Completá la información de tu carrera OCR.' : 'Fill in your OCR race information.'}</p>

        {/* Step bar */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', height: 3, background: i < step ? 'var(--blue)' : i === step - 1 ? 'var(--cyan)' : 'var(--border)', borderRadius: 2, transition: 'background 0.3s' }} />
              <div style={{ fontSize: 10, color: i + 1 === step ? 'var(--cyan)' : i < step ? 'var(--blue)' : 'var(--text-muted)', fontWeight: i + 1 === step ? 700 : 400, textAlign: 'center' }}>{i + 1}. {s}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px', boxShadow: 'var(--glow-card)' }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={lblStyle}>{L ? 'Nombre del evento *' : 'Event name *'}</label><input value={form.name} onChange={e => sf('name', e.target.value)} placeholder={L ? 'Copa Argentina OCR 2025' : 'OCR Cup 2025'} style={iStyle} /></div>
              <div><label style={lblStyle}>{L ? 'Organizador / Club' : 'Organizer / Club'}</label><input value={form.organizer} onChange={e => sf('organizer', e.target.value)} style={iStyle} /></div>
              <div>
                <label style={lblStyle}>{L ? 'Descripción' : 'Description'}</label>
                <textarea value={form.description} onChange={e => sf('description', e.target.value)} rows={3} placeholder={L ? 'Describí el evento, circuito y ubicación…' : 'Describe the event, circuit and location…'} style={{ ...iStyle, resize: 'vertical', fontFamily: 'var(--font)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lblStyle}>{L ? 'Ubicación' : 'Location'}</label><input value={form.location} onChange={e => sf('location', e.target.value)} placeholder="Buenos Aires" style={iStyle} /></div>
                <div><label style={lblStyle}>{L ? 'País' : 'Country'}</label><select value={form.country} onChange={e => sf('country', e.target.value)} style={iStyle}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select></div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lblStyle}>{L ? 'Fecha de inicio' : 'Start date'}</label><input type="date" value={form.event_date} onChange={e => sf('event_date', e.target.value)} style={iStyle} /></div>
                <div><label style={lblStyle}>{L ? 'Fecha de fin' : 'End date'}</label><input type="date" value={form.event_date_end} onChange={e => sf('event_date_end', e.target.value)} style={iStyle} /><div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{L ? 'Para eventos multi-día' : 'For multi-day events'}</div></div>
              </div>
              <div>
                <label style={lblStyle}>{L ? 'Modalidades *' : 'Disciplines *'}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {DISCIPLINES.map(d => {
                    const sel = form.disciplines.includes(d.id)
                    return (
                      <button key={d.id} onClick={() => togDisc(d.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: `1.5px solid ${sel ? d.color : 'var(--border)'}`, borderRadius: 9, background: sel ? d.color + '12' : 'var(--bg-input)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', transition: 'all 0.15s' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: d.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{d.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: sel ? d.color : 'var(--text)', fontSize: 13 }}>{d.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{L ? d.descriptionEs : d.description}</div>
                        </div>
                        {sel && <CheckCircle size={16} color={d.color} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Track type */}
              <div>
                <label style={lblStyle}>{L ? 'Tipo de pista *' : 'Track type *'}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    ['official', L ? 'Pista oficial' : 'Official track', L ? '100% pts ranking · Homologada UIPM' : '100% ranking pts · UIPM approved', 'var(--green)'],
                    ['adapted', L ? 'Pista adaptada' : 'Adapted track', L ? '70% pts ranking · Circuito local' : '70% ranking pts · Local circuit', 'var(--cyan)'],
                  ].map(([v, l, sub, color]) => (
                    <button key={v} onClick={() => sf('track_type', v)}
                      style={{ padding: '16px 14px', border: `2px solid ${form.track_type === v ? color : 'var(--border)'}`, borderRadius: 10, background: form.track_type === v ? color + '12' : 'var(--bg-input)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', transition: 'all 0.15s' }}>
                      {form.track_type === v && <CheckCircle size={16} color={color} style={{ display: 'block', marginBottom: 8 }} />}
                      <div style={{ fontWeight: 700, color: form.track_type === v ? color : 'var(--text)', fontSize: 14, marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 11, color: form.track_type === v ? color : 'var(--text-muted)' }}>{sub}</div>
                    </button>
                  ))}
                </div>
                {!form.track_type && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 7, padding: '6px 10px', background: 'var(--red-bg)', borderRadius: 6, border: '1px solid rgba(255,68,68,0.2)' }}>{L ? 'Seleccioná un tipo de pista para continuar' : 'Select a track type to continue'}</div>}
              </div>

              {/* Cover image */}
              <div>
                <label style={lblStyle}>{L ? 'Portada del evento' : 'Event cover'}</label>
                <div onClick={() => coverRef.current?.click()}
                  style={{ border: `2px dashed ${coverPreview ? 'var(--cyan)' : 'var(--border)'}`, borderRadius: 10, padding: '28px', textAlign: 'center', background: 'var(--bg-input)', cursor: 'pointer', transition: 'border-color 0.2s', overflow: 'hidden', minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {coverPreview ? (
                    <img src={coverPreview} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div>
                      <Upload size={28} color="var(--text-muted)" style={{ display: 'block', margin: '0 auto 10px' }} />
                      <div style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 4 }}>{L ? 'Clic para subir portada' : 'Click to upload cover'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPG/PNG · máx 5MB · 1200×630px recomendado</div>
                    </div>
                  )}
                </div>
                <input ref={coverRef} type="file" accept="image/*" onChange={e => handleFileImg(e.target.files[0], 'cover')} style={{ display: 'none' }} />
                {coverPreview && <button onClick={() => { setCoverPreview(null); setCoverFile(null) }} style={{ fontSize: 11, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, fontFamily: 'var(--font)' }}>✕ {L ? 'Quitar imagen' : 'Remove image'}</button>}
              </div>

              {/* Logo */}
              <div>
                <label style={lblStyle}>{L ? 'Logo del evento (opcional)' : 'Event logo (optional)'}</label>
                <div onClick={() => logoRef.current?.click()}
                  style={{ border: `2px dashed ${logoPreview ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 10, padding: '18px', textAlign: 'center', background: 'var(--bg-input)', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  {logoPreview ? (
                    <img src={logoPreview} style={{ maxHeight: 80, borderRadius: 6 }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <ImageIcon size={18} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{L ? 'Subir logo del evento' : 'Upload event logo'}</span>
                    </div>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" onChange={e => handleFileImg(e.target.files[0], 'logo')} style={{ display: 'none' }} />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lblStyle}>{L ? 'Plan de facturación' : 'Billing plan'}</label>
                {[
                  ['free', L ? 'Gratis' : 'Free', L ? 'Hasta 30 atletas' : 'Up to 30 athletes', '$0'],
                  ['organizer', L ? 'Organizador' : 'Organizer', L ? 'Atletas ilimitados' : 'Unlimited athletes', '$39 + $0.50/atleta'],
                ].map(([v, l, sub, price]) => (
                  <button key={v} onClick={() => sf('plan', v)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '13px 16px', border: `1.5px solid ${form.plan === v ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 9, background: form.plan === v ? 'rgba(0,102,255,0.1)' : 'var(--bg-input)', cursor: 'pointer', fontFamily: 'var(--font)', marginBottom: 8, transition: 'all 0.15s' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: form.plan === v ? 'var(--blue)' : 'var(--text)', fontSize: 14 }}>{l}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: form.plan === v ? 'var(--cyan)' : 'var(--text-muted)', fontSize: 15, fontFamily: 'var(--font-mono)' }}>{price}</div>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Resumen</div>
                <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 2 }}>
                  <div>📍 {form.name || (L ? 'Sin nombre' : 'No name')}</div>
                  <div>🏟 {form.track_type === 'official' ? (L ? 'Pista oficial (100% pts)' : 'Official track (100% pts)') : form.track_type === 'adapted' ? (L ? 'Pista adaptada (70% pts)' : 'Adapted track (70% pts)') : (L ? 'Sin seleccionar' : 'Not selected')}</div>
                  <div>🏃 {form.disciplines.length} {L ? 'modalidades' : 'disciplines'}</div>
                </div>
              </div>
            </div>
          )}

          {error && <div style={{ marginTop: 14, fontSize: 13, color: 'var(--red)', background: 'var(--red-bg)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,68,68,0.25)' }}>{error}</div>}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            {step > 1
              ? <button onClick={() => setStep(s => s - 1)} style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--bg-input)', color: 'var(--text-sec)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>← {L ? 'Anterior' : 'Back'}</button>
              : <div />}
            {step < 4
              ? <button onClick={() => setStep(s => s + 1)} style={{ padding: '10px 22px', background: 'var(--blue)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', boxShadow: 'var(--glow-blue)' }}>{L ? 'Siguiente' : 'Next'} →</button>
              : <button onClick={handleSubmit} disabled={loading} style={{ padding: '11px 24px', background: 'var(--blue)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', boxShadow: 'var(--glow-blue)', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <CheckCircle size={15} />{loading ? (L ? 'Creando…' : 'Creating…') : (L ? 'Crear evento' : 'Create event')}
                </button>}
          </div>
        </div>
      </div>
    </div>
  )
}
