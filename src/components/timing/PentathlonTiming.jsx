import { useState } from 'react'
import { Shuffle, CheckCircle, RotateCcw, Zap } from 'lucide-react'
import { Btn, Card, Bib, CatBadge, Empty, TimeCell, RankNum } from '../ui'
import { buildBracket, bestOf, formatTime, groupKey, getFlag, AGE_GROUPS, PENTATHLON_FIXED, PENTATHLON_POOL } from '../../lib/constants'

export default function PentathlonTiming({ athletes, registrations, lang }) {
  const [sub, setSub] = useState('draw')
  const [draw, setDraw] = useState({ obsA: null, obsB: null, drawn: false, drawnAt: null })
  const [qualTimes, setQualTimes] = useState({})
  const [brackets, setBrackets] = useState({})
  const [activeBK, setActiveBK] = useState(null)
  const L = lang === 'es'

  const regs = registrations.filter(r => r.disc === 'pentathlon')

  const doDraw = () => {
    const pool = [...PENTATHLON_POOL]
    const i1 = Math.floor(Math.random() * pool.length)
    const obsA = pool.splice(i1, 1)[0]
    const i2 = Math.floor(Math.random() * pool.length)
    const obsB = pool[i2]
    setDraw({ obsA, obsB, drawn: true, drawnAt: new Date().toLocaleTimeString() })
    setSub('qual')
  }

  const groups = {}
  regs.forEach(r => {
    const a = athletes.find(x => x.id === r.athId)
    if (!a) return
    const k = groupKey(r.cat, r.ag, a.gender)
    if (!groups[k]) groups[k] = []
    const qt = qualTimes[a.id] || {}
    groups[k].push({ ...a, best: bestOf(qt.r1, qt.r2), cat: r.cat, ag: r.ag })
  })
  Object.values(groups).forEach(g => g.sort((a, b) => !a.best ? 1 : !b.best ? -1 : a.best - b.best))

  const setQ = (athId, run, val) =>
    setQualTimes(prev => ({ ...prev, [athId]: { ...(prev[athId] || {}), [run]: val } }))

  const generateBrackets = () => {
    const nb = {}
    Object.entries(groups).forEach(([k, g]) => {
      const qualified = g.filter(a => a.best != null)
      const isElite = k.startsWith('elite_')
      const top = isElite ? qualified.slice(0, 16) : qualified.slice(0, 8)
      if (top.length >= 2) nb[k] = buildBracket(top)
    })
    setBrackets(nb)
    setActiveBK(Object.keys(nb)[0])
    setSub('brackets')
  }

  const setWinner = (bk, rIdx, mIdx, winner) => {
    setBrackets(prev => {
      const nb = JSON.parse(JSON.stringify(prev))
      nb[bk].rounds[rIdx][mIdx].winner = winner
      if (rIdx + 1 < nb[bk].rounds.length) {
        const nx = Math.floor(mIdx / 2)
        if (mIdx % 2 === 0) nb[bk].rounds[rIdx + 1][nx].a = winner
        else nb[bk].rounds[rIdx + 1][nx].b = winner
      }
      return nb
    })
  }

  const updMatchTime = (bk, rIdx, mIdx, field, val) => {
    setBrackets(prev => {
      const nb = JSON.parse(JSON.stringify(prev))
      nb[bk].rounds[rIdx][mIdx][field] = val
      return nb
    })
  }

  const bkLabel = (k) => {
    if (k.startsWith('elite_')) {
      const g = k.split('_')[1]
      return `Elite · ${g === 'male' ? 'M' : 'F'}`
    }
    const [, ag, g] = k.split('_')
    return `${AGE_GROUPS.find(x => x.id === ag)?.label || ag} · ${g === 'male' ? 'M' : 'F'}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)' }}>
        {[['draw', `🎲 ${L ? 'Sorteo' : 'Draw'}`], ['qual', L ? 'Clasificación' : 'Qualifying'], ['brackets', 'Brackets']].map(([id, label]) => (
          <button key={id} onClick={() => setSub(id)} style={{ padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', color: sub === id ? 'var(--navy)' : 'var(--text-muted)', fontWeight: sub === id ? 700 : 400, fontSize: 13, fontFamily: 'var(--font)', borderBottom: `2px solid ${sub === id ? 'var(--navy)' : 'transparent'}` }}>{label}</button>
        ))}
      </div>

      {/* DRAW */}
      {sub === 'draw' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              🔒 {L ? 'Obstáculos fijos (siempre presentes)' : 'Fixed obstacles (always present)'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PENTATHLON_FIXED.map((o, i) => (
                <span key={i} style={{ fontSize: 12, padding: '4px 11px', background: 'var(--blue-bg)', border: '1px solid var(--blue)', borderRadius: 5, color: 'var(--blue)', fontWeight: 500 }}>
                  {i + 1}. {o}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              🎲 {L ? 'Pool de obstáculos sorteables' : 'Drawable obstacles pool'} ({PENTATHLON_POOL.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {PENTATHLON_POOL.map((o, i) => (
                <span key={i} style={{ fontSize: 11, padding: '3px 9px', background: 'var(--gray-alt)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-sec)' }}>{o}</span>
              ))}
            </div>
          </Card>

          {draw.drawn ? (
            <Card style={{ border: '1.5px solid var(--blue)', background: 'var(--blue-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <CheckCircle size={16} color="var(--blue)" />
                <span style={{ fontWeight: 700, color: 'var(--blue)', fontSize: 13 }}>
                  {L ? 'Sorteo realizado' : 'Draw completed'} — {draw.drawnAt}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[draw.obsA, draw.obsB].map((o, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '16px', background: '#fff', border: '1.5px solid var(--blue)', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {L ? 'Obstáculo sorteado' : 'Drawn obstacle'} {i + 1}
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: 18 }}>{o}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-sec)', marginBottom: 7 }}>
                  {L ? 'Circuito completo (8 obstáculos):' : 'Full circuit (8 obstacles):'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {[...PENTATHLON_FIXED, draw.obsA, draw.obsB].map((o, i) => (
                    <span key={i} style={{ fontSize: 12, padding: '4px 10px', background: i >= PENTATHLON_FIXED.length ? 'var(--blue)' : 'var(--gray-alt)', border: `1px solid ${i >= PENTATHLON_FIXED.length ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 4, color: i >= PENTATHLON_FIXED.length ? '#fff' : 'var(--text-sec)', fontWeight: i >= PENTATHLON_FIXED.length ? 700 : 400 }}>
                      {i + 1}. {o}{i >= PENTATHLON_FIXED.length ? ' 🎲' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <Btn onClick={doDraw} variant="ghost" icon={<RotateCcw size={13} />} size="sm">
                {L ? 'Nuevo sorteo' : 'New draw'}
              </Btn>
            </Card>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Btn onClick={doDraw} icon={<Shuffle size={18} />} size="xl" style={{ fontSize: 16 }}>
                🎲 {L ? 'Realizar sorteo de obstáculos' : 'Perform obstacle draw'}
              </Btn>
            </div>
          )}
        </div>
      )}

      {/* QUALIFYING */}
      {sub === 'qual' && (
        <>
          {draw.drawn && (
            <div style={{ fontSize: 12, color: 'var(--blue)', background: 'var(--blue-bg)', border: '1px solid var(--blue)33', borderRadius: 6, padding: '6px 12px' }}>
              🎲 {L ? 'Sorteados:' : 'Drawn:'} <strong>{draw.obsA}</strong> + <strong>{draw.obsB}</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {L ? 'Elite: top 16 avanzan · Age Group: top 8 avanzan' : 'Elite: top 16 advance · Age Group: top 8 advance'}
            </div>
            <Btn onClick={generateBrackets} icon={<Zap size={13} />} size="sm">
              {L ? 'Generar brackets' : 'Generate brackets'}
            </Btn>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Pos', 'Dorsal', 'Atleta', 'País', 'Cat.', 'Run 1', 'Run 2', 'Mejor'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regs.map((r, i) => {
                const a = athletes.find(x => x.id === r.athId)
                if (!a) return null
                const qt = qualTimes[a.id] || {}
                const best = bestOf(qt.r1, qt.r2)
                const grp = groups[groupKey(r.cat, r.ag, a.gender)] || []
                const pos = grp.findIndex(x => x.id === a.id)
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 10px' }}><RankNum pos={best != null ? pos : null} /></td>
                    <td style={{ padding: '9px 10px' }}><Bib n={a.bib} /></td>
                    <td style={{ padding: '9px 10px', fontWeight: 600 }}>{a.full_name}</td>
                    <td style={{ padding: '9px 10px' }}>{getFlag(a.country)} {a.country}</td>
                    <td style={{ padding: '9px 10px' }}><CatBadge cat={r.cat} /></td>
                    <td style={{ padding: '9px 10px' }}><TimeCell value={qt.r1} onChange={v => setQ(a.id, 'r1', v)} width={90} /></td>
                    <td style={{ padding: '9px 10px' }}><TimeCell value={qt.r2} onChange={v => setQ(a.id, 'r2', v)} width={90} /></td>
                    <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--navy)', fontSize: 15 }}>
                      {best != null ? formatTime(best) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      {/* BRACKETS */}
      {sub === 'brackets' && (
        <>
          {Object.keys(brackets).length === 0 ? (
            <Empty label={L ? 'Generá los brackets desde Clasificación' : 'Generate brackets from Qualifying'} />
          ) : (
            <>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {Object.keys(brackets).map(k => (
                  <button key={k} onClick={() => setActiveBK(k)} style={{ padding: '4px 12px', border: `1px solid ${activeBK === k ? 'var(--navy)' : 'var(--border)'}`, borderRadius: 16, background: activeBK === k ? 'var(--navy)' : 'transparent', color: activeBK === k ? '#fff' : 'var(--text-sec)', fontSize: 12, fontWeight: activeBK === k ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font)' }}>{bkLabel(k)}</button>
                ))}
              </div>
              {activeBK && brackets[activeBK] && (
                <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 18, minWidth: 'max-content' }}>
                    {brackets[activeBK].rounds.map((round, rIdx) => (
                      <div key={rIdx} style={{ minWidth: 220 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: 6, borderBottom: '2px solid var(--navy)', marginBottom: 8 }}>
                          {brackets[activeBK].names[rIdx]}
                        </div>
                        {round.map((match, mIdx) => (
                          <div key={match.id} style={{ background: '#fff', border: `1px solid ${rIdx === brackets[activeBK].rounds.length - 1 ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 12px', marginBottom: 8, boxShadow: 'var(--shadow-sm)' }}>
                            {[{ a: match.a, t: match.tA, f: 'tA' }, { a: match.b, t: match.tB, f: 'tB' }].map((lane, i) => (
                              <div key={i}>
                                {i === 1 && <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', padding: '3px 0' }}>VS</div>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ flex: 1, fontWeight: lane.a ? 600 : 400, color: match.winner?.id === lane.a?.id ? 'var(--green)' : lane.a ? 'var(--text)' : 'var(--text-muted)', fontSize: 12 }}>
                                    {lane.a ? `#${lane.a.bib} ${lane.a.full_name}` : <span style={{ color: 'var(--text-muted)' }}>BYE</span>}
                                  </span>
                                  <TimeCell value={lane.t} onChange={v => updMatchTime(activeBK, rIdx, mIdx, lane.f, v)} width={80} />
                                </div>
                              </div>
                            ))}
                            {match.a && match.b && !match.winner && (
                              <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
                                <button onClick={() => setWinner(activeBK, rIdx, mIdx, match.a)} style={{ flex: 1, padding: '4px', background: 'var(--gray-alt)', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text-sec)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font)' }}>↑ {match.a.full_name.split(' ')[0]}</button>
                                <button onClick={() => setWinner(activeBK, rIdx, mIdx, match.b)} style={{ flex: 1, padding: '4px', background: 'var(--gray-alt)', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text-sec)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font)' }}>↑ {match.b.full_name.split(' ')[0]}</button>
                              </div>
                            )}
                            {match.winner && <div style={{ fontSize: 10, color: 'var(--green)', textAlign: 'center', paddingTop: 5, borderTop: '1px solid var(--border)', marginTop: 3 }}>✓ {match.winner.full_name}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                    {brackets[activeBK].rounds[brackets[activeBK].rounds.length - 1][0]?.winner && (
                      <div style={{ minWidth: 180 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: 6, borderBottom: '2px solid var(--gold)', marginBottom: 8 }}>🏆 CHAMPION</div>
                        <div style={{ background: 'var(--gold-bg)', border: '1.5px solid var(--gold)', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
                          <div style={{ fontSize: 36, marginBottom: 8 }}>🥇</div>
                          <div style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16 }}>{brackets[activeBK].rounds[brackets[activeBK].rounds.length - 1][0].winner.full_name}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
