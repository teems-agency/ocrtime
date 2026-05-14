// src/lib/emails.js
// Server-side only — call from API routes

const FROM = 'OCR TIME <info@ocrtime.com>'
const BASE_URL = 'https://ocrtime.com'

const header = `
  <div style="background:#0A1628;padding:28px 32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:-0.02em;font-family:-apple-system,sans-serif">
      OCR<span style="color:#3B8FE8">TIME</span>
    </h1>
    <p style="color:rgba(255,255,255,0.45);font-size:10px;margin:5px 0 0;letter-spacing:0.2em">
      UIPM · WORLD OBSTACLE · OFFICIAL TIMING
    </p>
  </div>`

const footer = `
  <div style="background:#F2F4F8;padding:16px 32px;text-align:center;border-top:1px solid #E2E6EF">
    <p style="color:#7A8BA6;font-size:11px;margin:0;font-family:-apple-system,sans-serif">
      OCR TIME · <a href="${BASE_URL}" style="color:#0055BB">ocrtime.com</a> · info@ocrtime.com
    </p>
  </div>`

const wrap = (content) => `
  <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
    ${header}
    <div style="padding:32px">${content}</div>
    ${footer}
  </div>`

async function send(to, subject, html) {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return { ok: false, reason: 'missing key or recipient' }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html })
    })
    const data = await res.json()
    return { ok: res.ok, id: data.id, error: data.message }
  } catch (e) {
    console.error('Email error:', e)
    return { ok: false, error: e.message }
  }
}

// ── 1. WELCOME ────────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(athlete) {
  const html = wrap(`
    <h2 style="color:#0A1628;font-size:20px;margin:0 0 8px">¡Hola ${athlete.full_name}! 👋</h2>
    <p style="color:#4A5568;line-height:1.6;margin:0 0 20px">Tu perfil de atleta fue creado exitosamente en OCR TIME.</p>
    <div style="background:#F2F4F8;border-radius:10px;padding:24px;text-align:center;border:1px solid #E2E6EF;margin-bottom:20px">
      <p style="color:#7A8BA6;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.12em">Tu dorsal permanente</p>
      <div style="color:#0055BB;font-size:44px;font-weight:800;letter-spacing:-0.02em">#${athlete.bib}</div>
      <p style="color:#7A8BA6;font-size:12px;margin:8px 0 0">Este número te acompaña en todos los eventos OCR TIME</p>
    </div>
    <div style="margin-bottom:20px">
      <p style="color:#4A5568;font-size:13px;margin:4px 0">🌍 País: <strong>${athlete.country || '—'}</strong></p>
      <p style="color:#4A5568;font-size:13px;margin:4px 0">⚡ Categoría: <strong>${(athlete.category || '').toUpperCase()}</strong></p>
      ${athlete.age_group ? `<p style="color:#4A5568;font-size:13px;margin:4px 0">👥 Grupo: <strong>${athlete.age_group}</strong></p>` : ''}
    </div>
    <a href="${BASE_URL}/athletes/${athlete.id}" style="display:block;background:#0055BB;color:#fff;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:20px">Ver mi perfil →</a>
    <p style="color:#4A5568;line-height:1.6;font-size:13px;margin:0">Podés inscribirte en cualquier evento OCR TIME con tu perfil. Tus resultados y puntos de ranking se acumularán automáticamente.</p>
  `)
  return send(athlete.email, `Bienvenido a OCR TIME 🏃 — Dorsal #${athlete.bib}`, html)
}

