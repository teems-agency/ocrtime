import { useState } from 'react'
import Navbar from '../components/Navbar'
import { CheckCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react'

const PLANS = {
  es: [
    {
      name: 'Gratis', price: '$0', oldPrice: null, per: 'para siempre',
      note: null, highlight: false, cta: 'Empezar gratis', href: '/auth',
      feats: ['Hasta 30 atletas por evento', '1 evento activo', 'Resultados en vivo', 'Notificaciones email al atleta', 'Perfil de atleta permanente', 'Resultados públicos'],
    },
    {
      name: 'Organizador', price: '$39', oldPrice: '$89', per: '/año',
      note: 'Get 48 months for $156. Renews at $89/year.',
      subprice: '+ $0.50 USD por atleta inscripto',
      example: 'Ejemplo: 100 atletas = $89 USD total',
      highlight: true, cta: 'Crear evento', href: '/events/create',
      feats: ['Atletas ilimitados', 'Todas las modalidades OCR', 'OCR 100m con brackets automáticos', 'Short Course con sistema de pulseras', 'Pentatlón UIPM con sorteo de obstáculos', 'Importar CSV de chip timer', 'Ranking mundial con puntos', 'Envío de resultados por WhatsApp', 'Notificaciones email automáticas', 'Soporte prioritario'],
    },
    {
      name: 'Federación', price: 'Consultar', oldPrice: null, per: 'anual',
      note: null, highlight: false, cta: 'Contactar', href: 'mailto:info@ocrtime.com',
      feats: ['Todo del plan Organizador', 'Eventos ilimitados', 'Panel multi-organizador', 'Dashboard de administración', 'API de resultados', 'Ranking nacional oficial', 'Integración UIPM', 'Soporte dedicado'],
    },
  ],
  en: [
    {
      name: 'Free', price: '$0', oldPrice: null, per: 'forever',
      note: null, highlight: false, cta: 'Start free', href: '/auth',
      feats: ['Up to 30 athletes per event', '1 active event', 'Live results', 'Athlete email notifications', 'Permanent athlete profile', 'Public results'],
    },
    {
      name: 'Organizer', price: '$39', oldPrice: '$89', per: '/year',
      note: 'Get 48 months for $156. Renews at $89/year.',
      subprice: '+ $0.50 USD per registered athlete',
      example: 'Example: 100 athletes = $89 USD total',
      highlight: true, cta: 'Create event', href: '/events/create',
      feats: ['Unlimited athletes', 'All OCR disciplines', 'OCR 100m with auto brackets', 'Short Course wristband system', 'Pentathlon UIPM with obstacle draw', 'Chip timer CSV import', 'World ranking points', 'WhatsApp result delivery', 'Automatic email notifications', 'Priority support'],
    },
    {
      name: 'Federation', price: 'Contact us', oldPrice: null, per: 'annual',
      note: null, highlight: false, cta: 'Contact us', href: 'mailto:info@ocrtime.com',
      feats: ['Everything in Organizer', 'Unlimited events', 'Multi-organizer panel', 'Admin dashboard', 'Results API', 'Official national ranking', 'UIPM integration', 'Dedicated support'],
    },
  ],
}

const FAQS = {
  es: [
    { q: '¿Cuándo se cobra el plan Organizador?', a: 'Al momento de publicar el evento. El precio final se calcula según los atletas inscriptos al cierre de inscripciones.' },
    { q: '¿Puedo empezar gratis y escalar?', a: 'Sí. El plan gratuito es permanente para eventos pequeños. Cuando tu evento supere los 30 atletas, activás el plan Organizador con un clic.' },
    { q: '¿Qué pasa con los atletas si cambio de plan?', a: 'Nada. Los perfiles de atletas y sus dorsales permanentes nunca se pierden, independientemente del plan del organizador.' },
    { q: '¿Aceptan pagos de Argentina/Latinoamérica?', a: 'Sí. Aceptamos tarjetas internacionales vía Stripe. Para federaciones y eventos grandes, también transferencia bancaria.' },
    { q: '¿Qué significa "pista adaptada" vs "pista oficial"?', a: 'Pista oficial: homologada según estándares UIPM, otorga 100% de los puntos del ranking. Pista adaptada: circuito local con variaciones, otorga 70% de los puntos. El organizador declara el tipo al crear el evento.' },
  ],
  en: [
    { q: 'When is the Organizer plan charged?', a: 'When you publish the event. Final price is calculated based on registered athletes at registration close.' },
    { q: 'Can I start free and scale?', a: 'Yes. The free plan is permanent for small events. When your event exceeds 30 athletes, activate the Organizer plan with one click.' },
    { q: 'What happens to athletes if I change plans?', a: 'Nothing. Athlete profiles and permanent bib numbers are never lost, regardless of the organizer\'s plan.' },
    { q: 'Do you accept payments from Latin America?', a: 'Yes. We accept international cards via Stripe. For federations and large events, bank transfer is also available.' },
    { q: 'What does "adapted track" vs "official track" mean?', a: 'Official track: homologated per UIPM standards, awards 100% ranking points. Adapted track: local circuit with variations, awards 70% ranking points. Organizer declares the type when creating the event.' },
  ],
}

export default function PricingPage({ user, authLoading }) {
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const L = lang === 'es'

  const plans = PLANS[lang]
  const faqs = FAQS[lang]

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'LAUNCH2025' || promoCode.toUpperCase() === 'PARTNER50') {
      setPromoApplied(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)', fontFamily: 'var(--font)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Header */}
      <section style={{ background: 'var(--navy)', padding: '56px 24px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>
          {L ? 'Planes simples, precios claros' : 'Simple plans, clear pricing'}
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 520, margin: '0 auto 24px' }}>
          {L ? 'Creá tu perfil de atleta gratis. Pagás solo cuando organizás un evento.' : 'Create your athlete profile free. You only pay when you organize an event.'}
        </p>
        {/* Free athlete banner */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,143,232,0.2)', border: '1px solid rgba(59,143,232,0.4)', borderRadius: 20, padding: '6px 18px', fontSize: 13, color: '#3B8FE8', fontWeight: 600 }}>
          👤 {L ? 'Crear perfil de atleta es siempre GRATIS · El dorsal es permanente' : 'Creating an athlete profile is always FREE · Bib number is permanent'}
        </div>
      </section>

      {/* Plans */}
      <section style={{ padding: '48px 24px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {plans.map((p, i) => (
            <div key={i} style={{ background: '#fff', border: `2px solid ${p.highlight ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 14, padding: '24px', position: 'relative', boxShadow: p.highlight ? '0 0 0 4px rgba(0,85,187,0.08), var(--shadow-md)' : 'var(--shadow-sm)' }}>
              {p.highlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--blue)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 14px', borderRadius: 20, letterSpacing: '0.06em' }}>
                  {L ? 'MÁS ELEGIDO' : 'MOST POPULAR'}
                </div>
              )}

              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>{p.name}</div>

              <div style={{ marginBottom: 4 }}>
                {p.oldPrice && <span style={{ fontSize: 20, color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: 8 }}>{p.oldPrice}</span>}
                <span style={{ fontSize: 32, fontWeight: 800, color: p.highlight ? 'var(--blue)' : 'var(--text)' }}>{p.price}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>{p.per}</span>
              </div>

              {p.subprice && <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, marginBottom: 4 }}>{p.subprice}</div>}
              {p.example && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{p.example}</div>}
              {p.note && <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.5 }}>{p.note}</div>}

              <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {p.feats.map((f, j) => (
                  <div key={j} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 12, color: 'var(--text-sec)', lineHeight: 1.5 }}>
                    <CheckCircle size={13} color="var(--green)" style={{ flexShrink: 0, marginTop: 1 }} />{f}
                  </div>
                ))}
              </div>

              <a href={p.href} style={{ display: 'block', marginTop: 18, padding: '10px', background: p.highlight ? 'var(--blue)' : 'transparent', border: `1.5px solid ${p.highlight ? 'var(--blue)' : 'var(--border)'}`, borderRadius: 8, color: p.highlight ? '#fff' : 'var(--text)', fontWeight: 700, fontSize: 13, textAlign: 'center', textDecoration: 'none', fontFamily: 'var(--font)' }}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Promo code */}
      <section style={{ padding: '0 24px 40px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              {L ? '¿Tenés un código de descuento?' : 'Have a promo code?'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {L ? 'Socios fundadores y eventos especiales pueden acceder a créditos gratuitos.' : 'Founding partners and special events can access free credits.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
              placeholder={L ? 'Código promo' : 'Promo code'}
              style={{ padding: '8px 12px', border: `1.5px solid ${promoApplied ? 'var(--green)' : 'var(--border)'}`, borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', width: 160 }} />
            <button onClick={applyPromo}
              style={{ padding: '8px 16px', background: 'var(--blue)', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              {L ? 'Aplicar' : 'Apply'}
            </button>
          </div>
          {promoApplied && <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>✓ {L ? '¡Código aplicado!' : 'Code applied!'}</div>}
        </div>
      </section>

      {/* Ranking points */}
      <section style={{ padding: '0 24px 40px', maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            {L ? '¿Cómo funcionan los puntos del ranking?' : 'How do ranking points work?'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              [L ? 'Pista oficial' : 'Official track', '100%', 'var(--green)'],
              [L ? 'Pista adaptada' : 'Adapted track', '70%', 'var(--blue)'],
              ['1° lugar / 1st place', '×2.0', 'var(--gold)'],
              ['2° lugar / 2nd place', '×1.5', '#909BAA'],
              ['3° lugar / 3rd place', '×1.2', '#B8722A'],
              [L ? 'Participación' : 'Participation', '×1.0', 'var(--text-muted)'],
            ].map(([label, value, color], i) => (
              <div key={i} style={{ background: 'var(--gray-alt)', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-sec)' }}>{label}</span>
                <span style={{ fontWeight: 800, fontSize: 16, color }}>{value}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.6 }}>
            {L
              ? 'El organizador declara el tipo de pista al crear el evento. Los puntos se asignan automáticamente al publicar los resultados finales.'
              : 'The organizer declares the track type when creating the event. Points are automatically assigned when publishing final results.'}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '0 24px 40px', maxWidth: 1060, margin: '0 auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 16px', letterSpacing: '-0.02em' }}>FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left' }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{f.q}</span>
                {openFaq === i ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 18px 14px', fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.7 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: 'var(--navy)', padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          {L ? '¿Sos socio fundador?' : 'Are you a founding partner?'}
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '0 0 24px' }}>
          {L ? 'Contactanos para ser parte del lanzamiento con condiciones especiales.' : 'Contact us to be part of the launch with special conditions.'}
        </p>
        <a href="mailto:info@ocrtime.com"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#3B8FE8', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          <Mail size={16} /> info@ocrtime.com
        </a>
      </section>
    </div>
  )
}
