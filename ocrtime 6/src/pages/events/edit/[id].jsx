import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import { getSupabase } from '../../lib/supabase'
import { DISCIPLINES, COUNTRIES } from '../../lib/constants'
import { CheckCircle, Save, Upload } from 'lucide-react'

const iStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-input)', color: '#fff', fontSize: 14, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }
const lbl = { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }

export default function EditEvent({ user, authLoading }) {
  const router = useRouter()
  const { id } = router.query
  const [lang, setLang] = useState('es')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [coverPreview, setCoverPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const coverRef = useRef()
  const L = lang === 'es'

  const [form, setForm] = useState({
    name: '', location: '', country: 'ARG', event_date: '', event_date_end: '',
    organizer: '', description: '', disciplines: [], track_type: '', is_published: false,
  })
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const togDisc = (d) => setForm(p => ({ ...p, disciplines: p.disciplines.includes(d) ? p.disciplines.filter(x => x !== d) : [...p.disciplines, d] }))

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth')
  }, [user, authLoading])

  useEffect(() => {
    if (!id || !user) return
    getSupabase().from('events').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { router.push('/dashboard'); return }
      if (data.created_by !== user.id && user.email !== 'info@ocrtime.com') { router.push('/dashboard'); return }
      setForm({
        name: data.name || '',
        location: data.location || '',
        country: data.country || 'ARG',
        event_date: data.event_date || '',
        event_date_end: data.event_date_end || '',
        organizer: data.organizer || '',
        description: data.description || '',
        disciplines: data.disciplines || [],
        track_type: data.track_type || '',
        is_published: data.is_published || false,
      })
      if (data.cover_url) setCoverPreview(data.cover_url)
      setLoading(false)
    })
  }, [id, user])

  const handleSave = async () => {
    if (!form.name.trim()) { setError(L ? 'El nombre es obligatorio' : 'Name is required'); return }
    setSaving(true); setError('')

    let cover_url = coverPreview && !coverFile ? coverPreview : null
    if (coverFile) {
      const ext = coverFile.name.split('.').pop()
      const path = `events/cover_${id}_${Date.now()}.${ext}`
      const { error: upErr } = await getSupabase().storage.from('event-media').upload(path, coverFile, { upsert: true })
      if (!upErr) cover_url = getSupabase().storage.from('event-media').getPublicUrl(path).data.publicUrl
    }

    const updateData = { ...form }
    if (cover_url) updateData.cover_url = cover_url
    if (!form.event_date) delete updateData.event_date
    if (!form.event_date_end) delete updateData.event_date_end

    const { error: dbErr } = await getSupabase().from('events').update(updateData).eq('id', id)
    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }
    setSuccess(L ? 'Evento actualizado ✓' : 'Event updated ✓')
    setTimeout(() => { setSuccess(''); router.push('/dashboard') }, 1500)
  }

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font)' }}>Cargando…</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} />

      {success && (
        <div style={{ position: 'fixed', top: 66, right: 16, zIndex: 9999, background: 'rgba(0,200,150,0.15)', color: 'var(--green)', border: '1px solid rgba(0,200,150,0.3)', padding: '11px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)' }}>{success}</div>
      )}

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          {L ? 'Editar evento' : 'Edit event'}
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 28px' }}>{form.name}</p>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px', boxShadow: 'var(--glow-card)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={lbl}>{L ? 'Nombre *' : 'Name *'}</label><input value={form.name} onChange={e => sf('name', e.target.value)} style={iStyle} /></div>
          <div><label style={lbl}>{L ? 'Organizador' : 'Organizer'}</label><input value={form.organizer} onChange={e => sf('organizer', e.target.value)} style={iStyle} /></div>
          <div><label style={lbl}>{L ? 'Descripción' : 'Description'}</label><textarea value={form.description} onChange={e => sf('description', e.target.value)} rows={3} style={{ ...iStyle, resize: 'vertical' }} /></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={lbl}>{L ? 'Ubicación' : 'Location'}</label><input value={form.location} onChange={e => sf('location', e.target.value)} style={iStyle} /></div>
            <div><label style={lbl}>{L ? 'País' : 'Country'}</label><select value={form.country} onChange={e => sf('country', e.target.value)} style={{ ...iStyle, color: '#fff' }}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select></div>
            <div><label style={lbl}>{L ? 'Fecha inicio' : 'Start date'}</label><input type="date" value={form.event_date} onChange={e => sf('event_date', e.target.value)} style={iStyle} /></div>
            <div><label style={lbl}>{L ? 'Fecha fin' : 'End date'}</label><input type="date" value={form.event_date_end} onChange={e => sf('event_date_end', e.target.value)} style={iStyle} /></div>
          </div>

          <div>
            <label style={lbl}>{L ? 'Modalidades' : 'Disciplines'}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {DISCIPLINES.map(d => { const sel = form.disciplines.includes(d.id); return (
                <button key={d.id} onClick={() => togDisc(d.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: `1.5px solid ${sel ? d.color : 'var(--border)'}`, borderRadius: 8, background: sel ? d.color + '15' : 'var(--bg-input)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s' }}>
                  <span>{d.icon}</span>
                  <span style={{ fontWeight: 600, color: sel ? d.color : 'rgba(255,255,255,0.7)', fontSize: 13 }}>{d.label}</span>
                  {sel && <CheckCircle size={13} color={d.color} style={{ marginLeft: 'auto' }} />}
                </button>
              )})}
            </div>
          </div>

          <div>
            <label style={lbl}>{L ? 'Tipo de pista' : 'Track type'}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['official', L?'Pista oficial':'Official','100% pts','var(--green)'],['adapted',L?'Pista adaptada':'Adapted','70% pts','var(--cyan)']].map(([v,l,sub,c]) => (
                <button key={v} onClick={() => sf('track_type', v)}
                  style={{ padding: '12px', border: `2px solid ${form.track_type===v?c:'var(--border)'}`, borderRadius: 9, background: form.track_type===v?c+'15':'var(--bg-input)', cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: form.track_type===v?c:'#fff', fontSize: 13 }}>{l}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={lbl}>{L ? 'Portada' : 'Cover'}</label>
            <div onClick={() => coverRef.current?.click()}
              style={{ border: `2px dashed ${coverPreview ? 'var(--cyan)' : 'var(--border)'}`, borderRadius: 10, padding: '20px', textAlign: 'center', background: 'var(--bg-input)', cursor: 'pointer', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {coverPreview ? <img src={coverPreview} style={{ maxHeight: 120, borderRadius: 7, objectFit: 'cover' }} /> : <div><Upload size={22} color="rgba(255,255,255,0.4)" style={{ display: 'block', margin: '0 auto 6px' }} /><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{L ? 'Clic para cambiar portada' : 'Click to change cover'}</div></div>}
            </div>
            <input ref={coverRef} type="file" accept="image/*" onChange={e => { const f=e.target.files[0]; if (!f) return; setCoverFile(f); const r=new FileReader(); r.onload=ev=>setCoverPreview(ev.target.result); r.readAsDataURL(f) }} style={{ display: 'none' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: form.is_published ? 'rgba(0,200,150,0.08)' : 'rgba(255,123,0,0.08)', border: `1px solid ${form.is_published ? 'rgba(0,200,150,0.2)' : 'rgba(255,123,0,0.2)'}`, borderRadius: 9 }}>
            <input type="checkbox" id="published" checked={form.is_published} onChange={e => sf('is_published', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <label htmlFor="published" style={{ fontSize: 13, color: form.is_published ? 'var(--green)' : 'var(--orange)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              {form.is_published ? (L ? '✓ Evento publicado (visible al público)' : '✓ Event published (public)') : (L ? 'Borrador (no visible al público)' : 'Draft (not visible to public)')}
            </label>
          </div>

          {error && <div style={{ fontSize: 13, color: 'var(--red)', background: 'var(--red-bg)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,68,68,0.25)' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <button onClick={() => router.push('/dashboard')}
              style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 9, background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              {L ? 'Cancelar' : 'Cancel'}
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, padding: '11px', background: saving ? 'var(--border)' : 'var(--blue)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', boxShadow: saving ? 'none' : 'var(--glow-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Save size={15} />{saving ? (L ? 'Guardando…' : 'Saving…') : (L ? 'Guardar cambios' : 'Save changes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
