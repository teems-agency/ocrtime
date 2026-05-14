import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { getSupabase } from '../../lib/supabase'
import { getFlag, AGE_GROUPS } from '../../lib/constants'
import { Search, Instagram, Phone } from 'lucide-react'

const CatBadge = ({ cat }) => {
  const map = { elite: { label: 'ELITE', color: 'var(--red)' }, agegroup: { label: 'AGE GP', color: 'var(--cyan)' }, open: { label: 'OPEN', color: 'var(--text-muted)' }, adaptive: { label: 'ADAPTIVE', color: 'var(--purple)' } }
  const { label, color } = map[cat] || map.open
  return <span style={{ fontSize: 9, padding: '2px 7px', color, borderRadius: 10, fontWeight: 800, letterSpacing: '0.06em', border: `1px solid ${color}44`, background: color.replace('var(', '').replace(')', '') + '14' }}>{label}</span>
}

export default function AthletesPage({ user, authLoading }) {
  const [lang, setLang] = useState('es')
  const [athletes, setAthletes] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')
  const L = lang === 'es'

  useEffect(() => { loadAthletes() }, [])

  useEffect(() => {
    let f = [...athletes]
    if (search) f = f.filter(a => a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.bib?.includes(search) || a.instagram?.toLowerCase().includes(search.toLowerCase()))
    if (filterCat !== 'all') f = f.filter(a => a.category === filterCat)
    if (filterCountry !== 'all') f = f.filter(a => a.country === filterCountry)
    setFiltered(f)
  }, [athletes, search, filterCat, filterCountry])

  const loadAthletes = async () => {
    setLoading(true)
    const { data } = await getSupabase().from('athletes').select('*').order('bib')
    setAthletes(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const countries = [...new Set(athletes.map(a => a.country).filter(Boolean))].sort()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{L ? 'Atletas' : 'Athletes'}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{athletes.length} {L ? 'atletas registrados en OCR TIME' : 'athletes registered in OCR TIME'}</p>
          </div>
          {!user && (
            <Link href="/auth" style={{ padding: '9px 18px', background: 'var(--cyan)', borderRadius: 8, color: '#080E1F', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              {L ? 'Crear mi perfil →' : 'Create my profile →'}
            </Link>
          )}
        </div>

        {/* Filters */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={L ? 'Buscar por nombre, dorsal o instagram…' : 'Search by name, bib or instagram…'}
              style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg-input)', color: 'var(--text)', boxSizing: 'border-box' }} />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg-input)', color: 'var(--text)' }}>
            <option value="all">{L ? 'Todas las categorías' : 'All categories'}</option>
            <option value="elite">Elite</option>
            <option value="agegroup">Age Group</option>
            <option value="open">Open</option>
            <option value="adaptive">Adaptive</option>
          </select>
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
            style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', background: 'var(--bg-input)', color: 'var(--text)' }}>
            <option value="all">{L ? 'Todos los países' : 'All countries'}</option>
            {countries.map(c => <option key={c} value={c}>{getFlag(c)} {c}</option>)}
          </select>
          {(search || filterCat !== 'all' || filterCountry !== 'all') && (
            <button onClick={() => { setSearch(''); setFilterCat('all'); setFilterCountry('all') }}
              style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font)' }}>
              {L ? 'Limpiar' : 'Clear'}
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            {L ? 'Cargando atletas…' : 'Loading athletes…'}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{L ? 'No se encontraron atletas' : 'No athletes found'}</div>
            {athletes.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>{L ? 'Sé el primero en registrarte' : 'Be the first to register'}</div>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {filtered.map(a => (
              <Link key={a.id} href={`/athletes/${a.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,212,255,0.3)'; e.currentTarget.style.boxShadow='0 0 16px rgba(0,212,255,0.08)'; e.currentTarget.style.transform='translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(0,102,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'var(--blue)', flexShrink: 0, overflow: 'hidden' }}>
                      {a.photo_url ? <img src={a.photo_url} style={{ width: 46, height: 46, objectFit: 'cover' }} /> : a.full_name?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.full_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{getFlag(a.country)} {a.country}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--cyan)', background: 'rgba(0,212,255,0.1)', padding: '2px 9px', borderRadius: 10, border: '1px solid rgba(0,212,255,0.2)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>#{a.bib}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CatBadge cat={a.category || 'agegroup'} />
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {a.instagram && (
                        <a href={`https://instagram.com/${a.instagram.replace('@','')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                          style={{ color: '#C13584', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                          <Instagram size={13}/> {a.instagram}
                        </a>
                      )}
                      {a.whatsapp && (
                        <a href={`https://wa.me/${a.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--green)' }}>
                          <Phone size={13}/>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
