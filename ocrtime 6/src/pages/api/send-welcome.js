export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, full_name, bib, country, category } = req.body
  if (!email) return res.status(400).json({ error: 'Missing email' })

  const key = process.env.RESEND_API_KEY
  if (!key) return res.status(500).json({ error: 'No RESEND_API_KEY' })

  const html = `
  <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;background:#080E1F;border-radius:12px;overflow:hidden">
    <div style="background:#0A1628;padding:28px 32px;text-align:center;border-bottom:1px solid rgba(0,212,255,0.1)">
      <span style="font-size:22px;font-weight:900;letter-spacing:-0.03em"><span style="color:#fff">OCR</span><span style="color:#0066FF">TIME</span></span>
      <div style="color:rgba(255,255,255,0.4);font-size:10px;margin-top:5px;letter-spacing:0.2em">UIPM · WORLD OBSTACLE · OFFICIAL TIMING</div>
    </div>
    <div style="padding:32px;background:#0D1B2E">
      <h2 style="color:#fff;font-size:20px;margin:0 0 8px">¡Hola ${full_name}! 👋</h2>
      <p style="color:rgba(255,255,255,0.6);line-height:1.6;margin:0 0 24px">Tu perfil de atleta fue creado exitosamente en OCR TIME.</p>
      <div style="background:#0A1628;border-radius:10px;padding:24px;text-align:center;border:1px solid rgba(0,212,255,0.15);margin-bottom:20px">
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.12em">Tu dorsal permanente</p>
        <div style="color:#00D4FF;font-size:48px;font-weight:900;letter-spacing:-0.02em;font-family:monospace">#${bib}</div>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:8px 0 0">Este número te acompaña en todos los eventos OCR TIME</p>
      </div>
      <div style="margin:0 0 20px">
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:4px 0">🌍 País: <strong style="color:#fff">${country}</strong></p>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:4px 0">⚡ Categoría: <strong style="color:#fff">${(category||'').toUpperCase()}</strong></p>
      </div>
      <a href="https://ocrtime.com/profile" style="display:block;background:#0066FF;color:#fff;text-align:center;padding:13px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">Ver mi perfil →</a>
    </div>
    <div style="background:#080E1F;padding:16px 32px;text-align:center;border-top:1px solid rgba(0,212,255,0.08)">
      <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0">OCR TIME · <a href="https://ocrtime.com" style="color:#00D4FF">ocrtime.com</a> · info@ocrtime.com</p>
    </div>
  </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'OCR TIME <info@ocrtime.com>', to: [email], subject: `Bienvenido a OCR TIME 🏃 — Dorsal #${bib}`, html })
    })
    const data = await r.json()
    res.status(r.ok ? 200 : 500).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
