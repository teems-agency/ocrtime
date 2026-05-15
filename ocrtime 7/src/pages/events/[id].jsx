import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { getSupabase } from '../../lib/supabase'
import { DISCIPLINES, getFlag } from '../../lib/constants'
import { MapPin, Calendar, Users, ArrowLeft, Instagram } from 'lucide-react'

const CatBadge = ({ cat }) => {
  const map = { elite: ['ELITE','#FF4444'], agegroup: ['AGE GP','#00D4FF'], open: ['OPEN','rgba(255,255,255,0.5)'], adaptive: ['ADAPTIVE','#9B6DFF'] }
  const [label, color] = map[cat] || map.open
  return <span style={{ fontSize: 9, padding: '2px 7px', color, borderRadius: 10, fontWeight: 800, letterSpacing: '0.06em', border: `1px solid ${color}55` }}>{label}</span>
}

export default function EventDetail({ user, authLoading }) {
  const router = useRouter()
  const { id } = router.query
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [event, setEvent] = useState(null)
  const [athletes, setAthletes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info')
  const L = lang === 'es'

  useEffect(() => {
    if (!id) return
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    setLoading(true)
    const [{ data: ev }, { data: regs }] = await Promise.all([
      getSupabase().from('events').select('*').eq('id', id).single(),
      getSupabase().from('registrations').select('*, athletes(id, full_name, bib, photo_url, country, category, instagram)').eq('event_id', id)
    ])
    if (ev) setEvent(ev)
    if (regs) setAthletes(regs)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} />
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.5)' }}>Cargando…</div>
    </div>
  )

  if (!event) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} />
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.5)' }}>Evento no encontrado</div>
    </div>
  )

  const discs = event.disciplines || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* HERO */}
      <div style={{ background: event.cover_url ? 'var(--bg)' : 'linear-gradient(135deg, #0A1628 0%, #0D2545 100%)', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
        {event.cover_url && <img src={event.cover_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />}
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 18 }}>
            <ArrowLeft size={14} />{L ? 'Todos los eventos' : 'All events'}
          </Link>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>{event.name}</h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
            {event.location && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13}/>{getFlag(event.country)} {event.location}</span>}
            {event.event_date && <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13}/>{new Date(event.event_date).toLocaleDateString(lang==='es'?'es-AR':'en-US',{day:'numeric',month:'long',year:'numeric'})}</span>}
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13}/>{event.athlete_count || 0} {L?'atletas':'athletes'}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {discs.map(dId => { const d = DISCIPLINES.find(x => x.id === dId); return d ? <span key={dId} style={{ fontSize: 11, padding: '3px 11px', borderRadius: 10, background: d.color, color: '#fff', fontWeight: 700 }}>{d.label}</span> : null })}
            {event.track_type === 'official' && <span style={{ fontSize: 11, padding: '3px 11px', borderRadius: 10, background: 'var(--green)', color: '#fff', fontWeight: 700 }}>✓ {L?'Pista oficial':'Official track'}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Main */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
            {[['info', L?'Información':'Info'], ['athletes', L?'Atletas':'Athletes']].map(([tid, tlabel]) => (
              <button key={tid} onClick={() => setTab(tid)} style={{ padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer', color: tab===tid ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: tab===tid ? 700 : 500, fontSize: 13, fontFamily: 'var(--font)', borderBottom: `2px solid ${tab===tid ? 'var(--cyan)' : 'transparent'}`, transition: 'all 0.15s' }}>{tlabel}</button>
            ))}
          </div>

          {tab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {event.description && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 10 }}>{L?'Descripción':'Description'}</div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, margin: 0 }}>{event.description}</p>
                </div>
              )}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 14 }}>{L?'Modalidades':'Disciplines'}</div>
                {discs.map(dId => {
                  const d = DISCIPLINES.find(x => x.id === dId)
                  return d ? (
                    <div key={dId} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: d.color + '20', border: `1px solid ${d.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{d.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: d.color, fontSize: 14, marginBottom: 3 }}>{d.label}</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{L ? d.descriptionEs : d.description}</div>
                      </div>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}

          {tab === 'athletes' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 14 }}>{L?`Atletas inscriptos (${athletes.length})`:`Registered athletes (${athletes.length})`}</div>
              {athletes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.4)' }}>{L?'Sin inscriptos aún':'No athletes yet'}</div>
              ) : athletes.map((r, i) => {
                const a = r.athletes; if (!a) return null
                const disc = DISCIPLINES.find(d => d.id === r.discipline)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,102,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                      {a.photo_url ? <img src={a.photo_url} style={{ width: 32, height: 32, objectFit: 'cover' }} /> : a.full_name?.[0]}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--cyan)', background: 'rgba(0,212,255,0.1)', padding: '2px 8px', borderRadius: 8, fontFamily: 'var(--font-mono)', border: '1px solid rgba(0,212,255,0.2)', flexShrink: 0 }}>#{a.bib}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: '#fff' }}>{a.full_name}</span>
                    <span style={{ fontSize: 13 }}>{getFlag(a.country)}</span>
                    <CatBadge cat={r.category} />
                    {disc && <span style={{ fontSize: 10, color: disc.color, background: disc.color+'15', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>{disc.label}</span>}
                    {/* SOLO INSTAGRAM público, SIN whatsapp */}
                    {a.instagram && <a href={`https://instagram.com/${a.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ color: '#C13584', display: 'flex', alignItems: 'center' }}><Instagram size={14}/></a>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 74 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', boxShadow: 'var(--glow-card)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 14 }}>{L?'Inscribirse':'Register'}</div>
            {!user ? (
              <>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 14, lineHeight: 1.6 }}>{L?'Necesitás una cuenta de atleta.':'You need an athlete account.'}</p>
                <Link href="/auth" style={{ display: 'block', padding: '11px', background: 'var(--blue)', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'center', boxShadow: 'var(--glow-blue)' }}>{L?'Crear cuenta / Ingresar':'Sign up / Sign in'}</Link>
              </>
            ) : (
              <div>
                {discs.map(dId => { const d = DISCIPLINES.find(x => x.id === dId); if (!d) return null; return (
                  <button key={dId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 13px', border: `1.5px solid ${d.color}44`, borderRadius: 9, background: d.color+'10', marginBottom: 8, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                    <span style={{ fontWeight: 700, color: d.color, fontSize: 13 }}>{d.label}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{L?'Inscribirme':'Register'}</span>
                  </button>
                )})}
              </div>
            )}
            {event.organizer && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{L?'Organizador':'Organizer'}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{event.organizer}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`@media(max-width:700px){div[style*="grid-template-columns: 1fr 300px"]{grid-template-columns:1fr!important;}}`}</style>
    </div>
  )
}
