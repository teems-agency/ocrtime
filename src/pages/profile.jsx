import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { Card, Btn, Bib, CatBadge, Empty, Toast } from '../components/ui'
import { getSupabase } from '../lib/supabase'
import { DISCIPLINES, AGE_GROUPS, COUNTRIES, getFlag, formatTime } from '../lib/constants'
import { Edit, Save, Instagram, Phone, Mail, Calendar, Camera, X } from 'lucide-react'

export default function ProfilePage({ user, authLoading }) {
  const router = useRouter()
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [athlete, setAthlete] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const photoRef = useRef()
  const L = lang === 'es'

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000) }

  useEffect(() => { if (!authLoading && !user) router.push('/auth') }, [user, authLoading])
  useEffect(() => { if (user) loadProfile() }, [user])

  const loadProfile = async () => {
    setLoading(true)
    const { data: ath } = await getSupabase().from('athletes').select('*').eq('user_id', user.id).single()
    if (!ath) { router.push('/athletes/create'); return }
    setAthlete(ath)
    setForm({ full_name: ath.full_name, country: ath.country, gender: ath.gender, date_of_birth: ath.date_of_birth || '', whatsapp: ath.whatsapp || '', instagram: ath.instagram || '', category: ath.category || 'agegroup', age_group: ath.age_group || 'senior_2529' })
    const { data: regs } = await getSupabase().from('registrations').select('*, events(*)').eq('athlete_id', ath.id)
    setRegistrations(regs || [])
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await getSupabase().from('athletes').update({ full_name: form.full_name, country: form.country, gender: form.gender, date_of_birth: form.date_of_birth || null, whatsapp: form.whatsapp || null, instagram: form.instagram || null, category: form.category, age_group: form.category === 'elite' ? null : form.age_group }).eq('id', athlete.id)
    setSaving(false)
    if (error) { showToast(error.message, 'error'); return }
    setAthlete(p => ({ ...p, ...form }))
    setEditing(false)
    showToast(L ? 'Perfil actualizado ✓' : 'Profile updated ✓')
  }

  const handlePhotoUpload = async (file) => {
    if (!file || !athlete) return
    const ext = file.name.split('.').pop()
    const path = `athletes/${athlete.id}.${ext}`
    const { error: upErr } = await getSupabase().storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { showToast(upErr.message, 'error'); return }
    const { data } = getSupabase().storage.from('avatars').getPublicUrl(path)
    await getSupabase().from('athletes').update({ photo_url: data.publicUrl }).eq('id', athlete.id)
    setAthlete(p => ({ ...p, photo_url: data.publicUrl }))
    showToast(L ? 'Foto actualizada ✓' : 'Photo updated ✓')
  }

  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }))

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>Cargando…</div>
    </div>
  )

  const age = athlete?.date_of_birth ? Math.floor((Date.now() - new Date(athlete.date_of_birth)) / (365.25 * 24 * 3600 * 1000)) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Profile header */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'var(--blue)', overflow: 'hidden', border: '3px solid var(--border)' }}>
                {athlete?.photo_url ? <img src={athlete.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : athlete?.full_name?.[0]}
              </div>
              <button onClick={() => photoRef.current?.click()}
                style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'var(--blue)', border: '2px solid #fff', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={12} />
              </button>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoUpload(e.target.files[0])} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{athlete?.full_name}</h1>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Bib n={athlete?.bib} />
                    <CatBadge cat={athlete?.category || 'agegroup'} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{getFlag(athlete?.country)} {athlete?.country}</span>
                    {age && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{age} {L ? 'años' : 'years'}</span>}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  {athlete?.instagram && (
                    <a href={`https://instagram.com/${athlete.instagram.replace('@','')}`} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                      <Instagram size={13} />{athlete.instagram}
                    </a>
                  )}
                  <Btn onClick={() => setEditing(!editing)} variant={editing ? 'ghost' : 'secondary'} icon={editing ? <X size={13}/> : <Edit size={13}/>} size="sm">
                    {editing ? (L ? 'Cancelar' : 'Cancel') : (L ? 'Editar' : 'Edit')}
                  </Btn>
                </div>
              </div>

              {/* Contact info */}
              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                {athlete?.email && <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11}/>{athlete.email}</span>}
                {athlete?.whatsapp && <a href={`https://wa.me/${athlete.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}><Phone size={11}/>{athlete.whatsapp}</a>}
                {athlete?.category !== 'elite' && athlete?.age_group && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{AGE_GROUPS.find(g => g.id === athlete.age_group)?.label}</span>}
              </div>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{L ? 'Nombre completo' : 'Full name'}</label><input value={form.full_name} onChange={e => sf('full_name', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}/></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{L ? 'País' : 'Country'}</label><select value={form.country} onChange={e => sf('country', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>WhatsApp</label><input value={form.whatsapp} onChange={e => sf('whatsapp', e.target.value)} placeholder="+54911..." style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}/></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>Instagram</label><input value={form.instagram} onChange={e => sf('instagram', e.target.value)} placeholder="@usuario" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }}/></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{L ? 'Nacimiento' : 'DOB'}</label><input type="date" value={form.date_of_birth} onChange={e => sf('date_of_birth', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }}/></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>Género</label><select value={form.gender} onChange={e => sf('gender', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }}><option value="female">{L?'Femenino':'Female'}</option><option value="male">{L?'Masculino':'Male'}</option></select></div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>{L ? 'Categoría' : 'Category'}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['elite','Elite'],['agegroup','Age Group'],['open','Open'],['adaptive','Adaptive/Para']].map(([v,l]) => (
                    <button key={v} onClick={() => sf('category', v)} style={{ flex: 1, padding: '7px 6px', border: `1.5px solid ${form.category===v?'var(--blue)':'var(--border)'}`, borderRadius: 7, background: form.category===v?'var(--blue-bg)':'transparent', color: form.category===v?'var(--blue)':'var(--text-sec)', fontWeight: form.category===v?700:400, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font)' }}>{l}</button>
                  ))}
                </div>
                {form.category !== 'elite' && (
                  <div style={{ marginTop: 8 }}>
                    <select value={form.age_group} onChange={e => sf('age_group', e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }}>
                      {AGE_GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                  </div>
                )}
                {form.category === 'elite' && <div style={{ fontSize: 11, color: 'var(--red)', background: 'var(--red-bg)', padding: '6px 10px', borderRadius: 6, marginTop: 6 }}>{L ? 'Elite: compite en categoría abierta sin grupo etario' : 'Elite: competes in open category without age group'}</div>}
              </div>
              <Btn onClick={saveProfile} loading={saving} icon={<Save size={13}/>}>{L ? 'Guardar cambios' : 'Save changes'}</Btn>
            </div>
          )}
        </Card>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            [registrations.length, L ? 'Carreras' : 'Races'],
            [new Set(registrations.map(r => r.events?.id)).size, L ? 'Eventos' : 'Events'],
            ['—', L ? 'Puntos ranking' : 'Ranking pts'],
          ].map(([n, l]) => (
            <Card key={l} style={{ textAlign: 'center', padding: '18px' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue)', letterSpacing: '-0.02em' }}>{n}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{l}</div>
            </Card>
          ))}
        </div>

        {/* Participations */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{L ? 'Mis carreras' : 'My races'}</div>
          {registrations.length === 0 ? (
            <Empty label={L ? 'Todavía no te inscribiste en ningún evento.' : 'You haven\'t registered for any event yet.'} sub={L ? 'Buscá eventos en la sección Eventos.' : 'Find events in the Events section.'} />
          ) : registrations.map((r, i) => {
            const disc = DISCIPLINES.find(d => d.id === r.discipline)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: disc?.color + '15' || 'var(--gray-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{disc?.icon || '🏃'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.events?.name || L ? 'Evento' : 'Event'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {disc && <span style={{ color: disc.color, fontWeight: 600 }}>{disc.label}</span>}
                    <CatBadge cat={r.category} />
                    {r.events?.event_date && <span>{new Date(r.events.event_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{L ? 'Resultado' : 'Result'}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>—</div>
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}
