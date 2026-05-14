import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { DISCIPLINES, COUNTRIES, getFlag } from '../lib/constants'
import { CheckCircle, Globe, Layers, Timer, Shield } from 'lucide-react'

const SAMPLE_RANKING = [
  { pos: 1, name: 'Katarzyna J.', country: 'POL', pts: 2840, events: 12 },
  { pos: 2, name: 'Tiana W.',    country: 'USA', pts: 2710, events: 11 },
  { pos: 3, name: 'Mila S.',     country: 'GBR', pts: 2560, events: 10 },
  { pos: 4, name: 'Anna G.',     country: 'POL', pts: 2390, events: 13 },
  { pos: 5, name: 'L. Kokemohr', country: 'GER', pts: 2180, events: 9  },
]

const PLANS = {
  es: [
    { name: 'Gratis', price: '$0', per: 'para siempre', highlight: false, feats: ['Hasta 30 atletas', '1 evento activo', 'Resultados en vivo', 'Email al atleta'] },
    { name: 'Organizador', price: '$39', per: '/año', highlight: true, feats: ['+ $0.50 por atleta', 'Atletas ilimitados', 'Todas las modalidades OCR', 'Chip CSV import', 'Ranking mundial', 'WhatsApp results'] },
    { name: 'Federación', price: 'Consultar', per: 'anual', highlight: false, feats: ['Todo del Organizador', 'Eventos ilimitados', 'Panel multi-organizador', 'API de resultados', 'Ranking nacional'] },
  ],
  en: [
    { name: 'Free', price: '$0', per: 'forever', highlight: false, feats: ['Up to 30 athletes', '1 active event', 'Live results', 'Athlete email'] },
    { name: 'Organizer', price: '$39', per: '/year', highlight: true, feats: ['+ $0.50 per athlete', 'Unlimited athletes', 'All OCR disciplines', 'Chip CSV import', 'World ranking', 'WhatsApp results'] },
    { name: 'Federation', price: 'Contact us', per: 'annual', highlight: false, feats: ['Everything in Organizer', 'Unlimited events', 'Multi-organizer panel', 'Results API', 'National ranking'] },
  ],
}

