import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, StopCircle, Plus, X, Search, Clock, Download } from 'lucide-react'
import { Btn, Card, Bib, CatBadge, Empty, Counter, WristbandDots, StatusBadge } from '../ui'
import { formatTime, calcXCResult, buildWAMessage, getFlag, DISCIPLINES } from '../../lib/constants'

// ═══════════════════════════════════════════════════════════════════════════════
// WAVE TIMING — Two modes: Button-per-athlete + Bib Entry
// ═══════════════════════════════════════════════════════════════════════════════

export default function WaveTiming({ event, discipline, athletes, registrations, lang, onPublish }) {
  const [mode, setMode] = useState('wave') // 'wave' | 'bib'
  const [waves, setWaves] = useState([])
  const [activeWaveId, setActiveWaveId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [postRace, setPostRace] = useState({}) // waveId → {athleteId: {bandsLost, pl, chipTime}}
  const [ticker, setTicker] = useState(0)
  const L = lang === 'es'

  const disc = DISCIPLINES.find(d => d.id === discipline)
  const isXC = ['short', 'standard'].includes(discipline)

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTicker(x => x + 1), 100)
    return () => clearInterval(t)
  }, [])

  const eligibleAthletes = registrations
    .filter(r => r.disc === discipline)
    .map(r => athletes.find(a => a.id === r.athId))
    .filter(Boolean)

  const createWave = (waveName, category, memberIds) => {
    const wave = {
      id: Date.now().toString(),
      name: waveName, category, discipline,
      members: memberIds,
      startTs: null, finishes: {}, status: 'pending'
    }
    setWaves(prev => [...prev, wave])
    setShowCreate(false)
  }

  const startWave = (waveId) => {
    setWaves(prev => prev.map(w => w.id !== waveId ? w : { ...w, startTs: performance.now() + Date.now() - performance.now(), startWall: Date.now(), status: 'running' }))
    setActiveWaveId(waveId)
  }

  const markFinish = useCallback((waveId, athId) => {
    setWaves(prev => prev.map(w => {
      if (w.id !== waveId || !w.startWall || w.finishes[athId]) return w
      const elapsed = (Date.now() - w.startWall) / 1000
      return { ...w, finishes: { ...w.finishes, [athId]: elapsed } }
    }))
  }, [])

  const undoFinish = (waveId, athId) => {
    setWaves(prev => prev.map(w => {
      if (w.id !== waveId) return w
      const f = { ...w.finishes }; delete f[athId]
      return { ...w, finishes: f }
    }))
  }

  const getElapsed = (wave) => {
    if (!wave.startWall) return 0
    return (Date.now() - wave.startWall) / 1000
  }

  const updatePostRace = (waveId, athId, field, val) => {
    setPostRace(prev => ({
      ...prev, [waveId]: {
        ...(prev[waveId] || {}),
        [athId]: { ...(prev[waveId]?.[athId] || { bandsLost: 0, pl: 0 }), [field]: val }
      }
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 8, background: 'var(--gray-alt)', padding: 4, borderRadius: 8, width: 'fit-content' }}>
        {[['wave', L ? 'Botón por atleta' : 'Button per athlete'], ['bib', L ? 'Ingreso de dorsal' : 'Bib entry']].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)} style={{
            padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
            background: mode === id ? '#fff' : 'transparent',
            color: mode === id ? 'var(--text)' : 'var(--text-muted)',
            boxShadow: mode === id ? 'var(--shadow-sm)' : 'none',
            cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {mode === 'wave' && (
        <>
          {/* Create wave button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn onClick={() => setShowCreate(true)} icon={<Plus size={13} />} size="sm">
              {L ? 'Nueva oleada' : 'New wave'}
            </Btn>
          </div>

          {showCreate && (
            <CreateWaveForm athletes={eligibleAthletes} onCancel={() => setShowCreate(false)} onCreate={createWave} lang={lang} />
          )}

          {waves.length === 0 && !showCreate && (
            <Empty label={L ? 'Creá una oleada para empezar a cronometrar' : 'Create a wave to start timing'} />
          )}

          {waves.map(wave => (
            <WaveCard key={wave.id} wave={wave} athletes={athletes}
              elapsed={getElapsed(wave)} onStart={() => startWave(wave.id)}
              onFinish={athId => markFinish(wave.id, athId)}
              onUndo={athId => undoFinish(wave.id, athId)}
              postRace={postRace[wave.id] || {}}
              onUpdatePostRace={(athId, f, v) => updatePostRace(wave.id, athId, f, v)}
              isXC={isXC} lang={lang} event={event} discipline={discipline}
            />
          ))}
        </>
      )}

      {mode === 'bib' && (
        <BibEntryMode athletes={eligibleAthletes} isXC={isXC} lang={lang} event={event} discipline={discipline} />
      )}
    </div>
  )
}

// ── CREATE WAVE FORM ──────────────────────────────────────────────────────────
function CreateWaveForm({ athletes, onCancel, onCreate, lang }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('elite')
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')
  const L = lang === 'es'

  const filtered = athletes.filter(a =>
    search === '' ||
    a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.bib?.includes(search)
  ).filter(a => !selected.includes(a.id))

  return (
    <Card style={{ border: '2px solid var(--blue)' }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{L ? 'Nueva oleada' : 'New wave'}</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={L ? 'Nombre (ej: Elite Femenino Pasada 1)' : 'Name (e.g. Elite Female Run 1)'}
          style={{ flex: 2, minWidth: 200, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }} />
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ flex: 1, minWidth: 120, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none' }}>
          <option value="elite">Elite</option>
          <option value="agegroup">Age Group</option>
          <option value="open">Open</option>
        </select>
      </div>

      {/* Selected athletes chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {selected.map(id => {
            const a = athletes.find(x => x.id === id)
            return a ? (
              <span key={id} style={{ fontSize: 11, padding: '3px 8px', background: 'var(--blue-bg)', color: 'var(--blue)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                #{a.bib} {a.full_name}
                <button onClick={() => setSelected(s => s.filter(x => x !== id))} style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', padding: 0, lineHeight: 1 }}><X size={10} /></button>
              </span>
            ) : null
          })}
        </div>
      )}

      {/* Search athletes */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={L ? 'Buscar por nombre o dorsal' : 'Search by name or bib'}
          style={{ width: '100%', padding: '7px 10px 7px 30px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 14, border: '1px solid var(--border)', borderRadius: 7 }}>
        {filtered.map(a => (
          <div key={a.id} onClick={() => setSelected(s => [...s, a.id])}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <Bib n={a.bib} />
            <span style={{ flex: 1 }}>{a.full_name}</span>
            <span style={{ color: 'var(--text-muted)' }}>{getFlag(a.country)}</span>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>{L ? 'Sin resultados' : 'No results'}</div>}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Btn onClick={() => { if (name.trim() && selected.length > 0) onCreate(name, category, selected) }} icon={<Plus size={13} />}>
          {L ? 'Crear oleada' : 'Create wave'}
        </Btn>
        <Btn onClick={onCancel} variant="ghost">{L ? 'Cancelar' : 'Cancel'}</Btn>
      </div>
    </Card>
  )
}

// ── WAVE CARD ─────────────────────────────────────────────────────────────────
function WaveCard({ wave, athletes, elapsed, onStart, onFinish, onUndo, postRace, onUpdatePostRace, isXC, lang, event, discipline }) {
  const L = lang === 'es'
  const running = !!wave.startWall
  const allDone = wave.members.length > 0 && wave.members.every(id => wave.finishes[id])

  return (
    <Card>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{wave.name}</span>
            {running && !allDone && (
              <span style={{ fontSize: 10, color: 'var(--green)', background: 'var(--green-bg)', padding: '2px 8px', borderRadius: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ animation: 'pulse 1s infinite' }}>●</span> LIVE
              </span>
            )}
            {allDone && <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--gray-alt)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>DONE</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <CatBadge cat={wave.category} /> · {wave.members.length} {L ? 'atletas' : 'athletes'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {running && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 800, color: 'var(--green)', minWidth: 100, textAlign: 'right' }}>
              {formatTime(elapsed, true)}
            </div>
          )}
          {!running && (
            <Btn onClick={onStart} variant="success" icon={<Play size={14} />} size="lg">
              START
            </Btn>
          )}
        </div>
      </div>

      {/* Athlete rows */}
      <div>
        {wave.members.map(id => {
          const a = athletes.find(x => x.id === id)
          if (!a) return null
          const ft = wave.finishes[id]
          const pr = postRace[id] || { bandsLost: 0, pl: 0 }
          const maxBands = a.is_adaptive ? 5 : 3
          const xcResult = isXC && ft ? calcXCResult(String(ft), pr.bandsLost, pr.pl, a.is_adaptive) : null

          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <Bib n={a.bib} />
              <span style={{ flex: 1, fontWeight: 600, minWidth: 120 }}>{a.full_name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{getFlag(a.country)} {a.country}</span>

              {ft ? (
                <>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--green)', fontSize: 16, minWidth: 90, textAlign: 'right' }}>
                    {formatTime(ft, true)}
                  </span>
                  {isXC && (
                    <>
                      <WristbandDots total={maxBands} lost={pr.bandsLost} recovered={Math.min(pr.pl, pr.bandsLost, 2)} />
                      <Counter value={pr.bandsLost} max={maxBands} onChange={v => onUpdatePostRace(id, 'bandsLost', v)} color="var(--red)" label="bands" />
                      <Counter value={pr.pl} max={Math.min(pr.bandsLost, 2)} onChange={v => onUpdatePostRace(id, 'pl', v)} color="var(--blue)" label="PL" />
                      {xcResult && <StatusBadge status={xcResult.status} />}
                    </>
                  )}
                  <button onClick={() => onUndo(id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11, textDecoration: 'underline' }}>undo</button>
                  {/* WhatsApp */}
                  {a.whatsapp && (
                    <a href={`https://wa.me/${a.whatsapp.replace(/\D/g, '')}?text=${buildWAMessage(a, event, discipline, '?', formatTime(ft, true))}`}
                      target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid #0A7A5033', borderRadius: 5, padding: '2px 8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                      📱 Send
                    </a>
                  )}
                </>
              ) : running ? (
                <button onClick={() => onFinish(id)} style={{
                  padding: '8px 20px', background: 'var(--red)', border: 'none', borderRadius: 7,
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5
                }}>
                  <StopCircle size={14} /> FINISH
                </button>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{L ? 'En espera' : 'Waiting'}</span>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ── BIB ENTRY MODE ────────────────────────────────────────────────────────────
function BibEntryMode({ athletes, isXC, lang, event, discipline }) {
  const [started, setStarted] = useState(false)
  const [startWall, setStartWall] = useState(null)
  const [entries, setEntries] = useState([]) // [{athlete, time, bib}]
  const [bibInput, setBibInput] = useState('')
  const [lastEntry, setLastEntry] = useState(null)
  const [ticker, setTicker] = useState(0)
  const inputRef = useRef(null)
  const L = lang === 'es'

  useEffect(() => { if (!started) return; const t = setInterval(() => setTicker(x => x + 1), 100); return () => clearInterval(t) }, [started])

  const elapsed = started ? (Date.now() - startWall) / 1000 : 0

  const handleBibSubmit = () => {
    if (!bibInput.trim() || !started) return
    const bib = bibInput.trim()
    const athlete = athletes.find(a => a.bib === bib)
    const time = (Date.now() - startWall) / 1000
    const entry = { id: Date.now(), bib, athlete, time }
    setEntries(prev => [...prev, entry])
    setLastEntry(entry)
    setBibInput('')
    setTimeout(() => setLastEntry(null), 2000)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const undoLast = () => setEntries(prev => prev.slice(0, -1))

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Left: timer + input */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Stopwatch */}
        <Card style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 800, color: started ? 'var(--green)' : 'var(--text-muted)', letterSpacing: '-0.02em' }}>
            {formatTime(elapsed, true)}
          </div>
          {!started ? (
            <Btn onClick={() => { setStarted(true); setStartWall(Date.now()) }} variant="success" icon={<Play size={16} />} size="xl" style={{ marginTop: 16 }}>
              START RACE
            </Btn>
          ) : (
            <div style={{ color: 'var(--green)', fontSize: 12, marginTop: 8, animation: 'pulse 1s infinite' }}>● {L ? 'CARRERA EN CURSO' : 'RACE IN PROGRESS'}</div>
          )}
        </Card>

        {/* Bib input */}
        {started && (
          <Card>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: 'var(--text-muted)' }}>
              {L ? 'Ingresá el dorsal del atleta que llega:' : 'Enter the finishing athlete\'s bib:'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input ref={inputRef} autoFocus value={bibInput} onChange={e => setBibInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleBibSubmit() }}
                placeholder={L ? 'Dorsal + Enter' : 'Bib + Enter'}
                style={{ flex: 1, padding: '12px 14px', border: '2px solid var(--blue)', borderRadius: 7, fontSize: 20, fontFamily: 'var(--font-mono)', fontWeight: 700, outline: 'none', textAlign: 'center' }}
              />
              <Btn onClick={handleBibSubmit} variant="success" size="lg">OK</Btn>
            </div>
            {lastEntry && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 7, fontSize: 13, color: 'var(--green)', fontWeight: 600, animation: 'fadeIn 0.2s ease' }}>
                ✓ #{lastEntry.bib} {lastEntry.athlete ? lastEntry.athlete.full_name : '(not found)'} — {formatTime(lastEntry.time, true)}
              </div>
            )}
            <button onClick={undoLast} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
              {L ? 'Deshacer último' : 'Undo last entry'}
            </button>
          </Card>
        )}
      </div>

      {/* Right: results list */}
      <div style={{ width: 320 }}>
        <Card style={{ maxHeight: 500, overflowY: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
            {L ? 'Llegadas' : 'Finishes'} ({entries.length})
          </div>
          {entries.length === 0 && <Empty label={L ? 'Sin llegadas registradas' : 'No finishes recorded'} />}
          {[...entries].reverse().map((e, i) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)', width: 24, textAlign: 'right' }}>{entries.length - i}</span>
              <span style={{ fontWeight: 700, color: e.athlete ? 'var(--text)' : 'var(--red)' }}>#{e.bib}</span>
              <span style={{ flex: 1, color: e.athlete ? 'var(--text)' : 'var(--text-muted)' }}>
                {e.athlete ? e.athlete.full_name : `(${L ? 'no encontrado' : 'not found'})`}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green)', fontSize: 14 }}>
                {formatTime(e.time, true)}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
