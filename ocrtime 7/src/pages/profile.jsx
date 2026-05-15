import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { getSupabase } from '../lib/supabase'
import { DISCIPLINES, AGE_GROUPS, COUNTRIES, getFlag } from '../lib/constants'
import { Edit, Save, Camera, X, Instagram, Phone, Mail, Trophy } from 'lucide-react'

const iStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }

export default function ProfilePage({ user, authLoading }) {
  const router = useRouter()
  const [lang, setLang] = useState('es')
  const [athlete, setAthlete] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const photoRef = useRef()
  const L = lang === 'es'

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth'); return }
    if (user) loadProfile()
  }, [user, authLoading])

  const loadProfile = async () => {
    setLoading(true)
    const { data: ath } = await getSupabase().from('athletes').select('*').eq('user_id', user.id).maybeSingle()
    if (!ath) { router.push('/athletes/create'); return }
    setAthlete(ath)
    setForm({
      full_name: ath.full_name || '',
      country: ath.country || 'ARG',
      gender: ath.gender || 'female',
      date_of_birth: ath.date_of_birth || '',
      whatsapp: ath.whatsapp || '',
      instagram: ath.instagram || '',
      category: ath.category || 'agegroup',
      age_group: ath.age_group || 'senior_2529',
    })
    const { data: regs } = await getSupabase().from('registrations').select('*, events(name, event_date, location)').eq('athlete_id', ath.id)
    setRegistrations(regs || [])
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true); setError(''); setSuccess('')
    const updateData = {
      full_name: form.full_name,
      country: form.country,
      gender: form.gender,
      whatsapp: form.whatsapp || null,
      instagram: form.instagram ? (form.instagram.startsWith('@') ? form.instagram : '@' + form.instagram) : null,
      category: form.category,
    }
    if (form.date_of_birth) updateData.date_of_birth = form.date_of_birth
    if (form.category !== 'elite') updateData.age_group = form.age_group

    const { error } = await getSupabase().from('athletes').update(updateData).eq('id', athlete.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    setAthlete(p => ({ ...p, ...updateData }))
    setEditing(false)
    setSuccess(L ? 'Perfil actualizado ✓' : 'Profile updated ✓')
    setTimeout(() => setSuccess(''), 4000)
  }

  const handlePhotoUpload = async (file) => {
    if (!file || !athlete) return
    const ext = file.name.split('.').pop()
    const path = `athletes/${athlete.id}_${Date.now()}.${ext}`
    const { error: upErr } = await getSupabase().storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { setError(upErr.message); return }
    const { data } = getSupabase().storage.from('avatars').getPublicUrl(path)
    await getSupabase().from('athletes').update({ photo_url: data.publicUrl }).eq('id', athlete.id)
    setAthlete(p => ({ ...p, photo_url: data.publicUrl }))
    setSuccess(L ? 'Foto actualizada ✓' : 'Photo updated ✓')
    setTimeout(() => setSuccess(''), 3000)
  }

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const age = athlete?.date_of_birth ? Math.floor((Date.now() - new Date(athlete.date_of_birth)) / (365.25*24*3600*1000)) : null

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>Cargando…</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} />

      {success && (
        <div style={{ position: 'fixed', top: 66, right: 16, zIndex: 9999, background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(0,200,150,0.3)', padding: '11px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)' }}>
          {success}
        </div>
      )}

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
        {/* Profile header */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', marginBottom: 18, boxShadow: 'var(--glow-card)' }}>
          <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(0,102,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, color: 'var(--blue)', overflow: 'hidden', border: '2px solid var(--border)' }}>
                {athlete?.photo_url ? <img src={athlete.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : athlete?.full_name?.[0]}
              </div>
              <button onClick={() => photoRef.current?.click()}
                style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--blue)', border: '2px solid var(--bg-card)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-blue)' }}>
                <Camera size={12} />
              </button>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoUpload(e.target.files[0])} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>{athlete?.full_name}</h1>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--cyan)', background: 'rgba(0,212,255,0.1)', padding: '2px 10px', borderRadius: 10, border: '1px solid rgba(0,212,255,0.2)', fontFamily: 'var(--font-mono)' }}>#{athlete?.bib}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', color: 'var(--cyan)', borderRadius: 10, fontWeight: 800, border: '1px solid rgba(0,212,255,0.3)', letterSpacing: '0.06em' }}>{(athlete?.category || 'agegroup').toUpperCase()}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{getFlag(athlete?.country)} {athlete?.country}</span>
                    {age && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{age} {L?'años':'years'}</span>}
                  </div>
                </div>
                <button onClick={() => { setEditing(!editing); setError('') }}
                  style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 8, background: editing ? 'var(--red-bg)' : 'var(--bg-input)', color: editing ? 'var(--red)' : 'var(--text-sec)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  {editing ? <><X size={13}/>{L?'Cancelar':'Cancel'}</> : <><Edit size={13}/>{L?'Editar':'Edit'}</>}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                {athlete?.email && <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12}/>{athlete.email}</span>}
                {athlete?.whatsapp && <a href={`https://wa.me/${athlete.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}><Phone size={12}/>{athlete.whatsapp}</a>}
                {athlete?.instagram && <a href={`https://instagram.com/${athlete.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ color: '#C13584', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}><Instagram size={12}/>{athlete.instagram}</a>}
              </div>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[['full_name', L?'Nombre completo':'Full name'], ['whatsapp','WhatsApp'], ['instagram','Instagram'], ['date_of_birth', L?'Nacimiento':'DOB']].map(([k, label]) => (
                  <div key={k}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>{label}</label>
                    <input type={k === 'date_of_birth' ? 'date' : 'text'} value={form[k]} onChange={e => sf(k, e.target.value)} style={iStyle} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>{L?'País':'Country'}</label>
                  <select value={form.country} onChange={e => sf('country', e.target.value)} style={iStyle}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>{L?'Género':'Gender'}</label>
                  <select value={form.gender} onChange={e => sf('gender', e.target.value)} style={iStyle}><option value="female">{L?'Femenino':'Female'}</option><option value="male">{L?'Masculino':'Male'}</option></select>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 7 }}>{L?'Categoría':'Category'}</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['elite','Elite'],['agegroup','Age Group'],['open','Open'],['adaptive','Adaptive']].map(([v,l]) => (
                    <button key={v} onClick={() => sf('category', v)}
                      style={{ flex: 1, padding: '7px 4px', border: `1.5px solid ${form.category===v?'var(--cyan)':'var(--border)'}`, borderRadius: 7, background: form.category===v?'rgba(0,212,255,0.1)':'var(--bg-input)', color: form.category===v?'var(--cyan)':'var(--text-muted)', fontWeight: form.category===v?700:400, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font)' }}>{l}</button>
                  ))}
                </div>
                {form.category !== 'elite' && (
                  <select value={form.age_group} onChange={e => sf('age_group', e.target.value)} style={{ ...iStyle, marginTop: 8 }}>
                    {AGE_GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                )}
              </div>

              {error && <div style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red-bg)', padding: '8px 12px', borderRadius: 7, marginBottom: 12 }}>{error}</div>}
              <button onClick={saveProfile} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: 'var(--blue)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 13, cursor: saving?'not-allowed':'pointer', fontFamily: 'var(--font)', boxShadow: 'var(--glow-blue)' }}>
                <Save size={14}/>{saving ? (L?'Guardando…':'Saving…') : (L?'Guardar cambios':'Save changes')}
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
          {[[registrations.length, L?'Carreras':'Races', '🏃'], [new Set(registrations.map(r=>r.events?.name)).size, L?'Eventos':'Events', '📍'], ['—', L?'Pts ranking':'Ranking pts', '🏆']].map(([n,l,icon]) => (
            <div key={l} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px', textAlign: 'center', boxShadow: 'var(--glow-card)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>{icon} {l}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--blue)', letterSpacing: '-0.02em' }}>{n}</div>
            </div>
          ))}
        </div>

        {/* Races */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', boxShadow: 'var(--glow-card)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 16 }}>{L?'Mis carreras':'My races'}</div>
          {registrations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏅</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{L?'Todavía no te inscribiste en ningún evento.':'You haven\'t registered for any event yet.'}</div>
              <Link href="/events" style={{ display: 'inline-block', marginTop: 14, color: 'var(--cyan)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>{L?'Ver eventos disponibles →':'See available events →'}</Link>
            </div>
          ) : registrations.map((r, i) => {
            const disc = DISCIPLINES.find(d => d.id === r.discipline)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: disc?.color + '15' || 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{disc?.icon || '🏃'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{r.events?.name || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 10 }}>
                    {disc && <span style={{ color: disc.color, fontWeight: 600 }}>{disc.label}</span>}
                    {r.events?.event_date && <span>{new Date(r.events.event_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-mono)' }}>—</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
