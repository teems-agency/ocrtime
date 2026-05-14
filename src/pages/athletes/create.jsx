import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { getSupabase } from '../../lib/supabase'
import { COUNTRIES, AGE_GROUPS, getFlag } from '../../lib/constants'
import { User, Camera, CheckCircle } from 'lucide-react'

export default function CreateAthlete({ user, authLoading }) {
  const router = useRouter()
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [form, setForm] = useState({
    full_name: '', country: 'ARG', gender: 'female',
    date_of_birth: '', category: 'agegroup', age_group: 'senior_2529',
    whatsapp: '', instagram: '',
  })
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const L = lang === 'es'

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth')
    if (user?.user_metadata?.full_name) sf('full_name', user.user_metadata.full_name)
  }, [user, authLoading])

  // Check if athlete profile already exists
  useEffect(() => {
    if (!user) return
    getSupabase().from('athletes').select('id').eq('user_id', user.id).single().then(({ data }) => {
      if (data) router.push('/profile')
    })
  }, [user])

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!form.full_name.trim()) { setError(L ? 'Ingresá tu nombre' : 'Enter your name'); return }
    setLoading(true); setError('')
    const supabase = getSupabase()

    // Get next bib number
    const { count } = await supabase.from('athletes').select('*', { count: 'exact', head: true })
    const bib = String((count || 0) + 1).padStart(4, '0')

    // Upload photo if selected
    let photo_url = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `athletes/${user.id}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, photoFile, { upsert: true })
      if (!upErr) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        photo_url = data.publicUrl
      }
    }

    const { error: dbErr } = await supabase.from('athletes').insert({
      user_id: user.id,
      email: user.email,
      full_name: form.full_name,
      country: form.country,
      gender: form.gender,
      date_of_birth: form.date_of_birth || null,
      category: form.category,
      age_group: form.category === 'elite' ? null : form.age_group,
      whatsapp: form.whatsapp || null,
      instagram: form.instagram || null,
      photo_url,
      bib,
    })

    setLoading(false)
    if (dbErr) { setError(dbErr.message); return }

    // Send welcome email
    try {
      await fetch('/api/send-welcome', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, full_name: form.full_name, bib, country: form.country, category: form.category }) })
    } catch(e) {}

    router.push('/profile')
  }

  if (authLoading) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <User size={26} color="var(--cyan)" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {L ? 'Completá tu perfil de atleta' : 'Complete your athlete profile'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            {L ? 'Solo toma 2 minutos. Tu dorsal es permanente.' : 'Only takes 2 minutes. Your bib is permanent.'}
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px', boxShadow: 'var(--glow-card)' }}>

          {/* Photo upload */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <label style={{ cursor: 'pointer', display: 'inline-block', position: 'relative' }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: photoPreview ? 'transparent' : 'rgba(0,212,255,0.08)', border: '2px dashed rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto 8px' }}>
                {photoPreview ? <img src={photoPreview} style={{ width: 88, height: 88, objectFit: 'cover' }} /> : <Camera size={28} color="var(--text-muted)" />}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cyan)' }}>{L ? 'Subir foto (opcional)' : 'Upload photo (optional)'}</div>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name */}
            <Field label={L ? 'Nombre completo *' : 'Full name *'}>
              <input value={form.full_name} onChange={e => sf('full_name', e.target.value)} placeholder={L ? 'Tu nombre completo' : 'Your full name'} style={iStyle} />
            </Field>

            {/* Country + Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={L ? 'País' : 'Country'}>
                <select value={form.country} onChange={e => sf('country', e.target.value)} style={iStyle}>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </Field>
              <Field label={L ? 'Género' : 'Gender'}>
                <select value={form.gender} onChange={e => sf('gender', e.target.value)} style={iStyle}>
                  <option value="female">{L ? 'Femenino' : 'Female'}</option>
                  <option value="male">{L ? 'Masculino' : 'Male'}</option>
                </select>
              </Field>
            </div>

            {/* DOB */}
            <Field label={L ? 'Fecha de nacimiento' : 'Date of birth'}>
              <input type="date" value={form.date_of_birth} onChange={e => sf('date_of_birth', e.target.value)} style={iStyle} />
            </Field>

            {/* Category */}
            <Field label={L ? 'Categoría *' : 'Category *'}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[['elite','Elite'],['agegroup','Age Group'],['open','Open'],['adaptive','Adaptive']].map(([v,l]) => (
                  <button key={v} onClick={() => sf('category', v)}
                    style={{ padding: '8px 4px', border: `1.5px solid ${form.category===v ? 'var(--cyan)' : 'var(--border)'}`, borderRadius: 7, background: form.category===v ? 'rgba(0,212,255,0.1)' : 'var(--bg-input)', color: form.category===v ? 'var(--cyan)' : 'var(--text-muted)', fontWeight: form.category===v ? 700 : 400, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s' }}>{l}</button>
                ))}
              </div>
              {form.category === 'elite' && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, padding: '7px 10px', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 6 }}>
                  ⚡ Elite: compite en categoría abierta sin grupo etario
                </div>
              )}
            </Field>

            {/* Age Group — only if not elite */}
            {form.category !== 'elite' && (
              <Field label={L ? 'Grupo etario' : 'Age group'}>
                <select value={form.age_group} onChange={e => sf('age_group', e.target.value)} style={iStyle}>
                  {AGE_GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </Field>
            )}

            {/* Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="WhatsApp">
                <input value={form.whatsapp} onChange={e => sf('whatsapp', e.target.value)} placeholder="+54911..." style={iStyle} />
              </Field>
              <Field label="Instagram">
                <input value={form.instagram} onChange={e => sf('instagram', e.target.value)} placeholder="@usuario" style={iStyle} />
              </Field>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-bg)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,68,68,0.25)' }}>{error}</div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '13px', background: 'var(--blue)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', boxShadow: 'var(--glow-blue)', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CheckCircle size={16} />
              {loading ? (L ? 'Creando perfil…' : 'Creating profile…') : (L ? 'Crear mi perfil de atleta' : 'Create my athlete profile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const iStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}
