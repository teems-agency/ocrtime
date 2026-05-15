import { useState } from 'react'
import Navbar from '../components/Navbar'
import { CheckCircle, X, ChevronDown, ChevronUp, Mail, Shield, Zap, Headphones } from 'lucide-react'

const PLANS = {
  es: [
    {
      name: 'Gratis', price: '$0', per: 'para siempre',
      highlight: false, cta: 'Empezar gratis', href: '/auth',
      feats: [
        ['Hasta 30 atletas por evento', true],
        ['1 evento activo', true],
        ['Resultados en vivo', true],
        ['Notificaciones email', true],
        ['Perfil de atleta permanente', true],
        ['Resultados públicos', true],
        ['Atletas ilimitados', false],
        ['Brackets automáticos', false],
        ['Ranking mundial', false],
        ['WhatsApp de resultados', false],
      ],
    },
    {
      name: 'Organizador', price: '$39', per: '/año',
      subprice: '+ $0.50 USD por atleta inscripto',
      example: 'Ej: 100 atletas = $89 USD total',
      highlight: true, cta: 'Crear evento', href: '/events/create',
      feats: [
        ['Atletas ilimitados', true],
        ['Eventos ilimitados en el año', true],
        ['Todas las modalidades OCR', true],
        ['Brackets de torneo automáticos', true],
        ['Sistema de pulseras Short Course', true],
        ['Pentatlón UIPM con sorteo', true],
        ['Importar CSV de chip timer', true],
        ['Ranking mundial con puntos', true],
        ['WhatsApp de resultados', true],
        ['Notificaciones email automáticas', true],
      ],
    },
    {
      name: 'Federación', price: 'Consultar', per: 'anual',
      highlight: false, cta: 'Contactar', href: 'mailto:info@ocrtime.com',
      feats: [
        ['Todo del plan Organizador', true],
        ['Eventos ilimitados', true],
        ['Panel multi-organizador', true],
        ['Dashboard de administración', true],
        ['API de resultados', true],
        ['Ranking nacional oficial', true],
        ['Integración UIPM', true],
        ['Soporte dedicado', true],
        ['Análisis financieros', true],
        ['Onboarding personalizado', true],
      ],
    },
  ],
  en: [
    {
      name: 'Free', price: '$0', per: 'forever',
      highlight: false, cta: 'Start free', href: '/auth',
      feats: [
        ['Up to 30 athletes per event', true],
        ['1 active event', true],
        ['Live results', true],
        ['Email notifications', true],
        ['Permanent athlete profile', true],
        ['Public results', true],
        ['Unlimited athletes', false],
        ['Auto brackets', false],
        ['World ranking', false],
        ['WhatsApp results', false],
      ],
    },
    {
      name: 'Organizer', price: '$39', per: '/year',
      subprice: '+ $0.50 USD per registered athlete',
      example: 'E.g. 100 athletes = $89 USD total',
      highlight: true, cta: 'Create event', href: '/events/create',
      feats: [
        ['Unlimited athletes', true],
        ['Unlimited events per year', true],
        ['All OCR disciplines', true],
        ['Auto tournament brackets', true],
        ['Short Course wristband system', true],
        ['Pentathlon UIPM with draw', true],
        ['Chip timer CSV import', true],
        ['World ranking points', true],
        ['WhatsApp result delivery', true],
        ['Automatic email notifications', true],
      ],
    },
    {
      name: 'Federation', price: 'Contact us', per: 'annual',
      highlight: false, cta: 'Contact us', href: 'mailto:info@ocrtime.com',
      feats: [
        ['Everything in Organizer', true],
        ['Unlimited events', true],
        ['Multi-organizer panel', true],
        ['Admin dashboard', true],
        ['Results API', true],
        ['Official national ranking', true],
        ['UIPM integration', true],
        ['Dedicated support', true],
        ['Financial analytics', true],
        ['Personalized onboarding', true],
      ],
    },
  ],
}

