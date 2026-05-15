import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Globe, ChevronDown, LogOut, User, Settings, LayoutDashboard, Menu, X } from 'lucide-react'
import { getSupabase } from '../lib/supabase'

export default function Navbar({ user, lang = 'es', setLang, darkMode, setDarkMode }) {
  const router = useRouter()
  const [userMenu, setUserMenu] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const L = lang === 'es'

  const isOrganizer = user?.user_metadata?.role === 'organizer' || user?.email === 'info@ocrtime.com'
  const isAthlete = user?.user_metadata?.role === 'athlete'
  const isAdmin = user?.email === 'info@ocrtime.com'

  const handleSignOut = async () => {
    await getSupabase().auth.signOut()
    setUserMenu(false)
    router.push('/')
  }

  // Nav links — athletes don't see Dashboard (organizer tool) or Create Event
  const navLinks = [
    { href: '/events',   es: 'Eventos',    en: 'Events',   always: true },
    { href: '/results',  es: 'Resultados', en: 'Results',  always: true },
    { href: '/athletes', es: 'Atletas',    en: 'Athletes', always: true },
    { href: '/pricing',  es: 'Precios',    en: 'Pricing',  always: true },
    // Dashboard only for organizers / non-athletes
    { href: '/dashboard', es: 'Dashboard', en: 'Dashboard', organizerOnly: true },
  ]

  const visibleLinks = navLinks.filter(l => {
    if (l.always) return true
    if (l.organizerOnly) return isOrganizer || (!isAthlete && user)
    return true
  })

  const initial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'

  return (
    <>
      <nav style={{
        background: 'rgba(8,14,31,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        position: 'sticky', top: 0, zIndex: 200,
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 20px', height: 56, gap: 4 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 28, textDecoration: 'none', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="15" r="10" stroke="white" strokeWidth="2"/>
              <rect x="11" y="2" width="6" height="2.5" rx="1.2" fill="white"/>
              <line x1="14" y1="5" x2="14" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="14" y1="15" x2="18.5" y2="10.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="14" cy="15" r="1.5" fill="white"/>
            </svg>
            <span style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
              <span style={{ color: '#fff' }}>OCR</span><span style={{ color: '#0066FF' }}>TIME</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0 }}>
            {visibleLinks.map(({ href, es, en }) => {
              const active = router.pathname === href || router.pathname.startsWith(href + '/')
              return (
                <Link key={href} href={href} style={{
                  padding: '0 13px', height: 56, display: 'flex', alignItems: 'center',
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  fontWeight: active ? 700 : 500, fontSize: 13, textDecoration: 'none',
                  borderBottom: `2px solid ${active ? 'var(--cyan)' : 'transparent'}`,
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}>
                  {L ? es : en}
                </Link>
              )
            })}
            {isAdmin && (
              <Link href="/superadmin" style={{
                padding: '0 13px', height: 56, display: 'flex', alignItems: 'center',
                color: router.pathname === '/superadmin' ? 'var(--red)' : 'rgba(255,68,68,0.5)',
                fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textDecoration: 'none',
                borderBottom: `2px solid ${router.pathname === '/superadmin' ? 'var(--red)' : 'transparent'}`,
              }}>
                ADMIN
              </Link>
            )}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Lang */}
            <button onClick={() => setLang?.(l => l === 'es' ? 'en' : 'es')}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 6, padding: '4px 9px', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: 'var(--font)', letterSpacing: '0.08em' }}>
              <Globe size={10} />{lang === 'es' ? 'EN' : 'ES'}
            </button>

            {/* User / Auth */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setUserMenu(!userMenu)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,102,255,0.15)', border: '1px solid rgba(0,102,255,0.3)', borderRadius: 8, padding: '5px 10px 5px 6px', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: isAthlete ? 'var(--cyan)' : 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: isAthlete ? '#080E1F' : '#fff', flexShrink: 0 }}>
                    {initial}
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isAthlete ? (L ? 'Atleta' : 'Athlete') : isOrganizer ? (L ? 'Organizador' : 'Organizer') : ''}
                  </span>
                  <ChevronDown size={10} color="rgba(255,255,255,0.4)" />
                </button>

                {userMenu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={() => setUserMenu(false)} />
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, minWidth: 190, boxShadow: 'var(--shadow-lg), var(--glow-card)', zIndex: 300 }}>
                      <div style={{ padding: '6px 10px 8px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.user_metadata?.full_name || user.email}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{isAthlete ? (L?'Cuenta de atleta':'Athlete account') : isOrganizer ? (L?'Cuenta de organizador':'Organizer account') : user.email}</div>
                      </div>
                      {[
                        isAthlete && ['/profile', <User size={13}/>, L?'Mi perfil':'My profile'],
                        isAthlete && ['/results', null, L?'Mis resultados':'My results'],
                        isOrganizer && ['/dashboard', <LayoutDashboard size={13}/>, 'Dashboard'],
                        isOrganizer && ['/events/create', null, L?'Crear evento':'Create event'],
                        isAdmin && ['/superadmin', <Settings size={13}/>, 'Super Admin'],
                      ].filter(Boolean).map(([href, icon, label]) => (
                        <Link key={href} href={href} onClick={() => setUserMenu(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', color: 'var(--text-sec)', borderRadius: 6, fontSize: 13, textDecoration: 'none', transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          {icon}{label}
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                      <button onClick={handleSignOut}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', color: 'var(--red)', border: 'none', background: 'none', width: '100%', textAlign: 'left', fontSize: 13, borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                        <LogOut size={13}/>{L?'Salir':'Sign out'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/auth" style={{ padding: '7px 16px', background: 'var(--blue)', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: '0 2px 12px rgba(0,102,255,0.35)', whiteSpace: 'nowrap' }}>
                {L ? 'Ingresar' : 'Sign in'}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