// ── 2. REGISTRATION CONFIRMED ────────────────────────────────────────────────
export async function sendRegistrationEmail(athlete, event, discipline, category) {
  const html = wrap(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:40px;margin-bottom:8px">✅</div>
      <h2 style="color:#0A1628;font-size:20px;margin:0">¡Inscripción confirmada!</h2>
    </div>
    <div style="background:#F2F4F8;border-radius:10px;padding:20px;border:1px solid #E2E6EF;margin-bottom:20px">
      <h3 style="color:#0A1628;margin:0 0 12px;font-size:16px">${event.name}</h3>
      <p style="color:#4A5568;font-size:13px;margin:4px 0">📍 ${event.location || 'Por confirmar'}</p>
      <p style="color:#4A5568;font-size:13px;margin:4px 0">📅 ${event.event_date || 'Fecha por confirmar'}</p>
      <p style="color:#4A5568;font-size:13px;margin:4px 0">🏃 Modalidad: <strong>${discipline}</strong></p>
      <p style="color:#4A5568;font-size:13px;margin:4px 0">⚡ Categoría: <strong>${(category || '').toUpperCase()}</strong></p>
      <div style="margin-top:14px;padding-top:14px;border-top:1px solid #E2E6EF;text-align:center">
        <p style="color:#7A8BA6;font-size:10px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.12em">Tu dorsal</p>
        <div style="color:#0055BB;font-size:32px;font-weight:800">#${athlete.bib}</div>
      </div>
    </div>
    <p style="color:#4A5568;line-height:1.6;font-size:13px;margin:0 0 20px">Recibirás tus resultados automáticamente por email y WhatsApp al finalizar la carrera.</p>
    <a href="${BASE_URL}/events/${event.id}" style="display:block;background:#0055BB;color:#fff;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Ver detalles del evento →</a>
  `)
  return send(athlete.email, `Inscripción confirmada ✅ — ${event.name}`, html)
}

// ── 3. RESULT ────────────────────────────────────────────────────────────────
export async function sendResultEmail({ athlete, event, discipline, position, officialTime, bandsLost = 0, penaltyLoops = 0, status = 'OK' }) {
  const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏅'
  const posColor = position === 1 ? '#9A6E00' : position === 2 ? '#606770' : position === 3 ? '#B8722A' : '#0055BB'
  const isXC = ['short', 'standard'].includes(discipline)
  const maxBands = athlete.is_adaptive ? 5 : 3
  const recovered = Math.min(penaltyLoops, bandsLost, 2)
  const remaining = maxBands - bandsLost + recovered
  const bandDots = Array.from({ length: maxBands }, (_, i) => i < remaining ? '🟢' : '🔴').join('')
  const statusColor = status === 'OK' ? '#0A7A50' : '#C41A00'

  const html = wrap(`
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:48px;margin-bottom:8px">${medal}</div>
      <h2 style="color:#0A1628;font-size:20px;margin:0 0 4px">${athlete.full_name}</h2>
      <p style="color:#7A8BA6;font-size:13px;margin:0">${discipline} · ${athlete.country || ''}</p>
    </div>
    <div style="background:#F2F4F8;border-radius:10px;padding:24px;text-align:center;border:1px solid #E2E6EF;margin-bottom:20px">
      <p style="color:#7A8BA6;font-size:10px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.12em">Tiempo oficial</p>
      <div style="color:#0055BB;font-size:38px;font-weight:800;font-family:monospace;letter-spacing:-0.02em">${officialTime}</div>
      <div style="margin:14px 0;display:inline-block;padding:8px 20px;background:#fff;border-radius:6px;border:1px solid #E2E6EF">
        <span style="color:${posColor};font-size:20px;font-weight:800">Posición ${position}</span>
      </div>
      ${isXC ? `
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #E2E6EF">
          <p style="color:#7A8BA6;font-size:11px;margin:0 0 4px">Pulseras</p>
          <div style="font-size:20px;margin-bottom:6px">${bandDots}</div>
          ${penaltyLoops > 0 ? `<p style="color:#7A8BA6;font-size:11px;margin:0 0 6px">Penalty loops completados: ${penaltyLoops}</p>` : ''}
          <span style="background:${statusColor}20;color:${statusColor};font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px">${status}</span>
        </div>` : ''}
    </div>
    <a href="${BASE_URL}/results?event=${event.id}" style="display:block;background:#0055BB;color:#fff;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:20px">Ver ranking completo →</a>
    <p style="color:#4A5568;line-height:1.6;font-size:13px;margin:0">¡Felicitaciones por tu carrera! Tus puntos de ranking mundial han sido actualizados en <a href="${BASE_URL}" style="color:#0055BB">ocrtime.com</a></p>
  `)
  const subjectMedal = position <= 3 ? ['🥇', '🥈', '🥉'][position - 1] : '🏅'
  return send(athlete.email, `${subjectMedal} Tu resultado — ${event.name}`, html)
}

// ── 4. EVENT CREATED ──────────────────────────────────────────────────────────
export async function sendEventCreatedEmail(organizerEmail, event) {
  const html = wrap(`
    <h2 style="color:#0A1628;font-size:20px;margin:0 0 16px">¡Tu evento fue creado! 🎉</h2>
    <div style="background:#F2F4F8;border-radius:10px;padding:20px;border:1px solid #E2E6EF;margin-bottom:20px">
      <h3 style="color:#0A1628;margin:0 0 12px;font-size:16px">${event.name}</h3>
      <p style="color:#4A5568;font-size:13px;margin:4px 0">📍 ${event.location || 'Sin ubicación'}</p>
      <p style="color:#4A5568;font-size:13px;margin:4px 0">📅 ${event.event_date || 'Fecha por confirmar'}</p>
      <p style="color:#4A5568;font-size:13px;margin:4px 0">🏆 Modalidades: ${(event.disciplines || []).join(', ')}</p>
      <p style="color:#4A5568;font-size:13px;margin:4px 0">🏟 Pista: ${event.track_type === 'official' ? 'Oficial (100% pts ranking)' : 'Adaptada (70% pts ranking)'}</p>
    </div>
    <div style="background:#E5F5EF;border-radius:8px;padding:14px;border:1px solid #0A7A5033;margin-bottom:20px">
      <p style="color:#0A7A50;font-size:13px;margin:0 0 6px;font-weight:600">✅ Próximos pasos:</p>
      <p style="color:#0A7A50;font-size:13px;margin:0;line-height:1.8">
        1. Compartí el link de inscripción con los atletas<br>
        2. Configurá las oleadas en el panel Admin<br>
        3. El día de la carrera activá el cronómetro desde Dashboard
      </p>
    </div>
    <a href="${BASE_URL}/dashboard" style="display:block;background:#0055BB;color:#fff;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Ir al panel de administración →</a>
  `)
  return send(organizerEmail, `Evento creado ✅ — ${event.name} · OCR TIME`, html)
}
