import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Timer, Users, Trophy, Settings, ChevronDown, ChevronUp, Download, Upload } from 'lucide-react'
import Navbar from '../components/Navbar'
import { Card, Btn, CatBadge, Bib, Empty, PageHeader, StatusBadge, WristbandDots, Counter, Toast } from '../components/ui'
import WaveTiming from '../components/timing/WaveTiming'
import SprintTiming from '../components/timing/SprintTiming'
import PentathlonTiming from '../components/timing/PentathlonTiming'
import { getSupabase } from '../lib/supabase'
import { DISCIPLINES, AGE_GROUPS, getFlag, calcXCResult, formatTime } from '../lib/constants'

export default function Dashboard({ user, authLoading }) {
  const router = useRouter()
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [athletes, setAthletes] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [activeDisc, setActiveDisc] = useState(null)
  const [activeSub, setActiveSub] = useState('timing') // 'timing' | 'athletes' | 'results'
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const L = lang === 'es'

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000) }

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    const supabase = getSupabase()
    setLoading(true)
    const [{ data: evts }, { data: aths }] = await Promise.all([
      supabase.from('events').select('*').eq('created_by', user.id).order('created_at', { ascending: false }),
      supabase.from('athletes').select('*').order('bib'),
    ])
    setEvents(evts || [])
    setAthletes(aths || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!selectedEventId) return
    loadRegistrations(selectedEventId)
  }, [selectedEventId])

  const loadRegistrations = async (evId) => {
    const supabase = getSupabase()
    const { data } = await supabase.from('registrations').select('*').eq('event_id', evId)
    setRegistrations((data || []).map(r => ({
      athId: r.athlete_id, disc: r.discipline, cat: r.category, ag: r.age_group
    })))
  }

  const selectedEvent = events.find(e => e.id === selectedEventId)
  const eventDiscs = selectedEvent?.disciplines || []

  // Build registrations for current discipline
  const discRegs = registrations.filter(r => r.disc === activeDisc)

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-bg)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '28px 22px' }}>
        <PageHeader
          title={L ? 'Panel de organizador' : 'Organizer dashboard'}
          sub={L ? 'Cronometración en vivo por modalidad y categoría.' : 'Live timing per discipline and category.'}
        />

        {/* Event selector */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            {L ? 'Evento activo' : 'Active event'}
          </div>
          {events.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {L ? 'No tenés eventos. ' : 'No events yet. '}
              <a href="/events/create" style={{ color: 'var(--blue)' }}>{L ? 'Crear evento →' : 'Create event →'}</a>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {events.map(e => (
                <button key={e.id} onClick={() => { setSelectedEventId(e.id); setActiveDisc(null) }}
                  style={{ padding: '6px 14px', border: `1.5px solid ${selectedEventId === e.id ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 20, background: selectedEventId === e.id ? 'var(--blue-bg)' : 'transparent', color: selectedEventId === e.id ? 'var(--blue)' : 'var(--text-sec)', fontSize: 12, fontWeight: selectedEventId === e.id ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  {e.name} {selectedEventId === e.id && '✓'}
                </button>
              ))}
            </div>
          )}
        </Card>

        {selectedEvent && (
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
            {/* LEFT: Discipline sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Card style={{ padding: '8px 0' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 14px 8px' }}>
                  {L ? 'MODALIDADES' : 'DISCIPLINES'}
                </div>
                {eventDiscs.map(dId => {
                  const disc = DISCIPLINES.find(d => d.id === dId)
                  if (!disc) return null
                  const count = registrations.filter(r => r.disc === dId).length
                  return (
                    <button key={dId} onClick={() => { setActiveDisc(dId); setActiveSub('timing') }}
                      style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '10px 14px', background: activeDisc === dId ? disc.bg : 'transparent', border: 'none', borderLeft: `3px solid ${activeDisc === dId ? disc.color : 'transparent'}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: activeDisc === dId ? disc.color : 'var(--text)' }}>{disc.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{count} {L ? 'atletas' : 'athletes'}</span>
                    </button>
                  )
                })}
              </Card>
            </div>

            {/* RIGHT: Content */}
            <div>
              {!activeDisc ? (
                <Card>
                  <Empty label={L ? 'Seleccioná una modalidad para cronometrar' : 'Select a discipline to start timing'} />
                </Card>
              ) : (
                <>
                  {/* Sub tabs */}
                  <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
                    {[['timing', L ? 'Cronometrar' : 'Timing', <Timer size={13} />], ['athletes', L ? 'Atletas' : 'Athletes', <Users size={13} />], ['results', L ? 'Resultados' : 'Results', <Trophy size={13} />]].map(([id, label, icon]) => (
                      <button key={id} onClick={() => setActiveSub(id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', color: activeSub === id ? 'var(--blue)' : 'var(--text-muted)', fontWeight: activeSub === id ? 700 : 400, fontSize: 13, fontFamily: 'var(--font)', borderBottom: `2px solid ${activeSub === id ? 'var(--blue)' : 'transparent'}` }}>
                        {icon}{label}
                      </button>
                    ))}
                  </div>

                  {/* TIMING */}
                  {activeSub === 'timing' && (() => {
                    const disc = DISCIPLINES.find(d => d.id === activeDisc)
                    const isXCDisc = ['short', 'standard'].includes(activeDisc)
                    const isSprintDisc = ['ocr100', 'ocr400'].includes(activeDisc)
                    const isPenta = activeDisc === 'pentathlon'
                    return (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: disc.bg, border: `1px solid ${disc.color}33`, borderRadius: 8 }}>
                          <span style={{ fontSize: 18 }}>{disc.icon || '◉'}</span>
                          <div>
                            <div style={{ fontWeight: 700, color: disc.color }}>{disc.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{L ? disc.descriptionEs : disc.description}</div>
                          </div>
                        </div>
                        {isSprintDisc && <SprintTiming discipline={activeDisc} athletes={athletes} registrations={registrations} lang={lang} />}
                        {isXCDisc && <WaveTiming event={selectedEvent} discipline={activeDisc} athletes={athletes} registrations={registrations} lang={lang} />}
                        {isPenta && <PentathlonTiming athletes={athletes} registrations={registrations} lang={lang} />}
                        {activeDisc === 'teamrelay' && <TeamRelayTiming athletes={athletes} registrations={discRegs} lang={lang} />}
                      </div>
                    )
                  })()}

                  {/* ATHLETES */}
                  {activeSub === 'athletes' && (
                    <AthleteChecklist athletes={athletes} registrations={discRegs} lang={lang} showToast={showToast} />
                  )}

                  {/* RESULTS */}
                  {activeSub === 'results' && (
                    <QuickResults athletes={athletes} registrations={discRegs} discipline={activeDisc} event={selectedEvent} lang={lang} />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ATHLETE CHECKLIST ────────────────────────────────────────────────────────
function AthleteChecklist({ athletes, registrations, lang, showToast }) {
  const [checks, setChecks] = useState({}) // {athId: {paid, waiver, medical}}
  const L = lang === 'es'

  const setCheck = (athId, field, val) =>
    setChecks(prev => ({ ...prev, [athId]: { ...(prev[athId] || {}), [field]: val } }))

  const exportCSV = () => {
    const rows = registrations.map(r => {
      const a = athletes.find(x => x.id === r.athId)
      if (!a) return null
      const c = checks[a.id] || {}
      return [a.bib, a.full_name, a.email, a.whatsapp, a.country, r.disc, r.cat, r.ag || '', c.paid ? 'yes' : 'no', c.waiver ? 'yes' : 'no', c.medical ? 'yes' : 'no']
    }).filter(Boolean)
    const header = ['bib', 'name', 'email', 'whatsapp', 'country', 'discipline', 'category', 'age_group', 'paid', 'waiver', 'medical']
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'athletes.csv'; a.click()
    showToast('CSV exported')
  }

  const paidCount = Object.values(checks).filter(c => c.paid).length
  const waiverCount = Object.values(checks).filter(c => c.waiver).length
  const medicalCount = Object.values(checks).filter(c => c.medical).length

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ {L ? 'Pagados' : 'Paid'}: {paidCount}/{registrations.length}</span>
          <span style={{ color: 'var(--blue)', fontWeight: 600 }}>✓ {L ? 'Deslinde' : 'Waiver'}: {waiverCount}/{registrations.length}</span>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>✓ {L ? 'Apto méd.' : 'Medical'}: {medicalCount}/{registrations.length}</span>
        </div>
        <Btn onClick={exportCSV} variant="ghost" icon={<Download size={13} />} size="sm">Export CSV</Btn>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Dorsal', 'Atleta', 'País', 'Cat.', L ? 'Pagado' : 'Paid', L ? 'Deslinde' : 'Waiver', L ? 'Apto méd.' : 'Medical', 'WhatsApp', 'Instagram'].map((h, i) => (
                <th key={i} style={{ padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registrations.map((r, i) => {
              const a = athletes.find(x => x.id === r.athId)
              if (!a) return null
              const c = checks[a.id] || {}
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '9px 10px' }}><Bib n={a.bib} /></td>
                  <td style={{ padding: '9px 10px', fontWeight: 600 }}>{a.full_name}</td>
                  <td style={{ padding: '9px 10px' }}>{getFlag(a.country)} {a.country}</td>
                  <td style={{ padding: '9px 10px' }}><CatBadge cat={r.cat} /></td>
                  {['paid', 'waiver', 'medical'].map(field => (
                    <td key={field} style={{ padding: '9px 10px', textAlign: 'center' }}>
                      <button onClick={() => setCheck(a.id, field, !c[field])}
                        style={{ width: 22, height: 22, borderRadius: 5, border: `1.5px solid ${c[field] ? 'var(--green)' : 'var(--border)'}`, background: c[field] ? 'var(--green)' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {c[field] && '✓'}
                      </button>
                    </td>
                  ))}
                  <td style={{ padding: '9px 10px' }}>
                    {a.whatsapp && <a href={`https://wa.me/${a.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', fontSize: 12 }}>📱 {a.whatsapp}</a>}
                  </td>
                  <td style={{ padding: '9px 10px' }}>
                    {a.instagram && <a href={`https://instagram.com/${a.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#C13584', fontSize: 12 }}>📷 {a.instagram}</a>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ── QUICK RESULTS ────────────────────────────────────────────────────────────
function QuickResults({ athletes, registrations, discipline, event, lang }) {
  const L = lang === 'es'
  const isXC = ['short', 'standard'].includes(discipline)

  return (
    <Card>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
        {L ? 'Resultados' : 'Results'} — {DISCIPLINES.find(d => d.id === discipline)?.label}
      </div>
      <Empty label={L ? 'Los resultados aparecen aquí después de cronometrar.' : 'Results appear here after timing.'} />
    </Card>
  )
}

// ── TEAM RELAY ────────────────────────────────────────────────────────────────
function TeamRelayTiming({ athletes, registrations, lang }) {
  const [teams, setTeams] = useState([])
  const [teamName, setTeamName] = useState('')
  const [memberBibs, setMemberBibs] = useState(['', '', '', ''])
  const L = lang === 'es'

  const addTeam = () => {
    if (!teamName.trim()) return
    const members = memberBibs.map(b => athletes.find(a => a.bib === b.trim())).filter(Boolean)
    setTeams(prev => [...prev, { id: Date.now(), name: teamName, members, time: '', bandsLost: 0 }])
    setTeamName(''); setMemberBibs(['', '', '', ''])
  }

  const sorted = [...teams].sort((a, b) => { const ta = parseFloat(a.time), tb = parseFloat(b.time); if (!ta) return 1; if (!tb) return -1; return ta - tb })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{L ? 'Crear equipo' : 'Create team'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder={L ? 'Nombre del equipo' : 'Team name'} style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }} />
          {memberBibs.map((b, i) => (
            <input key={i} value={b} onChange={e => { const nm = [...memberBibs]; nm[i] = e.target.value; setMemberBibs(nm) }} placeholder={`${L ? 'Dorsal' : 'Bib'} ${i + 1}`} style={{ padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }} />
          ))}
        </div>
        <Btn onClick={addTeam} size="sm">{L ? 'Agregar equipo' : 'Add team'}</Btn>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>
          {L ? '5 vueltas · 4 atletas · Última vuelta cooperativa · 3 pulseras/atleta' : '5 laps · 4 athletes · Last lap cooperative · 3 bands/athlete'}
        </div>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{L ? 'Resultados' : 'Results'} ({teams.length})</div>
        {sorted.length === 0 ? <Empty label={L ? 'Sin equipos' : 'No teams'} /> : sorted.map((t, pos) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: pos === 0 ? 'var(--gold)' : pos === 1 ? '#909BAA' : pos === 2 ? '#B8722A' : 'var(--text-muted)', width: 24 }}>{pos + 1}</span>
            <span style={{ flex: 1, fontWeight: 600 }}>{t.name}</span>
            <input value={t.time} onChange={e => setTeams(prev => prev.map(x => x.id === t.id ? { ...x, time: e.target.value } : x))} placeholder="m:ss.cc" style={{ width: 90, padding: '4px 7px', border: '1px solid var(--border)', borderRadius: 5, fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none' }} />
          </div>
        ))}
      </Card>
    </div>
  )
}