export default function Home({ user, authLoading }) {
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [form, setForm] = useState({ name: '', org: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const L = lang === 'es'

  const handleSubmit = () => {
    if (!form.name.trim()) return
    setSubmitted(true)
    setTimeout(() => window.location.href = '/events/create', 800)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F2F4F8', fontFamily: "var(--font)" }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* HERO */}
      <section style={{ background: 'var(--navy)', padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(59,143,232,0.15)', border: '1px solid rgba(59,143,232,0.3)', borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
              <Shield size={12} color="#3B8FE8" />
              <span style={{ fontSize: 12, color: '#3B8FE8', fontWeight: 600 }}>
                {L ? 'Sistema adaptado OCR · Normativas UIPM' : 'Adapted OCR system · UIPM Standards'}
              </span>
            </div>
            <h1 style={{ fontSize: 50, fontWeight: 800, color: '#fff', margin: '0 0 16px', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
              {L ? 'El tiempo en' : 'Race time,'}<br />
              <span style={{ color: '#3B8FE8' }}>{L ? 'OCR, al detalle.' : 'tracked perfectly.'}</span>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 460, margin: '0 0 28px', lineHeight: 1.6 }}>
              {L
                ? 'Cronometración oficial, rankings mundiales y resultados en vivo para eventos de Obstacle Course Racing.'
                : 'Official timing, world rankings and live results for Obstacle Course Racing events worldwide.'}
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
              <a href="#hero-form" style={{ padding: '11px 22px', background: '#3B8FE8', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                {L ? 'Crear evento gratis' : 'Create free event'}
              </a>
              <Link href="/results" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>
                {L ? 'Ver resultados en vivo →' : 'See live results →'}
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[
                ['2,400+', L ? 'Capacidad de eventos' : 'Event capacity'],
                ['38',     L ? 'Países' : 'Countries'],
                ['16',     L ? 'Categorías oficiales' : 'Official categories'],
                ['6',      L ? 'Modalidades' : 'Disciplines'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{n}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FORM */}
          <div id="hero-form" style={{ background: '#fff', borderRadius: 14, padding: '26px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={40} color="var(--green)" style={{ display: 'block', margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                  {L ? 'Creando tu evento…' : 'Creating your event…'}
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 16 }}>
                  {L ? 'Crear mi evento' : 'Create my event'}
                </div>
                {[
                  [L ? 'Nombre del evento' : 'Event name', 'name', 'text', L ? 'Copa Argentina OCR 2025' : 'Argentina OCR Cup 2025'],
                  [L ? 'Organización / Club' : 'Organization / Club', 'org', 'text', ''],
                  ['Email', 'email', 'email', ''],
                ].map(([label, key, type, ph]) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{label}</label>
                    <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button onClick={handleSubmit} style={{ width: '100%', padding: '11px', background: 'var(--blue)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font)', marginTop: 4 }}>
                  {L ? 'Comenzar gratis' : 'Start for free'}
                </button>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                  {L ? 'Sin tarjeta · Plan gratuito disponible' : 'No credit card · Free plan available'}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* RANKING STRIP */}
      <section style={{ background: 'var(--blue)', padding: '14px 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Globe size={14} color="rgba(255,255,255,0.8)" />
            <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>
              {L ? 'Ranking Mundial OCR 2025' : 'OCR World Ranking 2025'}
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>—</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            {L ? 'Pista oficial: 100pts · Adaptada: 70pts · 1°: ×2' : 'Official track: 100pts · Adapted: 70pts · 1st: ×2'}
          </span>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
            {SAMPLE_RANKING.slice(0, 3).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '3px 10px' }}>
                <span style={{ fontWeight: 800, color: '#fff', fontSize: 12 }}>{r.pos}.</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>{r.name}</span>
                <span style={{ fontSize: 12 }}>{getFlag(r.country)}</span>
                <span style={{ fontWeight: 700, color: '#FFD580', fontSize: 12 }}>{r.pts}pts</span>
              </div>
            ))}
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, alignSelf: 'center' }}>
              {L ? '(Atletas a modo de ejemplo)' : '(Sample athletes)'}
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '64px 24px', maxWidth: 1160, margin: '0 auto' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          {L ? 'Cómo funciona' : 'How it works'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 32px' }}>
          {L ? 'De la inscripción al podio, sin fricción.' : 'From registration to podium, without friction.'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {[
            { icon: <Layers size={17} color="var(--blue)" />, title: L ? '1. Creás tu evento' : '1. Create your event', desc: L ? 'Registrás la carrera, modalidades y atletas en minutos. Compatible con OCR 100m, Short Course, Standard, Team Relay y Pentatlón UIPM.' : 'Register the race, disciplines and athletes in minutes. Compatible with OCR 100m, Short Course, Standard, Team Relay and Pentathlon UIPM.' },
            { icon: <Timer size={17} color="var(--blue)" />, title: L ? '2. Cronometrás en vivo' : '2. Time in real-time', desc: L ? 'Por oleadas o importando el CSV de tu chip timer (Chronotrack, MyLaps, Race Result). Sin margen de error.' : 'By wave or importing your chip timer CSV (Chronotrack, MyLaps, Race Result). Zero margin of error.' },
            { icon: <Globe size={17} color="var(--blue)" />, title: L ? '3. Resultados globales' : '3. Global results', desc: L ? 'Los atletas reciben sus tiempos por email y WhatsApp automáticamente. Rankings mundiales actualizados al instante.' : 'Athletes receive their times by email and WhatsApp automatically. World rankings updated instantly.' },
          ].map((h, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '22px', boxShadow: '0 1px 4px rgba(10,22,40,0.07)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{h.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>{h.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.6 }}>{h.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DISCIPLINES */}
      <section style={{ padding: '0 24px 64px', maxWidth: 1160, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          {L ? '6 modalidades oficiales' : '6 official disciplines'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {DISCIPLINES.map(d => (
            <div key={d.id} style={{ background: '#fff', border: `1px solid ${d.color}33`, borderLeft: `4px solid ${d.color}`, borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontWeight: 700, color: d.color, fontSize: 14 }}>{d.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{L ? d.descriptionEs : d.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '64px 24px', background: '#fff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', textAlign: 'center', letterSpacing: '-0.02em' }}>
            {L ? 'Planes simples, precios claros' : 'Simple plans, clear pricing'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 32px' }}>
            {L ? 'Crear perfil de atleta es siempre gratis. Pagás solo cuando organizás un evento.' : 'Creating an athlete profile is always free. You only pay when you organize an event.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {PLANS[lang].map((p, i) => (
              <div key={i} style={{ border: `2px solid ${p.highlight ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 12, padding: '22px', position: 'relative', boxShadow: p.highlight ? '0 0 0 4px rgba(0,85,187,0.08)' : '0 1px 4px rgba(10,22,40,0.07)', background: '#fff' }}>
                {p.highlight && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'var(--blue)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 12px', borderRadius: 20 }}>{L ? 'MÁS ELEGIDO' : 'MOST POPULAR'}</div>}
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '8px 0 4px' }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: p.highlight ? 'var(--blue)' : 'var(--text)' }}>{p.price}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.per}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {p.feats.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 7, alignItems: 'center', fontSize: 13, color: 'var(--text-sec)' }}>
                      <CheckCircle size={12} color="var(--green)" />{f}
                    </div>
                  ))}
                </div>
                <Link href={p.highlight ? '/events/create' : '/pricing'} style={{ display: 'block', marginTop: 16, padding: '9px', background: p.highlight ? 'var(--blue)' : 'transparent', border: `1.5px solid ${p.highlight ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 8, color: p.highlight ? '#fff' : 'var(--text)', fontWeight: 700, fontSize: 13, textAlign: 'center', textDecoration: 'none' }}>
                  {L ? 'Empezar' : 'Get started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--navy)', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>OCR</span>
          <span style={{ color: '#3B8FE8', fontWeight: 800, fontSize: 16 }}>TIME</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
          {L ? 'Sistema oficial de cronometración OCR · UIPM · World Obstacle' : 'Official OCR timing system · UIPM · World Obstacle'}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>info@ocrtime.com</div>
      </footer>
    </div>
  )
}
