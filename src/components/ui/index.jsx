import { useState } from 'react'

// ── BUTTON ──────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', icon, loading, disabled, style, type = 'button' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    fontFamily: 'var(--font)', fontWeight: 700, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none', borderRadius: 'var(--radius)', transition: 'all 0.15s',
    whiteSpace: 'nowrap', opacity: disabled ? 0.5 : 1, position: 'relative', overflow: 'hidden',
  }
  const variants = {
    primary: { background: 'var(--blue)', color: '#fff', boxShadow: '0 2px 12px rgba(0,102,255,0.3)' },
    secondary: { background: 'transparent', color: 'var(--cyan)', border: '1px solid var(--border-med)' },
    danger: { background: 'var(--red)', color: '#fff' },
    ghost: { background: 'rgba(255,255,255,0.06)', color: 'var(--text-sec)', border: '1px solid var(--border)' },
    success: { background: 'var(--green)', color: '#fff', boxShadow: '0 2px 12px rgba(0,200,150,0.3)' },
    cyan: { background: 'var(--cyan)', color: '#080E1F', fontWeight: 800 },
  }
  const sizes = {
    xs: { padding: '3px 9px', fontSize: 11 },
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 13 },
    lg: { padding: '11px 22px', fontSize: 14 },
    xl: { padding: '13px 28px', fontSize: 15 },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ ...base, ...variants[variant], ...sizes[size], ...style }}>
      {loading
        ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
        : icon}
      {children}
    </button>
  )
}

// ── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, onClick, hover, glow }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-med)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        boxShadow: hovered ? 'var(--glow-card), 0 0 0 1px rgba(0,212,255,0.08)' : 'var(--glow-card)',
        cursor: onClick ? 'pointer' : undefined,
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        position: 'relative', zIndex: 1,
        ...style,
      }}>
      {children}
    </div>
  )
}

// ── INPUT ─────────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type = 'text', required, error, hint, icon, style, readOnly }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>}
        <input
          type={type} value={value} onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder} readOnly={readOnly}
          style={{
            width: '100%',
            padding: icon ? '9px 10px 9px 32px' : '9px 12px',
            border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            background: 'var(--bg-input)',
            color: 'var(--text)',
            fontSize: 14,
            fontFamily: 'var(--font)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  )
}

// ── SELECT ────────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, required, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-input)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── BADGE ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color = 'var(--cyan)', bg, size = 'sm' }) {
  const bg_ = bg || color.replace(')', ',0.14)').replace('rgb', 'rgba').replace('var(', '').replace(')', '')
  const sizes = { xs: { fontSize: 9, padding: '1px 5px' }, sm: { fontSize: 10, padding: '2px 7px' }, md: { fontSize: 12, padding: '3px 10px' } }
  return (
    <span style={{ ...sizes[size], background: bg || 'transparent', color, borderRadius: 10, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap', border: `1px solid ${color}44` }}>
      {label}
    </span>
  )
}

// ── CATEGORY BADGE ─────────────────────────────────────────────────────────────
export function CatBadge({ cat }) {
  const map = {
    elite:    { label: 'ELITE', color: 'var(--red)' },
    agegroup: { label: 'AGE GP', color: 'var(--cyan)' },
    open:     { label: 'OPEN', color: 'var(--text-muted)' },
    adaptive: { label: 'ADAPTIVE', color: 'var(--purple)' },
  }
  const { label, color } = map[cat] || map.open
  return (
    <span style={{ fontSize: 9, padding: '2px 7px', background: color.replace(')', ',0.14)').replace('var(--', '').replace(')', ''), color, borderRadius: 10, fontWeight: 800, letterSpacing: '0.06em', border: `1px solid ${color}44` }}>
      {label}
    </span>
  )
}

// ── BIB ───────────────────────────────────────────────────────────────────────
export function Bib({ n }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--cyan)', background: 'rgba(0,212,255,0.1)', padding: '2px 9px', borderRadius: 10, letterSpacing: '0.04em', whiteSpace: 'nowrap', border: '1px solid rgba(0,212,255,0.2)', fontFamily: 'var(--font-mono)' }}>
      #{n}
    </span>
  )
}

// ── RANK NUMBER ───────────────────────────────────────────────────────────────
export function RankNum({ pos }) {
  if (pos == null) return <span style={{ width: 28, color: 'var(--text-muted)', fontSize: 13 }}>—</span>
  const c = pos === 0 ? 'var(--gold)' : pos === 1 ? '#909BAA' : pos === 2 ? '#B8722A' : 'var(--text-muted)'
  return <span style={{ width: 28, fontWeight: 800, color: c, fontSize: pos < 3 ? 18 : 14, flexShrink: 0 }}>{pos + 1}</span>
}

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    OK:      { color: 'var(--green)', bg: 'var(--green-bg)' },
    DNC:     { color: 'var(--red)',   bg: 'var(--red-bg)' },
    DNF:     { color: 'var(--gold)',  bg: 'var(--gold-bg)' },
    pending: { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' },
  }
  const { color, bg } = map[status] || map.pending
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, padding: '2px 9px', borderRadius: 10, border: `1px solid ${color}44` }}>
      {status || '—'}
    </span>
  )
}

