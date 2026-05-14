import { clsx } from 'clsx'

// ── BUTTON ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', icon, loading, disabled, style, type = 'button' }) {
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font)', fontWeight: 600, cursor: disabled || loading ? 'not-allowed' : 'pointer', border: 'none', borderRadius: 7, transition: 'all 0.15s', whiteSpace: 'nowrap', opacity: disabled ? 0.6 : 1 }
  const variants = {
    primary: { background: 'var(--blue)', color: '#fff' },
    secondary: { background: 'transparent', color: 'var(--blue)', border: '1.5px solid var(--blue)' },
    danger: { background: 'var(--red)', color: '#fff' },
    ghost: { background: 'var(--gray-bg)', color: 'var(--text)', border: '1px solid var(--border)' },
    success: { background: 'var(--green)', color: '#fff' },
  }
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 13 },
    lg: { padding: '11px 22px', fontSize: 14 },
    xl: { padding: '13px 28px', fontSize: 15 },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={{ ...base, ...variants[variant], ...sizes[size], ...style }}>
      {loading ? <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : icon}
      {children}
    </button>
  )
}

// ── CARD ──────────────────────────────────────────────────────────────────────
export function Card({ children, style, onClick, hover }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      padding: '16px 18px', boxShadow: 'var(--shadow-sm)',
      cursor: onClick ? 'pointer' : undefined,
      transition: hover ? 'box-shadow 0.15s, border-color 0.15s' : undefined,
      ...style
    }}>
      {children}
    </div>
  )
}

// ── INPUT ─────────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type = 'text', required, error, hint, icon, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>}
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: icon ? '8px 10px 8px 32px' : '8px 10px',
            border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 7, background: 'var(--gray-alt)', color: 'var(--text)',
            fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
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
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7,
        background: 'var(--gray-alt)', color: 'var(--text)', fontSize: 14,
        fontFamily: 'var(--font)', outline: 'none',
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── BADGE ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color, bg, size = 'sm' }) {
  const sizes = { xs: { fontSize: 9, padding: '1px 5px' }, sm: { fontSize: 10, padding: '2px 7px' }, md: { fontSize: 12, padding: '3px 9px' } }
  return (
    <span style={{ ...sizes[size], background: bg || color + '18', color: color, borderRadius: 10, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap', border: `1px solid ${color}33` }}>
      {label}
    </span>
  )
}

// ── CATEGORY BADGE ────────────────────────────────────────────────────────────
export function CatBadge({ cat }) {
  const map = {
    elite: { label: 'ELITE', color: 'var(--red)' },
    agegroup: { label: 'AGE GP', color: 'var(--blue)' },
    open: { label: 'OPEN', color: 'var(--text-muted)' },
    adaptive: { label: 'ADAPTIVE', color: '#5B3FA8' },
  }
  const { label, color } = map[cat] || map.open
  return <Badge label={label} color={color} />
}

// ── BIB ───────────────────────────────────────────────────────────────────────
export function Bib({ n }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--blue)', background: 'var(--blue-bg)', padding: '2px 8px', borderRadius: 10, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
      #{n}
    </span>
  )
}

// ── RANK NUMBER ───────────────────────────────────────────────────────────────
export function RankNum({ pos }) {
  if (pos == null) return <span style={{ width: 28, color: 'var(--text-muted)', fontSize: 13 }}>—</span>
  const c = pos === 0 ? 'var(--gold)' : pos === 1 ? '#909BAA' : pos === 2 ? '#B8722A' : 'var(--text-sec)'
  const size = pos < 3 ? 18 : 14
  return <span style={{ width: 28, fontWeight: 800, color: c, fontSize: size, flexShrink: 0 }}>{pos + 1}</span>
}

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    OK: { color: 'var(--green)', bg: 'var(--green-bg)' },
    DNC: { color: 'var(--red)', bg: 'var(--red-bg)' },
    DNF: { color: '#946000', bg: '#FFF7E5' },
    pending: { color: 'var(--text-muted)', bg: 'var(--gray-alt)' },
  }
  const { color, bg } = map[status] || map.pending
  return <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 10, border: `1px solid ${color}33` }}>{status || '—'}</span>
}

// ── WRISTBAND DOTS ────────────────────────────────────────────────────────────
export function WristbandDots({ total = 3, lost = 0, recovered = 0 }) {
  const remaining = Math.max(0, total - lost + recovered)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: 12, height: 12, borderRadius: '50%',
          background: i < remaining ? 'var(--green)' : 'var(--red)',
          opacity: i < remaining ? 1 : 0.4,
          border: `1px solid ${i < remaining ? '#0A7A5066' : '#C41A0066'}`,
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
        style={{ width: 22, height: 22, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--gray-alt)', color, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</button>
      <span style={{ color, fontWeight: 700, minWidth: 18, textAlign: 'center', fontSize: 14 }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}
        style={{ width: 22, height: 22, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--gray-alt)', color, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
      {label && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>}
    </div>
  )
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
export function Empty({ label, sub, action }) {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: sub ? 6 : 0 }}>{label}</div>
      {sub && <div style={{ color: 'var(--text-muted)', fontSize: 12, opacity: 0.7 }}>{sub}</div>}
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

// ── INLINE TIME EDIT ──────────────────────────────────────────────────────────
export function TimeCell({ value, onChange, isMinutes = false, width = 100 }) {
  const { useState } = require('react')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')

  const commit = () => { onChange(draft); setEditing(false) }

  if (editing) {
    return (
      <span style={{ width, display: 'inline-block' }}>
        <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          placeholder={isMinutes ? 'm:ss.cc' : 'ss.cc'}
          style={{ width: '100%', padding: '3px 7px', border: '1.5px solid var(--blue)', borderRadius: 5, background: '#fff', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 13, outline: 'none' }}
        />
      </span>
    )
  }

  const { parseTime, formatTime } = require('../lib/constants')
  const parsed = parseTime(value)
  return (
    <span onClick={() => { setDraft(value || ''); setEditing(true) }}
      style={{ width, display: 'inline-block', cursor: 'text', padding: '3px 8px', borderRadius: 5, background: parsed != null ? 'var(--blue-bg)' : 'var(--gray-alt)', fontFamily: 'var(--font-mono)', fontSize: 13, color: parsed != null ? 'var(--blue)' : 'var(--text-muted)', fontWeight: parsed != null ? 700 : 400, border: `1px solid ${parsed != null ? 'var(--blue)' : 'var(--border)'}` }}>
      {parsed != null ? formatTime(parsed, isMinutes) : '—'}
    </span>
  )
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  const colors = { success: ['var(--green)', 'var(--green-bg)'], error: ['var(--red)', 'var(--red-bg)'], info: ['var(--blue)', 'var(--blue-bg)'] }
  const [c, bg] = colors[type] || colors.info
  return (
    <div style={{
      position: 'fixed', top: 66, right: 16, zIndex: 9999,
      background: bg, color: c, border: `1px solid ${c}`,
      padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
      boxShadow: 'var(--shadow-md)', maxWidth: 360, animation: 'fadeIn 0.2s ease',
    }}>
      {message}
    </div>
  )
}
