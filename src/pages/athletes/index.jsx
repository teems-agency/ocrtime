import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { Card, Btn, Bib, CatBadge, Empty, PageHeader, Toast } from '../../components/ui'
import { getSupabase } from '../../lib/supabase'
import { getFlag, AGE_GROUPS, COUNTRIES } from '../../lib/constants'
import { Plus, Search, Instagram, Phone, Filter } from 'lucide-react'

export default function AthletesPage({ user, authLoading }) {
  const [lang, setLang] = useState('es')
  const [darkMode, setDarkMode] = useState(false)
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
    if (search) f = f.filter(a => a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.bib?.includes(search))
    if (filterCat !== 'all') f = f.filter(a => a.category === filterCat)
    if (filterCountry !== 'all') f = f.filter(a => a.country === filterCountry)
    setFiltered(f)
  }, [athletes, search, filterCat, filterCountry])

  const loadAthletes = async () => {
    setLoading(true)
    const { data } = await getSupabase().from('athletes').select('*').order('bib')
    if (data) { setAthletes(data); setFiltered(data) }
    setLoading(false)
  }

  const countries = [...new Set(athletes.map(a => a.country).filter(Boolean))]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)' }}>
      <Navbar user={user} lang={lang} setLang={setLang} darkMode={darkMode} setDarkMode={setDarkMode} />

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px' }}>
        <PageHeader
          title={L ? 'Atletas' : 'Athletes'}
          sub={L ? `${athletes.length} atletas registrados en OCR TIME` : `${athletes.length} athletes registered in OCR TIME`}
          action={
            !user ? (
              <Link href="/auth"><Btn icon={<Plus size={13}/>}>{L ? 'Crear mi perfil' : 'Create my profile'}</Btn></Link>
            ) : (
              <Link href="/athletes/create"><Btn icon={<Plus size={13}/>}>{L ? 'Mi perfil' : 'My profile'}</Btn></Link>
            )
          }
        />

        {/* Filters */}
        <Card style={{ marginBottom: 20, padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={L ? 'Buscar por nombre o dorsal…' : 'Search by name or bib…'}
                style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', background: 'var(--gray-alt)', color: 'var(--text)', boxSizing: 'border-box' }} />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', background: 'var(--gray-alt)', color: 'var(--text)' }}>
              <option value="all">{L ? 'Todas las categorías' : 'All categories'}</option>
              <option value="elite">Elite</option>
              <option value="agegroup">Age Group</option>
              <option value="open">Open</option>
              <option value="adaptive">Adaptive/Para</option>
            </select>
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', outline: 'none', background: 'var(--gray-alt)', color: 'var(--text)' }}>
              <option value="all">{L ? 'Todos los países' : 'All countries'}</option>
              {countries.map(c => <option key={c} value={c}>{getFlag(c)} {c}</option>)}
            </select>
            {(search || filterCat !== 'all' || filterCountry !== 'all') && (
              <button onClick={() => { setSearch(''); setFilterCat('all'); setFilterCountry('all') }}
                style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                {L ? 'Limpiar' : 'Clear'}
              </button>
            )}
          </div>
        </Card>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Cargando…</div>
        ) : filtered.length === 0 ? (
          <Empty label={L ? 'No se encontraron atletas' : 'No athletes found'} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filtered.map(a => (
              <Link key={a.id} href={`/athletes/${a.id}`} style={{ textDecoration: 'none' }}>
                <Card style={{ cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
                  onMouseEnter={ev => { ev.currentTarget.style.boxShadow = 'var(--shadow-md)'; ev.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={ev => { ev.currentTarget.style.boxShadow = 'var(--shadow-sm)'; ev.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--blue)', flexShrink: 0, overflow: 'hidden' }}>
                      {a.photo_url ? <img src={a.photo_url} style={{ width: 44, height: 44, objectFit: 'cover' }} /> : a.full_name?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.full_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{getFlag(a.country)} {a.country}</div>
                    </div>
                    <Bib n={a.bib} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CatBadge cat={a.category || 'agegroup'} />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {a.instagram && <a href={`https://instagram.com/${a.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#C13584' }}><Instagram size={14} /></a>}
                      {a.whatsapp && <a href={`https://wa.me/${a.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--green)' }}><Phone size={14} /></a>}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