const FAQS = {
  es: [
    { q: '¿Cuándo se cobra el plan Organizador?', a: 'Al momento de publicar el evento. El precio final se calcula según los atletas inscriptos al cierre de inscripciones.' },
    { q: '¿Puedo empezar gratis y escalar?', a: 'Sí. El plan gratuito es permanente para eventos pequeños. Cuando tu evento supere los 30 atletas, activás el plan Organizador con un clic.' },
    { q: '¿Qué pasa con los atletas si cambio de plan?', a: 'Nada. Los perfiles de atletas y sus dorsales permanentes nunca se pierden, independientemente del plan del organizador.' },
    { q: '¿Aceptan pagos de Argentina/Latinoamérica?', a: 'Sí. Aceptamos tarjetas internacionales vía Stripe y MercadoPago. Sin permanencia ni contrato.' },
    { q: '¿Qué significa "pista adaptada" vs "pista oficial"?', a: 'Pista oficial: homologada según estándares UIPM, otorga 100% de los puntos del ranking. Pista adaptada: circuito local, otorga 70% de los puntos.' },
  ],
  en: [
    { q: 'When is the Organizer plan charged?', a: 'When you publish the event. Final price is calculated based on registered athletes at registration close.' },
    { q: 'Can I start free and scale?', a: 'Yes. The free plan is permanent for small events. When your event exceeds 30 athletes, activate the Organizer plan with one click.' },
    { q: 'What happens to athletes if I change plans?', a: 'Nothing. Athlete profiles and permanent bib numbers are never lost, regardless of the organizer\'s plan.' },
    { q: 'Do you accept payments from Latin America?', a: 'Yes. We accept international cards via Stripe and MercadoPago. No commitment or contract required.' },
    { q: 'What does "adapted track" vs "official track" mean?', a: 'Official track: homologated per UIPM standards, awards 100% ranking points. Adapted track: local circuit, awards 70% ranking points.' },
  ],
}

