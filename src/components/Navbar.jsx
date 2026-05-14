import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Globe, Menu, X, ChevronDown, LogOut, User, Settings, LayoutDashboard } from 'lucide-react'
import { getSupabase } from '../lib/supabase'

const NAV = [
  { href: '/events',  es: 'Eventos',    en: 'Events' },
  { href: '/results', es: 'Resultados', en: 'Results' },
  { href: '/athletes',es: 'Atletas',    en: 'Athletes' },
  { href: '/pricing', es: 'Precios',    en: 'Pricing' },
]

export default function Navbar({ user, lang = 'es', setLang, darkMode, setDarkMode }) {
  const router = useRouter()
  const [userMenu, setUserMenu] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const L = lang === 'es'

  const handleSignOut = async () => {
    await getSupabase().auth.signOut()
    router.push('/')
  }

  const initial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'
  const isAdmin = user?.email === 'info@ocrtime.com'

  return (
    <nav style={{
      background: 'rgba(8,14,31,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,212,255,0.1)',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 24px', height: 56 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 36, textDecoration: 'none', flexShrink: 0 }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="15" r="10" stroke="white" strokeWidth="2"/>
            <rect x="11" y="2" width="6" height="2.5" rx="1.2" fill="white"/>
            <line x1="14" y1="5" x2="14" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="14" y1="15" x2="18.5" y2="10.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="14" cy="15" r="1.5" fill="white"/>
          </svg>
          <span style={{ fontFamily: 'var(--font)', fontSize: 19, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
            <span style={{ color: '#fff' }}>OCR</span>
            <span style={{ color: '#0066FF' }}>TIME</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0 }}>
          {NAV.map(({ href, es, en }) => {
            const active = router.pathname.startsWith(href)
            return (
              <Link key={href} href={href} style={{
                padding: '0 14px', height: 56, display: 'flex', alignItems: 'center',
                color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                fontWeight: active ? 700 : 500, fontSize: 13, textDecoration: 'none',
                borderBottom: `2px solid ${active ? 'var(--cyan)' : 'transparent'}`,
                transition: 'color 0.15s, border-color 0.15s',
                letterSpacing: '0.01em',
              }}>
                {L ? es : en}
              </Link>
            )
          })}
          {user && (
            <Link href="/dashboard" style={{
              padding: '0 14px', height: 56, display: 'flex', alignItems: 'center',
              color: router.pathname.startsWith('/dashboard') ? '#FFB800' : 'rgba(255,255,255,0.5)',
              fontWeight: router.pathname.startsWith('/dashboard') ? 700 : 500,
              fontSize: 13, textDecoration: 'none',
              borderBottom: `2px solid ${router.pathname.startsWith('/dashboard') ? '#FFB800' : 'transparent'}`,
            }}>
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link href="/superadmin" style={{
              padding: '0 14px', height: 56, display: 'flex', alignItems: 'center',
              color: router.pathname === '/superadmin' ? 'var(--red)' : 'rgba(255,255,255,0.4)',
              fontWeight: 700, fontSize: 11, textDecoration: 'none', letterSpacing: '0.08em',
              borderBottom: `2px solid ${router.pathname === '/superadmin' ? 'var(--red)' : 'transparent'}`,
            }}>
              ADMIN
            </Link>
          )}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Language toggle */}
          <button onClick={() => setLang(l => l === 'es' ? 'en' : 'es')}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 7, padding: '4px 10px', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: 'var(--font)', letterSpacing: '0.06em' }}>
            <Globe size={11} />
            {lang === 'es' ? 'EN' : 'ES'}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenu(!userMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(0,102,255,0.15)', border: '1px solid rgba(0,102,255,0.3)', borderRadius: 8, padding: '5px 10px', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {initial}
                </div>
                <ChevronDown size={11} color="rgba(255,255,255,0.5)" />
              </button>

              {userMenu && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, minWidth: 180, boxShadow: 'var(--shadow-lg), var(--glow-card)', zIndex: 300 }}>
                  <div style={{ padding: '6px 10px', fontSize: 11, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                    {user.email}
                  </div>
                  {[
                    ['/profile', <User size={13}/>, L ? 'Mi perfil' : 'My profile'],
                    ['/dashboard', <LayoutDashboard size={13}/>, 'Dashboard'],
                    ...(isAdmin ? [['/superadmin', <Settings size={13}/>, 'Super Admin']] : []),
                  ].map(([href, icon, label]) => (
                    <Link key={href} href={href} onClick={() => setUserMenu(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', color: 'var(--text-sec)', borderRadius: 6, fontSize: 13, textDecoration: 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {icon}{label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                  <button onClick={handleSignOut}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', color: 'var(--red)', border: 'none', background: 'none', width: '100%', textAlign: 'left', fontSize: 13, borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                    <LogOut size={13} />{L ? 'Salir' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" style={{
              padding: '7px 16px', background: 'var(--blue)', border: 'none', borderRadius: 8,
              color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(0,102,255,0.35)',
              transition: 'all 0.15s',
            }}>
              {L ? 'Ingresar' : 'Sign in'}
            </Link>
          )}
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {userMenu && <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={() => setUserMenu(false)} />}
    </nav>
  )
}
