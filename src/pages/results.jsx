import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Card, Bib, CatBadge, Empty, PageHeader, RankNum } from '../components/ui'
import { getSupabase } from '../lib/supabase'
import { DISCIPLINES, AGE_GROUPS, getFlag, formatTime } from '../lib/constants'
import { Trophy, Globe, Filter } from 'lucide-react'

const SAMPLE_RANKING = [
  { pos: 1, name: 'Katarzyna J.', country: 'POL', pts: 2840, events: 12, cat: 'elite', gender: 'female' },
  { pos: 2, name: 'Tiana W.',     country: 'USA', pts: 2710, events: 11, cat: 'elite', gender: 'female' },
  { pos: 3, name: 'Mila S.',      country: 'GBR', pts: 2560, events: 10, cat: 'elite', gender: 'female' },
  { pos: 4, name: 'Anna G.',      country: 'POL', pts: 2390, events: 13, cat: 'elite', gender: 'female' },
  { pos: 5, name: 'L. Kokemohr', country: 'GER', pts: 2180, events: 9,  cat: 'elite', gender: 'female' },
  { pos: 1, name: 'David M.',    country: 'ESP', pts: 2650, events: 10, cat: 'elite', gender: 'male' },
  { pos: 2, name: 'Jonas S.',    country: 'SWE', pts: 2480, events: 12, cat: 'elite', gender: 'male' },
  { pos: 3, name: 'Carlos R.',   country: 'COL', pts: 2310, events: 8,  cat: 'elite', gender: 'male' },
]

export default function ResultsPage({ user, authLoading }) {
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [tab, setTab] = useState('ranking')
  const [events, setEvents] = useState([])
  const [filterDisc, setFilterDisc] = useState('all')
  const [filterGender, setFilterGender] = useState('all')
  const L = lang === 'es'

  useEffect(() => {
    getSupabase().from('events').select('id, name, location, event_date, disciplines, track_type').eq('is_published', true).order('event_date', { ascending: false }).then(({ data }) => { if (data) setEvents(data) })
  }, [])

  const filteredRanking = SAMPLE_RANKING.filter(r => {
    if (filterGender !== 'all' && r.gender !== filterGender) return false
    return true
  })

  const femaleRanking = filteredRanking.filter(r => r.gender === 'female')
  const maleRanking = filteredRanking.filter(r => r.gender === 'male')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px' }}>
        <PageHeader
          title={L ? 'Resultados' : 'Results'}
          sub={L ? 'Ranking mundial OCR en vivo · Resultados de todos los eventos' : 'Live OCR world ranking · Results from all events'}
        />

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {[['ranking', `🌍 ${L ? 'Ranking mundial' : 'World ranking'}`], ['events', L ? 'Por evento' : 'By event']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer', color: tab === id ? 'var(--blue)' : 'var(--text-muted)', fontWeight: tab === id ? 700 : 400, fontSize: 13, fontFamily: 'var(--font)', borderBottom: `2px solid ${tab === id ? 'var(--blue)' : 'transparent'}` }}>{label}</button>
          ))}
        </div>

        {tab === 'ranking' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={filterDisc} onChange={e => setFilterDisc(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontFamily: 'var(--font)', outline: 'none', background: 'var(--gray-alt)', color: 'var(--text)' }}>
                <option value="all">{L ? 'Todas las modalidades' : 'All disciplines'}</option>
                {DISCIPLINES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
              <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontFamily: 'var(--font)', outline: 'none', background: 'var(--gray-alt)', color: 'var(--text)' }}>
                <option value="all">{L ? 'Todos' : 'All'}</option>
                <option value="female">{L ? 'Femenino' : 'Female'}</option>
                <option value="male">{L ? 'Masculino' : 'Male'}</option>
              </select>
            </div>

            {/* Points explanation */}
            <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue)33', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--blue)' }}>
              {L
                ? '🏟 Pista oficial: 100% puntos · Pista adaptada: 70% · 1° × 2.0 · 2° × 1.5 · 3° × 1.2 · Participación × 1.0'
                : '🏟 Official track: 100% points · Adapted: 70% · 1st × 2.0 · 2nd × 1.5 · 3rd × 1.2 · Participation × 1.0'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Female ranking */}
              {(filterGender === 'all' || filterGender === 'female') && (
                <Card>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Elite {L ? 'Femenino' : 'Female'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>· Temporada 2025</span>
                  </div>
                  {femaleRanking.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                      <RankNum pos={i} />
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>{r.name[0]}</div>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                      <span style={{ fontSize: 13 }}>{getFlag(r.country)}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.events}ev</span>
                      <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 15 }}>{r.pts}<span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>pts</span></span>
                    </div>
                  ))}
                </Card>
              )}

              {/* Male ranking */}
              {(filterGender === 'all' || filterGender === 'male') && (
                <Card>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Elite {L ? 'Masculino' : 'Male'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>· Temporada 2025</span>
                  </div>
                  {maleRanking.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                      <RankNum pos={i} />
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--blue)', flexShrink: 0 }}>{r.name[0]}</div>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                      <span style={{ fontSize: 13 }}>{getFlag(r.country)}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.events}ev</span>
                      <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 15 }}>{r.pts}<span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)' }}>pts</span></span>
                    </div>
                  ))}
                </Card>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {L ? '(Atletas a modo de ejemplo — el ranking se actualiza automáticamente al publicar resultados oficiales)' : '(Sample athletes — ranking updates automatically when official results are published)'}
            </div>
          </div>
        )}

        {tab === 'events' && (
          <div>
            {events.length === 0 ? (
              <Empty label={L ? 'No hay resultados publicados aún' : 'No results published yet'} />
            ) : events.map(e => (
              <Card key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      {e.location} · {e.event_date ? new Date(e.event_date).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {e.track_type === 'official' && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', background: 'var(--green-bg)', padding: '2px 8px', borderRadius: 10 }}>OFFICIAL</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {(e.disciplines || []).map(dId => { const d = DISCIPLINES.find(x => x.id === dId); return d ? <span key={dId} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, color: d.color, background: d.color + '15', fontWeight: 600 }}>{d.label}</span> : null })}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {L ? 'Resultados pendientes de publicación' : 'Results pending publication'}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
