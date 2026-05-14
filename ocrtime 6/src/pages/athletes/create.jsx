import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { getSupabase } from '../../lib/supabase'
import { COUNTRIES, AGE_GROUPS, getFlag } from '../../lib/constants'
import { Camera, CheckCircle } from 'lucide-react'

const iStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }

export default function CreateAthlete({ user, authLoading }) {
  const router = useRouter()
  const [lang, setLang] = useState('es')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const photoRef = useRef()
  const L = lang === 'es'

  const [form, setForm] = useState({
    full_name: '', country: 'ARG', gender: 'female',
    date_of_birth: '', category: 'agegroup', age_group: 'senior_2529',
    whatsapp: '', instagram: '',
  })
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth'); return }
    if (user?.user_metadata?.full_name) sf('full_name', user.user_metadata.full_name)
    if (!user) return
    // Redirect if profile already exists
    getSupabase().from('athletes').select('id').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data?.id) router.push('/profile')
    })
  }, [user, authLoading])

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    const r = new FileReader()
    r.onload = ev => setPhotoPreview(ev.target.result)
    r.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!form.full_name.trim()) { setError(L ? 'Ingresá tu nombre' : 'Enter your name'); return }
    setLoading(true); setError('')
    const supabase = getSupabase()

    // Get bib number
    const { count } = await supabase.from('athletes').select('*', { count: 'exact', head: true })
    const bib = String((count || 0) + 1).padStart(4, '0')

    // Upload photo
    let photo_url = null
    if (photoFile) {
      try {
        const ext = photoFile.name.split('.').pop()
        const path = `athletes/${user.id}_${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, photoFile, { upsert: true })
        if (!upErr) photo_url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
      } catch (e) {}
    }

    // Build insert — only include age_group for non-elite
    const insertData = {
      user_id: user.id,
      email: user.email,
      full_name: form.full_name,
      country: form.country,
      gender: form.gender,
      category: form.category,
      whatsapp: form.whatsapp || null,
      instagram: form.instagram ? (form.instagram.startsWith('@') ? form.instagram : '@' + form.instagram) : null,
      bib,
    }
    if (form.date_of_birth) insertData.date_of_birth = form.date_of_birth
    if (form.category !== 'elite') insertData.age_group = form.age_group
    if (photo_url) insertData.photo_url = photo_url

    const { error: dbErr } = await supabase.from('athletes').insert(insertData)
    setLoading(false)

    if (dbErr) {
      // If schema cache issue with age_group, retry without it
      if (dbErr.message?.includes('age_group') || dbErr.message?.includes('schema cache')) {
        const { full_name, country, gender, category, whatsapp, instagram } = form
        const { error: e2 } = await supabase.from('athletes').insert({
          user_id: user.id, email: user.email, full_name, country, gender, category, bib,
          whatsapp: whatsapp || null,
          instagram: instagram ? (instagram.startsWith('@') ? instagram : '@' + instagram) : null,
        })
        if (e2) { setError(e2.message); return }
        router.push('/profile'); return
      }
      setError(dbErr.message); return
    }

    try {
      await fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, full_name: form.full_name, bib, country: form.country, category: form.category })
      })
    } catch (e) {}

    router.push('/profile')
  }

  if (authLoading) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>🏃</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {L ? 'Crear perfil de atleta' : 'Create athlete profile'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {L ? 'Solo toma 2 minutos. Tu dorsal es permanente.' : 'Only takes 2 minutes. Your bib is permanent.'}
          </p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px', boxShadow: 'var(--glow-card)' }}>
          {/* Photo */}
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <label style={{ cursor: 'pointer', display: 'inline-block', position: 'relative' }}>
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(0,212,255,0.08)', border: '2px dashed rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto 8px' }}>
                {photoPreview ? <img src={photoPreview} style={{ width: 84, height: 84, objectFit: 'cover' }} /> : <Camera size={26} color="var(--text-muted)" />}
              </div>
              <div style={{ fontSize: 12, color: 'var(--cyan)' }}>{L ? 'Subir foto (opcional)' : 'Upload photo (optional)'}</div>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} ref={photoRef} />
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name */}
            <div><label style={{ ...iStyle, padding: 0, background: 'none', border: 'none', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6, boxSizing: 'border-box' }}>{L ? 'Nombre completo *' : 'Full name *'}</label>
              <input value={form.full_name} onChange={e => sf('full_name', e.target.value)} placeholder={L ? 'Tu nombre completo' : 'Your full name'} style={iStyle} /></div>

            {/* Country + Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{L ? 'País' : 'Country'}</label>
                <select value={form.country} onChange={e => sf('country', e.target.value)} style={iStyle}>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{L ? 'Género' : 'Gender'}</label>
                <select value={form.gender} onChange={e => sf('gender', e.target.value)} style={iStyle}>
                  <option value="female">{L ? 'Femenino' : 'Female'}</option>
                  <option value="male">{L ? 'Masculino' : 'Male'}</option>
                </select>
              </div>
            </div>

            {/* DOB */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{L ? 'Fecha de nacimiento' : 'Date of birth'}</label>
              <input type="date" value={form.date_of_birth} onChange={e => sf('date_of_birth', e.target.value)} style={iStyle} />
            </div>

            {/* Category */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>{L ? 'Categoría *' : 'Category *'}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[['elite','Elite'],['agegroup','Age Group'],['open','Open'],['adaptive','Adaptive']].map(([v,l]) => (
                  <button key={v} onClick={() => sf('category', v)}
                    style={{ padding: '8px 4px', border: `1.5px solid ${form.category===v?'var(--cyan)':'var(--border)'}`, borderRadius: 7, background: form.category===v?'rgba(0,212,255,0.1)':'var(--bg-input)', color: form.category===v?'var(--cyan)':'var(--text-muted)', fontWeight: form.category===v?700:400, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font)' }}>{l}</button>
                ))}
              </div>
              {form.category === 'elite' && (
                <div style={{ fontSize: 11, color: 'rgba(255,184,0,0.9)', marginTop: 7, padding: '6px 10px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 6 }}>
                  ⚡ {L ? 'Elite compite en categoría abierta sin grupo etario' : 'Elite competes in open category without age group'}
                </div>
              )}
            </div>

            {/* Age Group — only non-elite */}
            {form.category !== 'elite' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{L ? 'Grupo etario' : 'Age group'}</label>
                <select value={form.age_group} onChange={e => sf('age_group', e.target.value)} style={iStyle}>
                  {AGE_GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </div>
            )}

            {/* Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>WhatsApp</label>
                <input value={form.whatsapp} onChange={e => sf('whatsapp', e.target.value)} placeholder="+54911..." style={iStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Instagram</label>
                <input value={form.instagram} onChange={e => sf('instagram', e.target.value)} placeholder="@usuario" style={iStyle} />
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-bg)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,68,68,0.25)' }}>{error}</div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? 'var(--border)' : 'var(--blue)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', boxShadow: loading ? 'none' : 'var(--glow-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CheckCircle size={16} />
              {loading ? (L ? 'Creando perfil…' : 'Creating profile…') : (L ? 'Crear mi perfil de atleta' : 'Create my athlete profile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
