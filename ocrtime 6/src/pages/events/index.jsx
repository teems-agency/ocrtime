import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { Card, Btn, Empty, PageHeader, Badge, Toast } from '../../components/ui'
import { getSupabase } from '../../lib/supabase'
import { DISCIPLINES, getFlag } from '../../lib/constants'
import { Plus, MapPin, Calendar, Users, ChevronRight } from 'lucide-react'

export default function EventsPage({ user, authLoading }) {
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const L = lang === 'es'

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000) }

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    const { data, error } = await getSupabase()
      .from('events')
      .select('*')
      .eq('is_published', true)
      .order('event_date', { ascending: true })
    if (!error && data) setEvents(data)
    setLoading(false)
  }

  const getStatus = (e) => {
    if (!e.event_date) return { label: 'Upcoming', color: 'var(--blue)' }
    const d = new Date(e.event_date)
    const now = new Date()
    if (d > now) return { label: L ? 'Próximo' : 'Upcoming', color: 'var(--blue)' }
    return { label: L ? 'Finalizado' : 'Finished', color: 'var(--text-muted)' }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px' }}>
        <PageHeader
          title={L ? 'Eventos OCR' : 'OCR Events'}
          sub={L ? 'Todos los eventos cronometrados con OCR TIME.' : 'All events timed with OCR TIME.'}
          action={
            user && (
              <Link href="/events/create" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--blue)', color: '#fff', borderRadius: 7, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                <Plus size={14} />{L ? 'Crear evento' : 'Create event'}
              </Link>
            )
          }
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            {L ? 'Cargando eventos…' : 'Loading events…'}
          </div>
        ) : events.length === 0 ? (
          <Empty
            label={L ? 'No hay eventos publicados todavía' : 'No published events yet'}
            sub={L ? 'Los eventos aparecen aquí cuando el organizador los publica.' : 'Events appear here when organizers publish them.'}
            action={user && <Link href="/events/create"><Btn icon={<Plus size={13}/>}>{L ? 'Crear el primero' : 'Create the first one'}</Btn></Link>}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {events.map(e => {
              const status = getStatus(e)
              const discs = (e.disciplines || [])
              return (
                <Link key={e.id} href={`/events/${e.id}`} style={{ textDecoration: 'none' }}>
                  <Card hover style={{ cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
                    onMouseEnter={ev => { ev.currentTarget.style.boxShadow = 'var(--shadow-md)'; ev.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={ev => { ev.currentTarget.style.boxShadow = 'var(--shadow-sm)'; ev.currentTarget.style.transform = 'translateY(0)' }}>

                    {/* Cover image placeholder */}
                    <div style={{ height: 120, background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a6b 100%)', borderRadius: 8, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {e.cover_url ? (
                        <img src={e.cover_url} alt={e.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 32, marginBottom: 4 }}>🏃</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>OCR TIME</div>
                        </div>
                      )}
                      {/* Status badge */}
                      <div style={{ position: 'absolute', top: 8, right: 8, background: status.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                        {status.label}
                      </div>
                      {/* Track type */}
                      {e.track_type === 'official' && (
                        <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--green)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                          {L ? 'OFICIAL' : 'OFFICIAL'}
                        </div>
                      )}
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{e.name}</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                      {e.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                          <MapPin size={11} />{getFlag(e.country)} {e.location}
                        </div>
                      )}
                      {e.event_date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                          <Calendar size={11} />{new Date(e.event_date).toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Users size={11} />{e.athlete_count || 0} {L ? 'atletas' : 'athletes'}
                      </div>
                    </div>

                    {/* Disciplines */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                      {discs.slice(0, 4).map(dId => {
                        const disc = DISCIPLINES.find(d => d.id === dId)
                        return disc ? (
                          <span key={dId} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, color: disc.color, background: disc.color + '15', fontWeight: 600, border: `1px solid ${disc.color}33` }}>
                            {disc.label}
                          </span>
                        ) : null
                      })}
                      {discs.length > 4 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{discs.length - 4}</span>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 12, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                        {L ? 'Ver evento' : 'View event'} <ChevronRight size={13} />
                      </span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