export default function PricingPage({ user, authLoading }) {
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoMsg, setPromoMsg] = useState('')
  const L = lang === 'es'
  const plans = PLANS[lang]
  const faqs = FAQS[lang]

  const applyPromo = () => {
    const codes = ['LAUNCH2025', 'PARTNER50', 'OCRTIME']
    if (codes.includes(promoCode.toUpperCase())) setPromoMsg(L ? '¡Código aplicado! Descuento en tu próxima compra.' : 'Code applied! Discount on your next purchase.')
    else setPromoMsg(L ? 'Código inválido.' : 'Invalid code.')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* HERO */}
      <section style={{ padding: '64px 24px 56px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(0,102,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 46, fontWeight: 900, color: 'var(--text)', margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            {L ? 'Elegí tu plan.' : 'Choose your plan.'}
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 24px' }}>
            {L ? 'Sin contrato. Sin permanencia. Cancelá cuando quieras.' : 'No contract. No commitment. Cancel anytime.'}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '6px 18px', fontSize: 13, color: 'var(--cyan)', fontWeight: 600 }}>
            👤 {L ? 'Crear perfil de atleta es siempre GRATIS · El dorsal es permanente' : 'Creating an athlete profile is always FREE · Bib number is permanent'}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section style={{ padding: '0 24px 56px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {plans.map((p, i) => (
            <div key={i} style={{
              background: p.highlight ? 'linear-gradient(180deg, rgba(0,102,255,0.15) 0%, var(--bg-card) 40%)' : 'var(--bg-card)',
              border: `1px solid ${p.highlight ? 'rgba(0,102,255,0.5)' : 'var(--border)'}`,
              borderRadius: 16, padding: '28px 24px', position: 'relative',
              boxShadow: p.highlight ? 'var(--glow-blue), var(--glow-card)' : 'var(--glow-card)',
            }}>
              {p.highlight && (
                <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--blue)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 16px', borderRadius: 20, letterSpacing: '0.1em', whiteSpace: 'nowrap', boxShadow: 'var(--glow-blue)' }}>
                  {L ? 'MÁS ELEGIDO' : 'MOST POPULAR'}
                </div>
              )}

              <div style={{ fontWeight: 700, fontSize: 15, color: p.highlight ? 'var(--cyan)' : 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.name}</div>

              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 38, fontWeight: 900, color: p.highlight ? '#fff' : 'var(--text)', letterSpacing: '-0.03em' }}>{p.price}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 6 }}>{p.per}</span>
              </div>

              {p.subprice && <div style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 600, marginBottom: 3 }}>{p.subprice}</div>}
              {p.example && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>{p.example}</div>}

              {/* Cyan divider */}
              <div style={{ height: 1, background: p.highlight ? 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' : 'var(--border)', margin: '16px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {p.feats.map(([feat, included], j) => (
                  <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: included ? 'var(--text-sec)' : 'var(--text-dim)', opacity: included ? 1 : 0.6 }}>
                    {included
                      ? <CheckCircle size={13} color="var(--green)" style={{ flexShrink: 0 }} />
                      : <X size={13} color="var(--text-dim)" style={{ flexShrink: 0 }} />}
                    {feat}
                  </div>
                ))}
              </div>

              <a href={p.href} style={{
                display: 'block', padding: '11px', textAlign: 'center', borderRadius: 9, textDecoration: 'none',
                fontWeight: 700, fontSize: 14, fontFamily: 'var(--font)', transition: 'all 0.15s',
                background: p.highlight ? 'var(--blue)' : 'transparent',
                border: `1.5px solid ${p.highlight ? 'var(--blue)' : 'var(--border)'}`,
                color: p.highlight ? '#fff' : 'var(--text-sec)',
                boxShadow: p.highlight ? 'var(--glow-blue)' : 'none',
              }}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES ROW */}
      <section style={{ padding: '0 24px 56px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            [<Shield size={18} color="var(--cyan)"/>, L ? 'Sin permanencia' : 'No commitment', L ? 'Cancelá en cualquier momento, sin preguntas.' : 'Cancel at any time, no questions asked.'],
            [<Headphones size={18} color="var(--cyan)"/>, L ? 'Soporte incluido' : 'Support included', L ? 'WhatsApp y email directo con el equipo.' : 'WhatsApp and email direct with the team.'],
            [<Zap size={18} color="var(--cyan)"/>, L ? 'Setup en 5 min' : 'Setup in 5 min', L ? 'Stripe · MercadoPago · Sin tarjeta para el free.' : 'Stripe · MercadoPago · No card for free plan.'],
          ].map(([icon, title, desc], i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: 'var(--glow-card)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
              <div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{title}</div><div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* RANKING POINTS */}
      <section style={{ padding: '0 24px 56px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px', boxShadow: 'var(--glow-card)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {L ? '¿Cómo funcionan los puntos del ranking?' : 'How do ranking points work?'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
            {L ? 'Los puntos se calculan automáticamente al publicar resultados.' : 'Points are calculated automatically when results are published.'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              [L ? 'Pista oficial' : 'Official track', '100%', 'var(--green)'],
              [L ? 'Pista adaptada' : 'Adapted track', '70%', 'var(--cyan)'],
              ['1° lugar / 1st place', '×2.0', 'var(--gold)'],
              ['2° lugar / 2nd place', '×1.5', '#909BAA'],
              ['3° lugar / 3rd place', '×1.2', '#B8722A'],
              [L ? 'Participación' : 'Participation', '×1.0', 'var(--text-muted)'],
            ].map(([label, value, color], i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>{label}</span>
                <span style={{ fontWeight: 800, fontSize: 18, color, fontFamily: 'var(--font-mono)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO CODE */}
      <section style={{ padding: '0 24px 56px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', boxShadow: 'var(--glow-card)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{L ? '¿Tenés un código de descuento?' : 'Have a promo code?'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{L ? 'Socios fundadores y eventos especiales acceden a créditos gratuitos.' : 'Founding partners and special events get free credits.'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder={L ? 'CÓDIGO' : 'CODE'}
              style={{ padding: '9px 14px', border: `1px solid ${promoMsg.includes('Código inválido') || promoMsg.includes('Invalid') ? 'var(--red)' : promoMsg ? 'var(--green)' : 'var(--border)'}`, borderRadius: 8, background: 'var(--bg-input)', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700, outline: 'none', width: 160, letterSpacing: '0.06em' }} />
            <button onClick={applyPromo}
              style={{ padding: '9px 18px', background: 'var(--blue)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)', boxShadow: 'var(--glow-blue)' }}>
              {L ? 'Aplicar' : 'Apply'}
            </button>
          </div>
          {promoMsg && <div style={{ width: '100%', fontSize: 13, color: promoMsg.includes('inválido') || promoMsg.includes('Invalid') ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>{promoMsg}</div>}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '0 24px 56px', maxWidth: 1060, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 18px', letterSpacing: '-0.02em' }}>FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: `1px solid ${openFaq === i ? 'var(--border-med)' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', boxShadow: openFaq === i ? 'var(--glow-card)' : 'none', transition: 'border-color 0.2s' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left' }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{f.q}</span>
                {openFaq === i
                  ? <ChevronUp size={16} color="var(--cyan)" />
                  : <ChevronDown size={16} color="var(--text-muted)" />}
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.7, borderTop: '1px solid var(--border)' }}>
                  <div style={{ paddingTop: 12 }}>{f.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.15), rgba(0,212,255,0.05))', borderTop: '1px solid var(--border)', padding: '56px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-0.03em' }}>
          {L ? '¿Sos socio fundador?' : 'Are you a founding partner?'}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: '0 0 24px' }}>
          {L ? 'Contactanos para acceder a condiciones especiales de lanzamiento.' : 'Contact us for special launch conditions.'}
        </p>
        <a href="mailto:info@ocrtime.com"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'var(--blue)', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: 'var(--glow-blue)' }}>
          <Mail size={16} /> info@ocrtime.com
        </a>
      </section>
    </div>
  )
}
