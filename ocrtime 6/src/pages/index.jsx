import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { DISCIPLINES, getFlag } from '../lib/constants'
import { CheckCircle, Globe, Layers, Timer, Shield, ArrowRight, Zap } from 'lucide-react'

const SAMPLE_RANKING = [
  { pos: 1, name: 'Katarzyna J.', country: 'POL', pts: 2840 },
  { pos: 2, name: 'Tiana W.',    country: 'USA', pts: 2710 },
  { pos: 3, name: 'Mila S.',     country: 'GBR', pts: 2560 },
]

export default function Home({ user, authLoading }) {
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const L = lang === 'es'
  const isOrganizer = user?.user_metadata?.role === 'organizer' || user?.email === 'info@ocrtime.com'
  const isAthlete = user?.user_metadata?.role === 'athlete'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font)', position: 'relative' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: 'clamp(48px,8vw,80px) 20px clamp(56px,8vw,80px)', overflow: 'hidden' }}>
        {/* BG glows */}
        <div style={{ position: 'absolute', top: '-20%', left: '30%', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(0,102,255,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '0', right: '10%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
            <Shield size={12} color="var(--cyan)" />
            <span style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600, letterSpacing: '0.04em' }}>
              {L ? 'Sistema oficial OCR · Normativas UIPM' : 'Official OCR system · UIPM Standards'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'clamp(280px,55%,640px) 1fr', gap: 'clamp(24px,5vw,60px)', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(36px,5vw,62px)', fontWeight: 900, color: '#fff', margin: '0 0 18px', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                {L ? <>El tiempo en OCR,<br /><span style={{ color: 'var(--cyan)' }}>al detalle.</span></> : <>Race time,<br /><span style={{ color: 'var(--cyan)' }}>tracked perfectly.</span></>}
              </h1>
              <p style={{ fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 0 32px', lineHeight: 1.7 }}>
                {L ? 'Cronometración oficial, rankings mundiales y resultados en vivo para eventos de Obstacle Course Racing.' : 'Official timing, world rankings and live results for Obstacle Course Racing events worldwide.'}
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                {!user ? (
                  <>
                    <Link href="/auth?role=organizer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 22px', background: 'var(--blue)', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: 'var(--glow-blue)' }}>
                      {L ? 'Crear evento gratis' : 'Create free event'} <ArrowRight size={14} />
                    </Link>
                    <Link href="/auth" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 22px', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 9, color: 'var(--cyan)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                      {L ? 'Soy atleta' : "I'm an athlete"}
                    </Link>
                  </>
                ) : isOrganizer ? (
                  <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 22px', background: 'var(--blue)', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: 'var(--glow-blue)' }}>
                    {L ? 'Ir al dashboard' : 'Go to dashboard'} <ArrowRight size={14} />
                  </Link>
                ) : (
                  <Link href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 22px', background: 'var(--blue)', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: 'var(--glow-blue)' }}>
                    {L ? 'Ver mi perfil' : 'View my profile'} <ArrowRight size={14} />
                  </Link>
                )}
                <Link href="/results" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {L ? 'Ver resultados →' : 'See results →'}
                </Link>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 'clamp(16px,3vw,36px)', justifyContent: 'start' }}>
                {[['2,400+', L?'Cap. eventos':'Events cap.'], ['38', L?'Países':'Countries'], ['16', L?'Categorías':'Categories'], ['6', L?'Modalidades':'Disciplines']].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 'clamp(18px,2vw,26px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{n}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-med)', borderRadius: 16, padding: 'clamp(20px,3vw,28px)', boxShadow: 'var(--glow-card)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                {L ? '🏃 Ranking mundial en vivo' : '🏃 Live world ranking'}
              </div>
              {SAMPLE_RANKING.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontWeight: 900, fontSize: i===0?22:16, color: i===0?'var(--gold)':i===1?'#909BAA':'#B8722A', width: 24, flexShrink: 0 }}>{r.pos}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{getFlag(r.country)} {r.country}</div>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16, fontFamily: 'var(--font-mono)' }}>{r.pts}<span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 2 }}>pts</span></span>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: '12px', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 9, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {L ? '(Atletas a modo de ejemplo · el ranking se actualiza en vivo)' : '(Sample athletes · ranking updates in real time)'}
              </div>
              {!user && (
                <Link href="/auth" style={{ display: 'block', marginTop: 14, padding: '10px', background: 'rgba(0,102,255,0.15)', border: '1px solid rgba(0,102,255,0.3)', borderRadius: 9, color: 'var(--blue)', fontWeight: 700, fontSize: 13, textAlign: 'center', textDecoration: 'none' }}>
                  {L ? 'Crear mi perfil de atleta →' : 'Create my athlete profile →'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── RANKING STRIP ── */}
      <section style={{ background: 'var(--blue)', padding: '12px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}><Globe size={12}/>  {L?'Ranking Mundial OCR 2025':'OCR World Ranking 2025'}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{L?'Pista oficial: 100pts · Adaptada: 70pts · 1°: ×2.0':'Official: 100pts · Adapted: 70pts · 1st: ×2.0'}</span>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'clamp(48px,6vw,80px) 20px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          {L ? 'Cómo funciona' : 'How it works'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 32px' }}>
          {L ? 'De la inscripción al podio, sin fricción.' : 'From registration to podium, without friction.'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 16 }}>
          {[
            { icon: <Layers size={18} color="var(--cyan)"/>, title: L?'1. Creás tu evento':'1. Create your event', desc: L?'Registrás la carrera, modalidades y atletas en minutos. Compatible con OCR 100m, Short Course, Standard, Team Relay y Pentatlón UIPM.':'Register the race, disciplines and athletes in minutes. Compatible with OCR 100m, Short Course, Standard, Team Relay and Pentathlon UIPM.' },
            { icon: <Timer size={18} color="var(--cyan)"/>, title: L?'2. Cronometrás en vivo':'2. Time in real-time', desc: L?'Por oleadas o importando el CSV de tu chip timer (Chronotrack, MyLaps, Race Result). Sin margen de error.':'By wave or importing your chip timer CSV (Chronotrack, MyLaps, Race Result). Zero margin of error.' },
            { icon: <Globe size={18} color="var(--cyan)"/>, title: L?'3. Resultados globales':'3. Global results', desc: L?'Los atletas reciben sus tiempos por email y WhatsApp automáticamente. Rankings mundiales actualizados al instante.':'Athletes receive their times by email and WhatsApp automatically. World rankings updated instantly.' },
          ].map((h, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 'clamp(18px,2.5vw,24px)', boxShadow: 'var(--glow-card)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,212,255,0.25)'; e.currentTarget.style.boxShadow='0 0 20px rgba(0,212,255,0.08), var(--glow-card)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='var(--glow-card)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{h.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>{h.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.7 }}>{h.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCIPLINES ── */}
      <section style={{ padding: '0 20px clamp(48px,6vw,80px)', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(18px,2vw,24px)', fontWeight: 800, color: 'var(--text)', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          {L ? '6 modalidades oficiales' : '6 official disciplines'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 10 }}>
          {DISCIPLINES.map(d => (
            <div key={d.id} style={{ background: 'var(--bg-card)', border: `1px solid ${d.color}22`, borderLeft: `3px solid ${d.color}`, borderRadius: 9, padding: '14px 16px', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderLeftColor = d.color}
              onMouseLeave={e => e.currentTarget.style.borderLeftColor = d.color}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{d.icon}</div>
              <div style={{ fontWeight: 700, color: d.color, fontSize: 14 }}>{d.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{L ? d.descriptionEs : d.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING MINI ── */}
      <section style={{ padding: 'clamp(40px,6vw,72px) 20px', background: 'rgba(0,102,255,0.04)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 900, color: 'var(--text)', margin: '0 0 6px', textAlign: 'center', letterSpacing: '-0.02em' }}>
            {L ? 'Planes simples, precios claros' : 'Simple plans, clear pricing'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 36px' }}>
            {L ? 'Crear perfil de atleta es siempre gratis. Pagás solo cuando organizás un evento.' : 'Creating an athlete profile is always free. You only pay when you organize an event.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 14 }}>
            {[
              { name: L?'Gratis':'Free', price: '$0', per: L?'para siempre':'forever', highlight: false, feats: [L?'Hasta 30 atletas':'Up to 30 athletes', L?'1 evento activo':'1 active event', L?'Resultados en vivo':'Live results', L?'Email al atleta':'Athlete email'], href: '/auth' },
              { name: L?'Organizador':'Organizer', price: '$39', per: L?'/año':'/year', highlight: true, feats: [L?'Atletas ilimitados':'Unlimited athletes', L?'Todas las modalidades OCR':'All OCR disciplines', L?'Brackets automáticos':'Auto brackets', L?'Ranking mundial':'World ranking', L?'WhatsApp resultados':'WhatsApp results'], href: '/events/create' },
              { name: L?'Federación':'Federation', price: L?'Consultar':'Contact', per: L?'anual':'annual', highlight: false, feats: [L?'Todo del Organizador':'Everything in Organizer', L?'Eventos ilimitados':'Unlimited events', L?'Panel multi-org':'Multi-org panel', 'Results API', L?'Ranking nacional':'National ranking'], href: '/pricing' },
            ].map((p, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: `1.5px solid ${p.highlight?'var(--blue)':'var(--border)'}`, borderRadius: 14, padding: 'clamp(18px,2.5vw,24px)', position: 'relative', boxShadow: p.highlight?'var(--glow-blue), var(--glow-card)':'var(--glow-card)' }}>
                {p.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--blue)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 12px', borderRadius: 20, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{L?'MÁS ELEGIDO':'MOST POPULAR'}</div>}
                <div style={{ fontWeight: 700, fontSize: 13, color: p.highlight?'var(--cyan)':'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{p.name}</div>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: p.highlight?'#fff':'var(--text)', letterSpacing: '-0.03em' }}>{p.price}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 5 }}>{p.per}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
                  {p.feats.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 7, alignItems: 'center', fontSize: 12, color: 'var(--text-sec)' }}>
                      <CheckCircle size={12} color="var(--green)" style={{ flexShrink: 0 }}/>{f}
                    </div>
                  ))}
                </div>
                <Link href={p.href} style={{ display: 'block', padding: '10px', background: p.highlight?'var(--blue)':'transparent', border: `1.5px solid ${p.highlight?'var(--blue)':'var(--border)'}`, borderRadius: 8, color: p.highlight?'#fff':'var(--text-sec)', fontWeight: 700, fontSize: 13, textAlign: 'center', textDecoration: 'none' }}>
                  {L?'Empezar':'Get started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section style={{ padding: 'clamp(48px,6vw,80px) 20px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(0,102,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, color: 'var(--text)', margin: '0 0 12px', letterSpacing: '-0.03em' }}>
            {L ? '¿Todavía cronometrás\ncon Excel?' : 'Still timing\nwith Excel?'}
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '0 0 28px', lineHeight: 1.7 }}>
            {L ? 'Hay una mejor forma. Setup en 5 minutos, sin contrato.' : 'There\'s a better way. Setup in 5 minutes, no contract.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'var(--blue)', borderRadius: 9, color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: 'var(--glow-blue)' }}>
              <Zap size={16}/>{L?'Empezar gratis hoy':'Start free today'}
            </Link>
            <Link href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '13px 24px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text-sec)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              {L?'Ver precios':'See pricing'}
            </Link>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[L?'Sin tarjeta':'No card', L?'Sin contrato':'No contract', L?'Setup en 5 min':'5 min setup'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={11} color="var(--green)"/>{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border)', padding: 'clamp(20px,3vw,32px) 20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="15" r="10" stroke="white" strokeWidth="2"/>
            <rect x="11" y="2" width="6" height="2.5" rx="1.2" fill="white"/>
            <line x1="14" y1="5" x2="14" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="14" y1="15" x2="18.5" y2="10.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#fff' }}>OCR</span><span style={{ color: 'var(--blue)' }}>TIME</span>
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>
          {L ? 'Sistema oficial de cronometración OCR · UIPM · World Obstacle' : 'Official OCR timing system · UIPM · World Obstacle'}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>info@ocrtime.com</div>
      </footer>

      {/* ── MOBILE RESPONSIVE ── */}
      <style>{`
        @media (max-width: 700px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
