export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, event } = req.body
  if (!email || !event) return res.status(400).json({ error: 'Missing data' })

  const key = process.env.RESEND_API_KEY
  if (!key) return res.status(500).json({ error: 'No RESEND_API_KEY' })

  const html = `
  <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;background:#080E1F;border-radius:12px;overflow:hidden">
    <div style="background:#0A1628;padding:28px 32px;text-align:center;border-bottom:1px solid rgba(0,212,255,0.1)">
      <span style="font-size:22px;font-weight:900"><span style="color:#fff">OCR</span><span style="color:#0066FF">TIME</span></span>
    </div>
    <div style="padding:32px;background:#0D1B2E">
      <h2 style="color:#fff;font-size:20px;margin:0 0 16px">¡Tu evento fue creado! 🎉</h2>
      <div style="background:#0A1628;border-radius:10px;padding:20px;border:1px solid rgba(0,212,255,0.15);margin-bottom:20px">
        <h3 style="color:#fff;margin:0 0 12px;font-size:16px">${event.name}</h3>
        ${event.location ? `<p style="color:rgba(255,255,255,0.6);font-size:13px;margin:4px 0">📍 ${event.location}</p>` : ''}
        ${event.event_date ? `<p style="color:rgba(255,255,255,0.6);font-size:13px;margin:4px 0">📅 ${event.event_date}</p>` : ''}
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:4px 0">🏟 Pista: ${event.track_type === 'official' ? 'Oficial (100% pts)' : 'Adaptada (70% pts)'}</p>
      </div>
      <div style="background:rgba(0,200,150,0.08);border-radius:9px;padding:14px;border:1px solid rgba(0,200,150,0.2);margin-bottom:20px">
        <p style="color:#00C896;font-size:13px;margin:0 0 6px;font-weight:700">✅ Próximos pasos:</p>
        <p style="color:rgba(0,200,150,0.8);font-size:13px;margin:0;line-height:1.8">
          1. Compartí el link de inscripción con los atletas<br>
          2. Configurá las oleadas en el panel Admin<br>
          3. El día de la carrera activá el cronómetro desde Dashboard
        </p>
      </div>
      <a href="https://ocrtime.com/dashboard" style="display:block;background:#0066FF;color:#fff;text-align:center;padding:13px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">Ir al panel de administración →</a>
    </div>
    <div style="background:#080E1F;padding:16px;text-align:center;border-top:1px solid rgba(0,212,255,0.08)">
      <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0">OCR TIME · info@ocrtime.com</p>
    </div>
  </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'OCR TIME <info@ocrtime.com>', to: [email], subject: `Evento creado ✅ — ${event.name} · OCR TIME`, html })
    })
    const data = await r.json()
    res.status(r.ok ? 200 : 500).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
