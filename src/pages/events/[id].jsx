import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { Card, Btn, Bib, CatBadge, Empty, Toast } from '../../components/ui'
import { getSupabase } from '../../lib/supabase'
import { DISCIPLINES, AGE_GROUPS, getFlag, formatTime } from '../../lib/constants'
import { MapPin, Calendar, Users, Trophy, ArrowLeft, Instagram, Phone } from 'lucide-react'

export default function EventDetail({ user, authLoading }) {
  const router = useRouter()
  const { id } = router.query
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [event, setEvent] = useState(null)
  const [athletes, setAthletes] = useState([])
  const [loading, setLoading] = useState(true)
  const [regLoading, setRegLoading] = useState(false)
  const [tab, setTab] = useState('info') // info | athletes | results
  const [toast, setToast] = useState(null)
  const L = lang === 'es'

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000) }

  useEffect(() => {
    if (!id) return
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    setLoading(true)
    const supabase = getSupabase()
    const [{ data: ev }, { data: regs }] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('registrations').select('*, athletes(*)').eq('event_id', id)
    ])
    if (ev) setEvent(ev)
    if (regs) setAthletes(regs)
    setLoading(false)
  }

  const handleRegister = async (disc, cat, ag) => {
    if (!user) { router.push('/auth'); return }
    setRegLoading(true)
    const supabase = getSupabase()
    const { data: ath } = await supabase.from('athletes').select('id, bib').eq('user_id', user.id).single()
    if (!ath) { router.push('/athletes/create'); return }
    const { error } = await supabase.from('registrations').insert({
      event_id: id, athlete_id: ath.id, discipline: disc,
      category: cat, age_group: cat === 'elite' ? null : ag
    })
    if (error) { showToast(error.message, 'error') }
    else { showToast(L ? 'Inscripción confirmada ✓' : 'Registration confirmed ✓'); loadEvent() }
    setRegLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>Cargando…</div>
    </div>
  )

  if (!event) return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>Evento no encontrado</div>
    </div>
  )

  const discs = event.disciplines || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Hero banner */}
      <div style={{ background: event.cover_url ? 'var(--navy)' : 'linear-gradient(135deg, var(--navy) 0%, #1a3a6b 100%)', padding: '48px 24px', position: 'relative' }}>
        {event.cover_url && <img src={event.cover_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />}
        <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative' }}>
          <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none', marginBottom: 16 }}>
            <ArrowLeft size={14} />{L ? 'Todos los eventos' : 'All events'}
          </Link>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>{event.name}</h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
            {event.location && <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} />{getFlag(event.country)} {event.location}</span>}
            {event.event_date && <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} />{new Date(event.event_date).toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13} />{event.athlete_count || 0} {L ? 'atletas' : 'athletes'}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {discs.map(dId => { const d = DISCIPLINES.find(x => x.id === dId); return d ? <span key={dId} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: d.color, color: '#fff', fontWeight: 600 }}>{d.label}</span> : null })}
            {event.track_type === 'official' && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: 'var(--green)', color: '#fff', fontWeight: 600 }}>✓ {L ? 'Pista oficial' : 'Official track'}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          {/* Main content */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
              {[['info', L ? 'Información' : 'Info'], ['athletes', L ? 'Atletas' : 'Athletes'], ['results', L ? 'Resultados' : 'Results']].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer', color: tab === id ? 'var(--blue)' : 'var(--text-muted)', fontWeight: tab === id ? 700 : 400, fontSize: 13, fontFamily: 'var(--font)', borderBottom: `2px solid ${tab === id ? 'var(--blue)' : 'transparent'}` }}>{label}</button>
              ))}
            </div>

            {tab === 'info' && (
              <div>
                {event.description && (
                  <Card style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{L ? 'Descripción' : 'Description'}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.7, margin: 0 }}>{event.description}</p>
                  </Card>
                )}
                <Card>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{L ? 'Modalidades' : 'Disciplines'}</div>
                  {discs.map(dId => {
                    const d = DISCIPLINES.find(x => x.id === dId)
                    return d ? (
                      <div key={dId} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: d.color + '15', border: `1px solid ${d.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{d.icon}</div>
                        <div>
                          <div style={{ fontWeight: 700, color: d.color, fontSize: 14 }}>{d.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{L ? d.descriptionEs : d.description}</div>
                        </div>
                      </div>
                    ) : null
                  })}
                </Card>
              </div>
            )}

            {tab === 'athletes' && (
              <Card>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{L ? `Atletas inscriptos (${athletes.length})` : `Registered athletes (${athletes.length})`}</div>
                {athletes.length === 0 ? <Empty label={L ? 'Sin inscriptos aún' : 'No athletes yet'} /> : athletes.map((r, i) => {
                  const a = r.athletes
                  if (!a) return null
                  const disc = DISCIPLINES.find(d => d.id === r.discipline)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>
                        {a.photo_url ? <img src={a.photo_url} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} /> : a.full_name?.[0]}
                      </div>
                      <Bib n={a.bib} />
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{a.full_name}</span>
                      <span style={{ fontSize: 12 }}>{getFlag(a.country)} {a.country}</span>
                      <CatBadge cat={r.category} />
                      {disc && <span style={{ fontSize: 10, color: disc.color, background: disc.color + '15', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{disc.label}</span>}
                      {a.instagram && <a href={`https://instagram.com/${a.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#C13584' }}><Instagram size={13} /></a>}
                    </div>
                  )
                })}
              </Card>
            )}

            {tab === 'results' && (
              <Card>
                <Empty label={L ? 'Los resultados aparecen aquí cuando el organizador los publica.' : 'Results appear here when the organizer publishes them.'} />
              </Card>
            )}
          </div>

          {/* Sidebar — Register */}
          <div style={{ position: 'sticky', top: 74 }}>
            <Card>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{L ? 'Inscribirse' : 'Register'}</div>
              {!user ? (
                <>
                  <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 14, lineHeight: 1.6 }}>
                    {L ? 'Necesitás una cuenta de atleta para inscribirte.' : 'You need an athlete account to register.'}
                  </p>
                  <Link href="/auth"><Btn style={{ width: '100%', justifyContent: 'center' }}>{L ? 'Crear cuenta / Ingresar' : 'Create account / Sign in'}</Btn></Link>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 14, lineHeight: 1.6 }}>
                    {L ? 'Seleccioná la modalidad en la que querés participar.' : 'Select the discipline you want to participate in.'}
                  </p>
                  {discs.map(dId => {
                    const d = DISCIPLINES.find(x => x.id === dId)
                    const alreadyReg = athletes.some(r => r.discipline === dId && r.athletes?.user_id === user?.id)
                    return d ? (
                      <button key={dId} onClick={() => !alreadyReg && handleRegister(dId, 'agegroup', 'senior_2529')}
                        disabled={alreadyReg || regLoading}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 12px', border: `1.5px solid ${alreadyReg ? 'var(--green)' : d.color}`, borderRadius: 8, background: alreadyReg ? 'var(--green-bg)' : d.color + '08', cursor: alreadyReg ? 'default' : 'pointer', marginBottom: 8, fontFamily: 'var(--font)' }}>
                        <span style={{ fontWeight: 600, color: alreadyReg ? 'var(--green)' : d.color, fontSize: 13 }}>{d.label}</span>
                        <span style={{ fontSize: 11, color: alreadyReg ? 'var(--green)' : 'var(--text-muted)' }}>{alreadyReg ? '✓ Inscripto' : L ? 'Inscribirse' : 'Register'}</span>
                      </button>
                    ) : null
                  })}
                </>
              )}
            </Card>

            {event.organizer && (
              <Card style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{L ? 'Organizador' : 'Organizer'}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{event.organizer}</div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
