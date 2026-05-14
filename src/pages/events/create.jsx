import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { Card, Btn, Input, Select, Toast } from '../../components/ui'
import { getSupabase } from '../../lib/supabase'
import { DISCIPLINES, COUNTRIES } from '../../lib/constants'
import { sendEventCreatedEmail } from '../../lib/emails'
import { CheckCircle, Upload } from 'lucide-react'

export default function CreateEvent({ user, authLoading }) {
  const router = useRouter()
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const L = lang === 'es'

  const [form, setForm] = useState({
    name: '', location: '', country: 'ARG', event_date: '', event_date_end: '',
    organizer: '', description: '', website: '',
    disciplines: ['ocr100'], track_type: '',
    cover_url: '', logo_url: '',
    plan: 'free', promo_code: '',
  })

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000) }
  const togDisc = (d) => setForm(p => ({ ...p, disciplines: p.disciplines.includes(d) ? p.disciplines.filter(x => x !== d) : [...p.disciplines, d] }))

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth?next=/events/create')
  }, [user, authLoading])

  const estimatedCost = form.plan === 'organizer' ? `$39 + (atletas × $0.50)` : '$0'

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.track_type) {
      showToast(L ? 'Completá todos los campos obligatorios' : 'Fill in all required fields', 'error')
      return
    }
    setLoading(true)
    const supabase = getSupabase()
    const { data, error } = await supabase.from('events').insert({
      name: form.name, location: form.location, country: form.country,
      event_date: form.event_date || null, event_date_end: form.event_date_end || null,
      organizer: form.organizer, description: form.description,
      disciplines: form.disciplines, track_type: form.track_type,
      is_published: false, billing_status: form.plan === 'free' ? 'free' : 'pending',
      created_by: user.id,
    }).select().single()
    setLoading(false)
    if (error) { showToast(error.message, 'error'); return }
    try { await sendEventCreatedEmail(user.email, data) } catch (e) { console.error(e) }
    showToast(L ? '¡Evento creado! Redirigiendo al dashboard…' : 'Event created! Redirecting to dashboard…')
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  const steps = [
    L ? 'Información básica' : 'Basic info',
    L ? 'Fechas y modalidades' : 'Dates & disciplines',
    L ? 'Pista y media' : 'Track & media',
    L ? 'Plan' : 'Plan',
  ]

  if (authLoading) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          {L ? 'Crear evento' : 'Create event'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 24px' }}>
          {L ? 'Completá la información de tu carrera OCR.' : 'Fill in your OCR race information.'}
        </p>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ width: '100%', height: 3, background: i < step ? 'var(--blue)' : 'var(--border)', borderRadius: 2, transition: 'background 0.3s' }} />
              <div style={{ fontSize: 10, color: i < step ? 'var(--blue)' : 'var(--text-muted)', fontWeight: i + 1 === step ? 700 : 400, textAlign: 'center' }}>
                {i + 1}. {s}
              </div>
            </div>
          ))}
        </div>

        <Card>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label={L ? 'Nombre del evento *' : 'Event name *'} value={form.name} onChange={v => sf('name', v)} placeholder={L ? 'Copa Argentina OCR 2025' : 'Argentina OCR Cup 2025'} required />
              <Input label={L ? 'Organizador / Club' : 'Organizer / Club'} value={form.organizer} onChange={v => sf('organizer', v)} />
              <Input label="Email de contacto" value={user?.email || ''} onChange={() => {}} hint={L ? 'Se usa el email de tu cuenta' : 'Your account email is used'} />
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{L ? 'Descripción' : 'Description'}</label>
                <textarea value={form.description} onChange={e => sf('description', e.target.value)} rows={3} maxLength={500}
                  placeholder={L ? 'Describí el evento, el circuito, la ubicación…' : 'Describe the event, circuit, location…'}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', resize: 'vertical', background: 'var(--gray-alt)', color: 'var(--text)', boxSizing: 'border-box' }} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{form.description.length}/500</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label={L ? 'Ubicación' : 'Location'} value={form.location} onChange={v => sf('location', v)} placeholder="Buenos Aires" />
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{L ? 'País' : 'Country'}</label>
                  <select value={form.country} onChange={e => sf('country', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', background: 'var(--gray-alt)', color: 'var(--text)' }}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label={L ? 'Fecha de inicio' : 'Start date'} value={form.event_date} onChange={v => sf('event_date', v)} type="date" />
                <Input label={L ? 'Fecha de fin' : 'End date'} value={form.event_date_end} onChange={v => sf('event_date_end', v)} type="date" hint={L ? 'Para eventos multi-día' : 'For multi-day events'} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>{L ? 'Modalidades *' : 'Disciplines *'}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {DISCIPLINES.map(d => (
                    <button key={d.id} onClick={() => togDisc(d.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: `1.5px solid ${form.disciplines.includes(d.id) ? d.color : 'var(--border)'}`, borderRadius: 8, background: form.disciplines.includes(d.id) ? d.color + '08' : '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)', transition: 'all 0.15s' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 7, background: d.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{d.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: form.disciplines.includes(d.id) ? d.color : 'var(--text)', fontSize: 13 }}>{d.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{L ? d.descriptionEs : d.description}</div>
                      </div>
                      {form.disciplines.includes(d.id) && <CheckCircle size={16} color={d.color} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
                  {L ? 'Tipo de pista *' : 'Track type *'}
                  <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['official', L ? 'Pista oficial' : 'Official track', '100% pts ranking', 'var(--green)'], ['adapted', L ? 'Pista adaptada' : 'Adapted track', '70% pts ranking', 'var(--blue)']].map(([v, l, sub, color]) => (
                    <button key={v} onClick={() => sf('track_type', v)}
                      style={{ padding: '14px', border: `2px solid ${form.track_type === v ? color : 'var(--border)'}`, borderRadius: 9, background: form.track_type === v ? color + '10' : '#fff', cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font)', transition: 'all 0.15s' }}>
                      {form.track_type === v && <CheckCircle size={18} color={color} style={{ display: 'block', margin: '0 auto 6px' }} />}
                      <div style={{ fontWeight: 700, color: form.track_type === v ? color : 'var(--text)', fontSize: 14 }}>{l}</div>
                      <div style={{ fontSize: 11, color: form.track_type === v ? color : 'var(--text-muted)', marginTop: 3 }}>{sub}</div>
                    </button>
                  ))}
                </div>
                {!form.track_type && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>{L ? 'Seleccioná un tipo de pista para continuar' : 'Select a track type to continue'}</div>}
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
                  {L ? 'Portada del evento' : 'Event cover'}
                </label>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '24px', textAlign: 'center', background: 'var(--gray-alt)' }}>
                  <Upload size={24} color="var(--text-muted)" style={{ display: 'block', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 4 }}>{L ? 'Arrastrá o seleccioná una imagen' : 'Drag or select an image'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{L ? 'JPG/PNG · máx 2MB · Recomendado: 1200×630px' : 'JPG/PNG · max 2MB · Recommended: 1200×630px'}</div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
                  {L ? 'Plan de facturación' : 'Billing plan'}
                </label>
                {[['free', L ? 'Gratis' : 'Free', L ? 'Hasta 30 atletas' : 'Up to 30 athletes', '$0'], ['organizer', L ? 'Organizador' : 'Organizer', L ? 'Atletas ilimitados' : 'Unlimited athletes', '$39 + $0.50/atleta']].map(([v, l, sub, price]) => (
                  <button key={v} onClick={() => sf('plan', v)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 14px', border: `1.5px solid ${form.plan === v ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 8, background: form.plan === v ? 'var(--blue-bg)' : '#fff', cursor: 'pointer', fontFamily: 'var(--font)', marginBottom: 8 }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, color: form.plan === v ? 'var(--blue)' : 'var(--text)', fontSize: 13 }}>{l}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: form.plan === v ? 'var(--blue)' : 'var(--text-muted)', fontSize: 14 }}>{price}</div>
                  </button>
                ))}
              </div>
              <div>
                <Input label={L ? 'Código promo (opcional)' : 'Promo code (optional)'} value={form.promo_code} onChange={v => sf('promo_code', v.toUpperCase())} placeholder="LAUNCH2025" hint={L ? 'Aplicá un descuento si tenés un código' : 'Apply a discount if you have a code'} />
              </div>
              {/* Summary */}
              <div style={{ background: 'var(--gray-alt)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{L ? 'Resumen' : 'Summary'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-sec)', lineHeight: 1.8 }}>
                  <div>📍 {form.name || (L ? 'Sin nombre' : 'No name')}</div>
                  <div>🏃 {form.disciplines.length} {L ? 'modalidades' : 'disciplines'}</div>
                  <div>🏟 {form.track_type === 'official' ? (L ? 'Pista oficial (100% pts)' : 'Official track (100% pts)') : form.track_type === 'adapted' ? (L ? 'Pista adaptada (70% pts)' : 'Adapted track (70% pts)') : (L ? 'Sin seleccionar' : 'Not selected')}</div>
                  <div>💳 {estimatedCost}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {step > 1 ? (
              <Btn onClick={() => setStep(s => s - 1)} variant="ghost">{L ? '← Anterior' : '← Back'}</Btn>
            ) : <div />}
            {step < 4 ? (
              <Btn onClick={() => setStep(s => s + 1)}>{L ? 'Siguiente →' : 'Next →'}</Btn>
            ) : (
              <Btn onClick={handleSubmit} loading={loading} icon={<CheckCircle size={14} />}>
                {L ? 'Crear evento' : 'Create event'}
              </Btn>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
