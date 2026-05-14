import { useState } from 'react'
import { Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { Btn, Card, Bib, CatBadge, Empty, TimeCell, RankNum } from '../ui'
import { buildBracket, bestOf, formatTime, groupKey, getFlag, AGE_GROUPS } from '../../lib/constants'

// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT TIMING — OCR 100m / 400m
// 2 qualifying runs → best time → bracket elimination
// ═══════════════════════════════════════════════════════════════════════════════

export default function SprintTiming({ discipline, athletes, registrations, lang }) {
  const [sub, setSub] = useState('qual') // 'qual' | 'brackets'
  const [qualTimes, setQualTimes] = useState({}) // {athId: {r1, r2}}
  const [brackets, setBrackets] = useState({}) // {groupKey: bracketObj}
  const [activeBK, setActiveBK] = useState(null)
  const isMin = discipline === 'ocr400'
  const L = lang === 'es'

  const regs = registrations.filter(r => r.disc === discipline)

  // Build ranking groups
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
      if (qualified.length >= 2) nb[k] = buildBracket(qualified)
    })
    setBrackets(nb)
    const first = Object.keys(nb)[0]
    setActiveBK(first)
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
      return `Elite · ${g === 'male' ? (L ? 'Masculino' : 'Male') : (L ? 'Femenino' : 'Female')}`
    }
    const [, ag, g] = k.split('_')
    const agLabel = AGE_GROUPS.find(x => x.id === ag)?.label || ag
    return `${agLabel} · ${g === 'male' ? 'M' : 'F'}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)' }}>
        {[['qual', L ? 'Clasificación' : 'Qualifying'], ['brackets', 'Brackets']].map(([id, label]) => (
          <button key={id} onClick={() => setSub(id)} style={{
            padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
            color: sub === id ? 'var(--blue)' : 'var(--text-muted)',
            fontWeight: sub === id ? 700 : 400, fontSize: 13, fontFamily: 'var(--font)',
            borderBottom: `2px solid ${sub === id ? 'var(--blue)' : 'transparent'}`,
          }}>{label}</button>
        ))}
      </div>

      {sub === 'qual' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn onClick={generateBrackets} icon={<Zap size={13} />}>
              {L ? 'Generar brackets' : 'Generate brackets'}
            </Btn>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {[L ? 'Pos' : 'Rank', 'Dorsal', L ? 'Atleta' : 'Athlete', L ? 'País' : 'Country', 'Cat.', L ? 'Grupo' : 'Group', L ? 'Pasada 1' : 'Run 1', L ? 'Pasada 2' : 'Run 2', L ? 'Mejor' : 'Best'].map((h, i) => (
                    <th key={i} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
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
                      <td style={{ padding: '9px 10px', color: 'var(--text-muted)', fontSize: 12 }}>
                        {r.cat === 'elite' ? '—' : (AGE_GROUPS.find(g => g.id === r.ag)?.label || r.ag)}
                      </td>
                      <td style={{ padding: '9px 10px' }}><TimeCell value={qt.r1} onChange={v => setQ(a.id, 'r1', v)} isMinutes={isMin} /></td>
                      <td style={{ padding: '9px 10px' }}><TimeCell value={qt.r2} onChange={v => setQ(a.id, 'r2', v)} isMinutes={isMin} /></td>
                      <td style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--blue)', fontSize: 15 }}>
                        {best != null ? formatTime(best, isMin) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {sub === 'brackets' && (
        <>
          {Object.keys(brackets).length === 0 ? (
            <Empty label={L ? 'Generá los brackets desde Clasificación' : 'Generate brackets from Qualifying'} />
          ) : (
            <>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {Object.keys(brackets).map(k => (
                  <button key={k} onClick={() => setActiveBK(k)} style={{
                    padding: '4px 12px', border: `1px solid ${activeBK === k ? 'var(--blue)' : 'var(--border)'}`,
                    borderRadius: 16, background: activeBK === k ? 'var(--blue-bg)' : 'transparent',
                    color: activeBK === k ? 'var(--blue)' : 'var(--text-sec)',
                    fontSize: 12, fontWeight: activeBK === k ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>{bkLabel(k)}</button>
                ))}
              </div>
              {activeBK && brackets[activeBK] && (
                <BracketView bk={brackets[activeBK]} bkKey={activeBK}
                  onWin={(r, m, w) => setWinner(activeBK, r, m, w)}
                  onTime={(r, m, f, v) => updMatchTime(activeBK, r, m, f, v)}
                  isMin={isMin} lang={lang}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── BRACKET VIEW ──────────────────────────────────────────────────────────────
function BracketView({ bk, onWin, onTime, isMin, lang }) {
  const L = lang === 'es'
  const champion = bk.rounds[bk.rounds.length - 1][0]?.winner

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
      <div style={{ display: 'flex', gap: 18, minWidth: 'max-content' }}>
        {bk.rounds.map((round, rIdx) => (
          <div key={rIdx} style={{ minWidth: 220 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: 6, borderBottom: '2px solid var(--blue)', marginBottom: 8 }}>
              {bk.names[rIdx]}
            </div>
            {round.map((match, mIdx) => (
              <MatchBox key={match.id} match={match} isFinal={rIdx === bk.rounds.length - 1}
                onWin={w => onWin(rIdx, mIdx, w)}
                onTimeA={v => onTime(rIdx, mIdx, 'tA', v)}
                onTimeB={v => onTime(rIdx, mIdx, 'tB', v)}
                isMin={isMin} lang={lang}
              />
            ))}
          </div>
        ))}
        {champion && (
          <div style={{ minWidth: 180 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: 6, borderBottom: '2px solid var(--gold)', marginBottom: 8 }}>
              {L ? 'CAMPEÓN' : 'CHAMPION'}
            </div>
            <div style={{ background: 'var(--gold-bg)', border: '1.5px solid var(--gold)', borderRadius: 10, padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🥇</div>
              <div style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16 }}>{champion.full_name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                {getFlag(champion.country)} {champion.country} · #{champion.bib}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MatchBox({ match, isFinal, onWin, onTimeA, onTimeB, isMin, lang }) {
  const { a, b, winner, tA, tB } = match
  const L = lang === 'es'
  return (
    <div style={{ background: '#fff', border: `1px solid ${isFinal ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 12px', marginBottom: 8, boxShadow: 'var(--shadow-sm)' }}>
      {[{ athlete: a, time: tA, onT: onTimeA }, { athlete: b, time: tB, onT: onTimeB }].map((lane, i) => (
        <div key={i}>
          {i === 1 && <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', padding: '3px 0', letterSpacing: '0.2em' }}>VS</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', width: 20, flexShrink: 0 }}>L{i + 1}</span>
            <span style={{ flex: 1, fontWeight: lane.athlete ? 600 : 400, color: winner?.id === lane.athlete?.id ? 'var(--green)' : lane.athlete ? 'var(--text)' : 'var(--text-muted)', fontSize: 12 }}>
              {lane.athlete ? <span><span style={{ fontSize: 9, color: 'var(--blue)', marginRight: 3 }}>#{lane.athlete.bib}</span>{lane.athlete.full_name}</span> : <span style={{ color: 'var(--text-muted)' }}>BYE</span>}
            </span>
            <TimeCell value={lane.time} onChange={lane.onT} isMinutes={isMin} width={80} />
          </div>
        </div>
      ))}
      {a && b && !winner && (
        <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
          <button onClick={() => onWin(a)} style={{ flex: 1, padding: '4px 6px', background: 'var(--gray-alt)', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text-sec)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}>
            ↑ {a.full_name.split(' ')[0]}
          </button>
          <button onClick={() => onWin(b)} style={{ flex: 1, padding: '4px 6px', background: 'var(--gray-alt)', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text-sec)', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}>
            ↑ {b.full_name.split(' ')[0]}
          </button>
        </div>
      )}
      {winner && (
        <div style={{ fontSize: 10, color: 'var(--green)', textAlign: 'center', paddingTop: 5, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 3 }}>
          ✓ {L ? 'Ganador' : 'Winner'}: {winner.full_name}
        </div>
      )}
    </div>
  )
}
