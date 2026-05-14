import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { Card, Btn, Bib, CatBadge, Empty, PageHeader, Toast } from '../components/ui'
import WaveTiming from '../components/timing/WaveTiming'
import SprintTiming from '../components/timing/SprintTiming'
import PentathlonTiming from '../components/timing/PentathlonTiming'
import { getSupabase } from '../lib/supabase'
import { DISCIPLINES, getFlag } from '../lib/constants'
import { Timer, Users, Trophy, Plus, Search, Download, Instagram, Phone, Edit, Eye } from 'lucide-react'

export default function Dashboard({ user, authLoading }) {
  const router = useRouter()
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [athletes, setAthletes] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [activeDisc, setActiveDisc] = useState(null)
  const [activeSub, setActiveSub] = useState('timing')
  const [raceState, setRaceState] = useState({})
  const [checks, setChecks] = useState({})
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [athleteSearch, setAthleteSearch] = useState('')
  const [allAthletes, setAllAthletes] = useState([])
  const L = lang === 'es'

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000) }

  useEffect(() => { if (!authLoading && !user) router.push('/auth') }, [user, authLoading])
  useEffect(() => { if (user) loadData() }, [user])
  useEffect(() => { if (selectedEventId) loadRegistrations(selectedEventId) }, [selectedEventId])

  const loadData = async () => {
    setLoading(true)
    const [{ data: evts }, { data: aths }] = await Promise.all([
      getSupabase().from('events').select('*').eq('created_by', user.id).order('created_at', { ascending: false }),
      getSupabase().from('athletes').select('*').order('bib'),
    ])
    setEvents(evts || [])
    setAllAthletes(aths || [])
    setLoading(false)
  }

  const loadRegistrations = async (evId) => {
    const { data } = await getSupabase().from('registrations').select('*, athletes(*)').eq('event_id', evId)
    setRegistrations(data || [])
    setAthletes((data || []).map(r => r.athletes).filter(Boolean))
  }

  const gRS = (eid) => raceState[eid] || {}
  const sRS = (eid, fn) => setRaceState(p => ({ ...p, [eid]: fn(p[eid] || {}) }))

  const selectedEvent = events.find(e => e.id === selectedEventId)
  const eventDiscs = selectedEvent?.disciplines || []
  const discRegs = registrations.filter(r => r.discipline === activeDisc)

  const addAthleteToEvent = async (ath) => {
    if (!selectedEventId || !activeDisc) { showToast(L ? 'Seleccioná una modalidad primero' : 'Select a discipline first', 'error'); return }
    if (registrations.find(r => r.athlete_id === ath.id && r.discipline === activeDisc)) { showToast(L ? 'Ya inscripto en esta modalidad' : 'Already registered in this discipline', 'error'); return }
    const { error } = await getSupabase().from('registrations').insert({ event_id: selectedEventId, athlete_id: ath.id, discipline: activeDisc, category: ath.category || 'agegroup', age_group: ath.category === 'elite' ? null : (ath.age_group || 'senior_2529'), registered_by: user.id })
    if (error) { showToast(error.message, 'error'); return }
    showToast(`${ath.full_name} ${L ? 'agregado' : 'added'} ✓`)
    loadRegistrations(selectedEventId)
    setAthleteSearch('')
  }

  const publishEvent = async () => {
    const { error } = await getSupabase().from('events').update({ is_published: true }).eq('id', selectedEventId)
    if (error) { showToast(error.message, 'error'); return }
    setEvents(p => p.map(e => e.id === selectedEventId ? { ...e, is_published: true } : e))
    showToast(L ? 'Evento publicado ✓' : 'Event published ✓')
  }

  const exportCSV = () => {
    const rows = registrations.map(r => { const a = r.athletes; if (!a) return null; const c = checks[a.id] || {}; return [a.bib, a.full_name, a.email || '', a.whatsapp || '', a.country || '', a.instagram || '', r.discipline, r.category, r.age_group || '', c.paid ? 'yes' : 'no', c.waiver ? 'yes' : 'no', c.medical ? 'yes' : 'no'] }).filter(Boolean)
    const csv = [['bib','name','email','whatsapp','country','instagram','discipline','category','age_group','paid','waiver','medical'], ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `${selectedEvent?.name || 'event'}-athletes.csv`; a.click()
    showToast('CSV exported ✓')
  }

  const setCheck = (athId, field, val) => setChecks(p => ({ ...p, [athId]: { ...(p[athId] || {}), [field]: val } }))

  const filteredAllAthletes = allAthletes.filter(a =>
    !registrations.find(r => r.athlete_id === a.id && r.discipline === activeDisc) &&
    (athleteSearch === '' || a.full_name?.toLowerCase().includes(athleteSearch.toLowerCase()) || a.bib?.includes(athleteSearch))
  ).slice(0, 8)

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>Cargando…</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '28px 22px' }}>
        <PageHeader title={L ? 'Panel de organizador' : 'Organizer dashboard'} sub={L ? 'Cronometración en vivo · Atletas · Resultados' : 'Live timing · Athletes · Results'} action={<Link href="/events/create"><Btn icon={<Plus size={13}/>} size="sm">{L ? 'Nuevo evento' : 'New event'}</Btn></Link>} />

        {/* Event selector */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{L ? 'Seleccioná el evento activo' : 'Select active event'}</div>
          {events.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{L ? 'No tenés eventos. ' : 'No events yet. '}<Link href="/events/create" style={{ color: 'var(--blue)' }}>{L ? 'Crear →' : 'Create →'}</Link></div>
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {events.map(e => (
                <button key={e.id} onClick={() => { setSelectedEventId(e.id); setActiveDisc(null) }}
                  style={{ padding: '8px 16px', border: `1.5px solid ${selectedEventId === e.id ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 20, background: selectedEventId === e.id ? 'var(--blue-bg)' : 'transparent', color: selectedEventId === e.id ? 'var(--blue)' : 'var(--text-sec)', fontSize: 13, fontWeight: selectedEventId === e.id ? 700 : 400, cursor: 'pointer', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {e.name}
                  <span style={{ fontSize: 9, background: e.is_published ? 'var(--green)' : '#946000', color: '#fff', padding: '1px 5px', borderRadius: 6, fontWeight: 700 }}>{e.is_published ? 'LIVE' : 'DRAFT'}</span>
                </button>
              ))}
            </div>
          )}
        </Card>

        {selectedEvent && (
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>
            {/* Sidebar */}
            <div>
              <Card style={{ padding: '12px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedEvent.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <Link href={`/events/${selectedEventId}`} style={{ fontSize: 12, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}><Eye size={11}/>{L ? 'Ver público' : 'View public'}</Link>
                  <Link href={`/events/edit/${selectedEventId}`} style={{ fontSize: 12, color: 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}><Edit size={11}/>{L ? 'Editar evento' : 'Edit event'}</Link>
                  {!selectedEvent.is_published && <button onClick={publishEvent} style={{ fontSize: 12, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}>✓ {L ? 'Publicar' : 'Publish'}</button>}
                </div>
              </Card>
              <Card style={{ padding: '8px 0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 12px 8px' }}>MODALIDADES</div>
                {eventDiscs.map(dId => { const disc = DISCIPLINES.find(d => d.id === dId); if (!disc) return null; const count = registrations.filter(r => r.discipline === dId).length; return (
                  <button key={dId} onClick={() => { setActiveDisc(dId); setActiveSub('timing') }}
                    style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '9px 12px', background: activeDisc === dId ? disc.bg : 'transparent', border: 'none', borderLeft: `3px solid ${activeDisc === dId ? disc.color : 'transparent'}`, cursor: 'pointer', textAlign: 'left', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{disc.icon}</span>
                    <div><div style={{ fontWeight: 600, fontSize: 12, color: activeDisc === dId ? disc.color : 'var(--text)' }}>{disc.label}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{count} {L ? 'atletas' : 'ath.'}</div></div>
                  </button>
                )})}
              </Card>
            </div>

            {/* Main */}
            <div>
              {!activeDisc ? <Card><Empty label={L ? 'Seleccioná una modalidad' : 'Select a discipline'} /></Card> : (
                <>
                  <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
                    {[['timing', L ? 'Cronometrar' : 'Timing'], ['athletes', L ? 'Atletas' : 'Athletes'], ['results', L ? 'Resultados' : 'Results']].map(([id, label]) => (
                      <button key={id} onClick={() => setActiveSub(id)} style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', color: activeSub === id ? 'var(--blue)' : 'var(--text-muted)', fontWeight: activeSub === id ? 700 : 400, fontSize: 13, fontFamily: 'var(--font)', borderBottom: `2px solid ${activeSub === id ? 'var(--blue)' : 'transparent'}` }}>{label}</button>
                    ))}
                  </div>

                  {activeSub === 'timing' && (() => {
                    const disc = DISCIPLINES.find(d => d.id === activeDisc)
                    const regs = discRegs.map(r => ({ athId: r.athlete_id, disc: r.discipline, cat: r.category, ag: r.age_group }))
                    return (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: disc.bg, border: `1px solid ${disc.color}33`, borderRadius: 8 }}>
                          <span style={{ fontSize: 18 }}>{disc.icon}</span>
                          <div><div style={{ fontWeight: 700, color: disc.color, fontSize: 14 }}>{disc.label}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{L ? disc.descriptionEs : disc.description}</div></div>
                          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{discRegs.length} {L ? 'inscriptos' : 'registered'}</div>
                        </div>
                        {['ocr100','ocr400'].includes(activeDisc) && <SprintTiming discipline={activeDisc} athletes={athletes} registrations={regs} lang={lang} />}
                        {['short','standard'].includes(activeDisc) && <WaveTiming event={selectedEvent} discipline={activeDisc} athletes={athletes} registrations={regs} lang={lang} />}
                        {activeDisc === 'pentathlon' && <PentathlonTiming athletes={athletes} registrations={regs} lang={lang} />}
                        {activeDisc === 'teamrelay' && <TeamRelayTiming athletes={athletes} lang={lang} />}
                      </div>
                    )
                  })()}

                  {activeSub === 'athletes' && (
                    <div>
                      <Card style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{L ? 'Agregar atleta' : 'Add athlete'}</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Btn onClick={exportCSV} variant="ghost" icon={<Download size={12}/>} size="sm">CSV</Btn>
                            <Link href="/athletes/create"><Btn variant="ghost" icon={<Plus size={12}/>} size="sm">{L ? 'Nuevo' : 'New'}</Btn></Link>
                          </div>
                        </div>
                        <div style={{ position: 'relative', marginBottom: 8 }}>
                          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input value={athleteSearch} onChange={e => setAthleteSearch(e.target.value)} placeholder={L ? 'Buscar por nombre o dorsal…' : 'Search by name or bib…'} style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', background: 'var(--gray-alt)', color: 'var(--text)', boxSizing: 'border-box' }} />
                        </div>
                        {athleteSearch && filteredAllAthletes.length > 0 && (
                          <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                            {filteredAllAthletes.map(a => (
                              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--blue)', overflow: 'hidden', flexShrink: 0 }}>
                                  {a.photo_url ? <img src={a.photo_url} style={{ width: 28, height: 28, objectFit: 'cover' }}/> : a.full_name?.[0]}
                                </div>
                                <Bib n={a.bib} /><span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{a.full_name}</span>
                                <span style={{ fontSize: 12 }}>{getFlag(a.country)}</span>
                                <CatBadge cat={a.category || 'agegroup'} />
                                <Btn onClick={() => addAthleteToEvent(a)} size="sm" icon={<Plus size={11}/>}>{L ? 'Agregar' : 'Add'}</Btn>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                      <Card>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{L ? `Inscriptos (${discRegs.length})` : `Registered (${discRegs.length})`}</div>
                          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                            <span style={{ color: 'var(--green)', fontWeight: 600 }}>💰 {Object.values(checks).filter(c=>c.paid).length}/{discRegs.length}</span>
                            <span style={{ color: 'var(--blue)', fontWeight: 600 }}>📄 {Object.values(checks).filter(c=>c.waiver).length}/{discRegs.length}</span>
                            <span style={{ color: 'var(--gold)', fontWeight: 600 }}>🏥 {Object.values(checks).filter(c=>c.medical).length}/{discRegs.length}</span>
                          </div>
                        </div>
                        {discRegs.length === 0 ? <Empty label={L ? 'Sin inscriptos' : 'No athletes'} /> : discRegs.map((r, i) => {
                          const a = r.athletes; if (!a) return null; const c = checks[a.id] || {}
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--blue)', overflow: 'hidden', flexShrink: 0 }}>
                                {a.photo_url ? <img src={a.photo_url} style={{ width: 28, height: 28, objectFit: 'cover' }}/> : a.full_name?.[0]}
                              </div>
                              <Bib n={a.bib} />
                              <span style={{ flex: 1, fontWeight: 600, fontSize: 13, minWidth: 100 }}>{a.full_name}</span>
                              <span style={{ fontSize: 12 }}>{getFlag(a.country)} {a.country}</span>
                              <CatBadge cat={r.category} />
                              {['paid','waiver','medical'].map(field => (
                                <button key={field} onClick={() => setCheck(a.id, field, !c[field])} title={field}
                                  style={{ width: 22, height: 22, borderRadius: 5, border: `1.5px solid ${c[field] ? 'var(--green)' : 'var(--border)'}`, background: c[field] ? 'var(--green)' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {c[field] && '✓'}
                                </button>
                              ))}
                              {a.whatsapp && <a href={`https://wa.me/${a.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--green)' }}><Phone size={13}/></a>}
                              {a.instagram && <a href={`https://instagram.com/${a.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{ color: '#C13584' }}><Instagram size={13}/></a>}
                            </div>
                          )
                        })}
                      </Card>
                    </div>
                  )}

                  {activeSub === 'results' && <Card><Empty label={L ? 'Los resultados aparecen aquí después de cronometrar.' : 'Results appear here after timing.'} /></Card>}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TeamRelayTiming({ athletes, lang }) {
  const [teams, setTeams] = useState([])
  const [name, setName] = useState(''); const [bibs, setBibs] = useState(['','','',''])
  const L = lang === 'es'
  const addTeam = () => { if (!name.trim()) return; const members = bibs.map(b => athletes.find(a => a.bib === b.trim())).filter(Boolean); setTeams(p => [...p, { id: Date.now(), name, members, time: '' }]); setName(''); setBibs(['','','','']) }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{L ? 'Crear equipo' : 'Create team'}</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={L ? 'Nombre del equipo' : 'Team name'} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
        {bibs.map((b, i) => <input key={i} value={b} onChange={e => { const n=[...bibs]; n[i]=e.target.value; setBibs(n) }} placeholder={`Dorsal ${i+1}`} style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', marginBottom: 6, boxSizing: 'border-box' }} />)}
        <Btn onClick={addTeam} icon={<Plus size={12}/>} size="sm" style={{ marginTop: 4 }}>{L ? 'Agregar' : 'Add'}</Btn>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{L ? 'Resultados' : 'Results'} ({teams.length})</div>
        {teams.length === 0 ? <Empty label={L ? 'Sin equipos' : 'No teams'} /> : teams.map((t, pos) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 800, color: pos===0?'var(--gold)':pos===1?'#909BAA':pos===2?'#B8722A':'var(--text-muted)', width: 20, fontSize: 14 }}>{pos+1}</span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{t.name}</span>
            <input value={t.time} onChange={e => setTeams(p => p.map(x => x.id===t.id?{...x,time:e.target.value}:x))} placeholder="m:ss.cc" style={{ width: 80, padding: '4px 7px', border: '1px solid var(--border)', borderRadius: 5, fontFamily: 'monospace', fontSize: 13, outline: 'none' }} />
          </div>
        ))}
      </Card>
    </div>
  )
}