// ── WRISTBAND DOTS ────────────────────────────────────────────────────────────
export function WristbandDots({ total = 3, lost = 0, recovered = 0 }) {
  const remaining = Math.max(0, total - lost + recovered)
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: 13, height: 13, borderRadius: '50%',
          background: i < remaining ? 'var(--green)' : 'var(--red)',
          boxShadow: i < remaining ? '0 0 6px rgba(0,200,150,0.5)' : '0 0 6px rgba(255,68,68,0.3)',
          border: `1px solid ${i < remaining ? 'rgba(0,200,150,0.4)' : 'rgba(255,68,68,0.3)'}`,
          opacity: i < remaining ? 1 : 0.5,
        }} />
      ))}
    </div>
  )
}

// ── COUNTER ───────────────────────────────────────────────────────────────────
export function Counter({ value, max = 99, min = 0, onChange, color = 'var(--red)', label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <button onClick={() => onChange(Math.max(min, value - 1))}
        style={{ width: 22, height: 22, border: '1px solid var(--border)', borderRadius: 5, background: 'var(--bg-card-2)', color, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</button>
      <span style={{ color, fontWeight: 700, minWidth: 18, textAlign: 'center', fontSize: 14, fontFamily: 'var(--font-mono)' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}
        style={{ width: 22, height: 22, border: '1px solid var(--border)', borderRadius: 5, background: 'var(--bg-card-2)', color, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
      {label && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>}
    </div>
  )
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
export function Empty({ label, sub, action }) {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: sub ? 6 : 0 }}>{label}</div>
      {sub && <div style={{ color: 'var(--text-muted)', fontSize: 12, opacity: 0.7, marginTop: 4 }}>{sub}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  )
}

// ── PAGE HEADER ───────────────────────────────────────────────────────────────
export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{title}</h1>
        {sub && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── TIME CELL ─────────────────────────────────────────────────────────────────
const parseT = (s) => { if (!s || /^(dnc|dnf)$/i.test(String(s).trim())) return null; const n = parseFloat(s); return isNaN(n) ? null : n }
const fmtT = (t, m = false) => { if (t == null) return '—'; if (m) { const mm = Math.floor(t/60); const ss = (t%60).toFixed(2).padStart(5,'0'); return `${mm}:${ss}` } return t.toFixed(2) + 's' }

export function TimeCell({ value, onChange, isMinutes = false, width = 100 }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')
  const commit = () => { onChange(draft); setEditing(false) }
  const parsed = parseT(value)
  if (editing) return (
    <span style={{ width, display: 'inline-block' }}>
      <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
        onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        placeholder={isMinutes ? 'm:ss.cc' : 'ss.cc'}
        style={{ width: '100%', padding: '3px 7px', border: '1px solid var(--cyan) !important', borderRadius: 5, background: 'var(--bg-input)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
      />
    </span>
  )
  return (
    <span onClick={() => { setDraft(value || ''); setEditing(true) }}
      style={{ width, display: 'inline-block', cursor: 'text', padding: '3px 8px', borderRadius: 5, background: parsed != null ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', fontSize: 13, color: parsed != null ? 'var(--cyan)' : 'var(--text-muted)', fontWeight: parsed != null ? 700 : 400, border: `1px solid ${parsed != null ? 'rgba(0,212,255,0.3)' : 'var(--border)'}` }}>
      {parsed != null ? fmtT(parsed, isMinutes) : '—'}
    </span>
  )
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: { color: 'var(--green)', bg: 'var(--green-bg)', border: 'rgba(0,200,150,0.3)' },
    error:   { color: 'var(--red)',   bg: 'var(--red-bg)',   border: 'rgba(255,68,68,0.3)' },
    info:    { color: 'var(--cyan)',  bg: 'var(--cyan-dim)', border: 'rgba(0,212,255,0.3)' },
  }
  const { color, bg, border } = colors[type] || colors.info
  return (
    <div style={{
      position: 'fixed', top: 66, right: 16, zIndex: 9999,
      background: bg, color, border: `1px solid ${border}`,
      padding: '11px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600,
      boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${color}44`,
      maxWidth: 360, animation: 'fadeIn 0.2s ease',
    }}>
      {message}
    </div>
  )
}

// ── LOGO COMPONENT ────────────────────────────────────────────────────────────
export function Logo({ size = 'md' }) {
  const sizes = { sm: { icon: 18, text: 16 }, md: { icon: 24, text: 20 }, lg: { icon: 32, text: 28 }, xl: { icon: 44, text: 38 } }
  const { icon, text } = sizes[size] || sizes.md
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width={icon} height={icon} viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="15" r="10" stroke="white" strokeWidth="2"/>
        <rect x="11" y="2" width="6" height="2.5" rx="1.2" fill="white"/>
        <line x1="14" y1="5" x2="14" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="15" x2="18" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="14" cy="15" r="1.5" fill="white"/>
      </svg>
      <span style={{ fontFamily: 'var(--font)', fontSize: text, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
        <span style={{ color: '#fff' }}>OCR</span>
        <span style={{ color: 'var(--blue)' }}>TIME</span>
      </span>
    </div>
  )
}
