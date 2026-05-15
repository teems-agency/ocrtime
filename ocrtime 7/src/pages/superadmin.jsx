import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { Card, Btn, Bib, CatBadge, Empty, PageHeader, Toast, Badge } from '../components/ui'
import { getSupabase } from '../lib/supabase'
import { DISCIPLINES, getFlag } from '../lib/constants'
import { Users, Calendar, Trophy, Settings, Plus, Trash2, Edit, Eye, CheckCircle, X, BarChart2, Globe, Shield } from 'lucide-react'

const SUPER_ADMIN_EMAIL = 'info@ocrtime.com'

export default function SuperAdmin({ user, authLoading }) {
  const router = useRouter()
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
  const [tab, setTab] = useState('overview')
  const [events, setEvents] = useState([])
  const [athletes, setAthletes] = useState([])
  const [codes, setCodes] = useState([])
  const [stats, setStats] = useState({ events: 0, athletes: 0, registrations: 0 })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [newCode, setNewCode] = useState({ code: '', discount: 100, maxUses: 10, notes: '' })
  const L = lang === 'es'

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000) }

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push('/auth'); return }
      if (user.email !== SUPER_ADMIN_EMAIL) { router.push('/'); return }
      loadAll()
    }
  }, [user, authLoading])

  const loadAll = async () => {
    setLoading(true)
    const supabase = getSupabase()
    const [{ data: evts, count: ec }, { data: aths, count: ac }, { data: regs, count: rc }, { data: discountCodes }] = await Promise.all([
      supabase.from('events').select('*, profiles(full_name)', { count: 'exact' }).order('created_at', { ascending: false }),
      supabase.from('athletes').select('*', { count: 'exact' }).order('created_at', { ascending: false }),
      supabase.from('registrations').select('id', { count: 'exact' }),
      supabase.from('discount_codes').select('*').order('created_at', { ascending: false }),
    ])
    setEvents(evts || [])
    setAthletes(aths || [])
    setCodes(discountCodes || [])
    setStats({ events: ec || 0, athletes: ac || 0, registrations: rc || 0 })
    setLoading(false)
  }

  const togglePublish = async (ev) => {
    const { error } = await getSupabase().from('events').update({ is_published: !ev.is_published }).eq('id', ev.id)
    if (error) { showToast(error.message, 'error'); return }
    setEvents(p => p.map(e => e.id === ev.id ? { ...e, is_published: !e.is_published } : e))
    showToast(ev.is_published ? (L ? 'Evento despublicado' : 'Event unpublished') : (L ? 'Evento publicado ✓' : 'Event published ✓'))
  }

  const createCode = async () => {
    if (!newCode.code.trim()) return
    const { data, error } = await getSupabase().from('discount_codes').insert({ code: newCode.code.toUpperCase(), discount_pct: newCode.discount, max_uses: newCode.maxUses, uses: 0, notes: newCode.notes || null, is_active: true }).select().single()
    if (error) { showToast(error.message, 'error'); return }
    setCodes(p => [data, ...p])
    setNewCode({ code: '', discount: 100, maxUses: 10, notes: '' })
    showToast(L ? `Código "${data.code}" creado ✓` : `Code "${data.code}" created ✓`)
  }

  const toggleCode = async (code) => {
    const { error } = await getSupabase().from('discount_codes').update({ is_active: !code.is_active }).eq('id', code.id)
    if (error) { showToast(error.message, 'error'); return }
    setCodes(p => p.map(c => c.id === code.id ? { ...c, is_active: !c.is_active } : c))
  }

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>Cargando…</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={18} color="var(--red)" /></div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>Super Admin</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>OCR TIME · {user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            [stats.events, L ? 'Eventos' : 'Events', <Calendar size={18} color="var(--blue)"/>],
            [stats.athletes, L ? 'Atletas' : 'Athletes', <Users size={18} color="var(--green)"/>],
            [stats.registrations, L ? 'Inscripciones' : 'Registrations', <Trophy size={18} color="var(--gold)"/>],
            [events.filter(e => e.is_published).length, 'Live', <Globe size={18} color="var(--red)"/>],
          ].map(([n, l, icon]) => (
            <Card key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gray-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
              <div><div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>{n}</div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{l}</div></div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {[['overview', L ? 'Todos los eventos' : 'All events'], ['athletes', L ? 'Atletas' : 'Athletes'], ['codes', L ? 'Códigos de descuento' : 'Discount codes']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer', color: tab === id ? 'var(--blue)' : 'var(--text-muted)', fontWeight: tab === id ? 700 : 400, fontSize: 13, fontFamily: 'var(--font)', borderBottom: `2px solid ${tab === id ? 'var(--blue)' : 'transparent'}` }}>{label}</button>
          ))}
        </div>

        {/* ALL EVENTS */}
        {tab === 'overview' && (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{L ? `Todos los eventos (${events.length})` : `All events (${events.length})`}</div>
            {events.length === 0 ? <Empty label={L ? 'No hay eventos' : 'No events'} /> : events.map(e => {
              const discs = e.disciplines || []
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{e.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: e.is_published ? 'var(--green)' : '#946000', padding: '2px 6px', borderRadius: 6 }}>{e.is_published ? 'LIVE' : 'DRAFT'}</span>
                      {e.track_type === 'official' && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--green)', background: 'var(--green-bg)', padding: '2px 6px', borderRadius: 6, border: '1px solid var(--green)33' }}>OFICIAL</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {e.location && <span>{getFlag(e.country)} {e.location}</span>}
                      {e.event_date && <span>📅 {new Date(e.event_date).toLocaleDateString()}</span>}
                      <span>👤 {e.profiles?.full_name || e.organizer || '—'}</span>
                      <span>🏃 {e.athlete_count || 0} atletas</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      {discs.slice(0, 4).map(dId => { const d = DISCIPLINES.find(x => x.id === dId); return d ? <span key={dId} style={{ fontSize: 9, padding: '1px 7px', borderRadius: 8, color: d.color, background: d.color + '15', fontWeight: 600 }}>{d.label}</span> : null })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <button onClick={() => togglePublish(e)}
                      style={{ padding: '5px 12px', border: `1px solid ${e.is_published ? 'var(--red)' : 'var(--green)'}`, borderRadius: 6, background: 'transparent', color: e.is_published ? 'var(--red)' : 'var(--green)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                      {e.is_published ? (L ? 'Despublicar' : 'Unpublish') : (L ? 'Publicar' : 'Publish')}
                    </button>
                    <Link href={`/events/${e.id}`}><button style={{ width: 30, height: 30, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={13} /></button></Link>
                    <Link href={`/events/edit/${e.id}`}><button style={{ width: 30, height: 30, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit size={13} /></button></Link>
                  </div>
                </div>
              )
            })}
          </Card>
        )}

        {/* ALL ATHLETES */}
        {tab === 'athletes' && (
          <Card>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{L ? `Todos los atletas (${athletes.length})` : `All athletes (${athletes.length})`}</div>
            {athletes.slice(0, 50).map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--blue)', overflow: 'hidden', flexShrink: 0 }}>
                  {a.photo_url ? <img src={a.photo_url} style={{ width: 32, height: 32, objectFit: 'cover' }}/> : a.full_name?.[0]}
                </div>
                <Bib n={a.bib} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{a.full_name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{getFlag(a.country)} {a.country}</span>
                <CatBadge cat={a.category || 'agegroup'} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                <Link href={`/athletes/${a.id}`}><button style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={12}/></button></Link>
              </div>
            ))}
            {athletes.length > 50 && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>+{athletes.length - 50} más…</div>}
          </Card>
        )}

        {/* DISCOUNT CODES */}
        {tab === 'codes' && (
          <div>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{L ? 'Crear código de descuento' : 'Create discount code'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{L ? 'Código' : 'Code'}</label>
                  <input value={newCode.code} onChange={e => setNewCode(p => ({...p, code: e.target.value.toUpperCase()}))} placeholder="LAUNCH2025" style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'monospace', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{L ? 'Descuento %' : 'Discount %'}</label>
                  <input type="number" min="1" max="100" value={newCode.discount} onChange={e => setNewCode(p => ({...p, discount: parseInt(e.target.value)}))} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>{L ? 'Max usos' : 'Max uses'}</label>
                  <input type="number" min="1" value={newCode.maxUses} onChange={e => setNewCode(p => ({...p, maxUses: parseInt(e.target.value)}))} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>Notas</label>
                  <input value={newCode.notes} onChange={e => setNewCode(p => ({...p, notes: e.target.value}))} placeholder={L ? 'Socio fundador' : 'Founding partner'} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <Btn onClick={createCode} icon={<Plus size={13}/>}>{L ? 'Crear código' : 'Create code'}</Btn>
            </Card>

            <Card>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{L ? `Códigos activos (${codes.length})` : `Codes (${codes.length})`}</div>
              {codes.length === 0 ? <Empty label={L ? 'No hay códigos' : 'No codes'} /> : codes.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', opacity: c.is_active ? 1 : 0.5 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color: 'var(--blue)', background: 'var(--blue-bg)', padding: '3px 10px', borderRadius: 6, minWidth: 120, textAlign: 'center' }}>{c.code}</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{c.discount_pct}%</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>{c.uses || 0}/{c.max_uses} {L ? 'usos' : 'uses'} {c.notes ? `· ${c.notes}` : ''}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: c.is_active ? 'var(--green)' : 'var(--text-muted)', background: c.is_active ? 'var(--green-bg)' : 'var(--gray-alt)', padding: '2px 8px', borderRadius: 10 }}>{c.is_active ? 'ACTIVO' : 'INACTIVO'}</span>
                  <button onClick={() => toggleCode(c)} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text-sec)' }}>
                    {c.is_active ? (L ? 'Desactivar' : 'Disable') : (L ? 'Activar' : 'Enable')}
                  </button>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
