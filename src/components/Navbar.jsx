import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Moon, Sun, Globe, Menu, X, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { getSupabase } from '../lib/supabase'

const NAV_LINKS = [
  { href: '/events', labelEs: 'Eventos', labelEn: 'Events' },
  { href: '/results', labelEs: 'Resultados', labelEn: 'Results' },
  { href: '/athletes', labelEs: 'Atletas', labelEn: 'Athletes' },
  { href: '/pricing', labelEs: 'Precios', labelEn: 'Pricing' },
]

export default function Navbar({ user, lang, setLang, darkMode, setDarkMode }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const L = lang === 'es'

  const handleSignOut = async () => {
    await getSupabase().auth.signOut()
    router.push('/')
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?'

  return (
    <nav style={{
      background: 'var(--navy)',
      position: 'sticky', top: 0, zIndex: 200,
      borderBottom: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', height: 54,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginRight: 32, textDecoration: 'none', flexShrink: 0
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="white" strokeWidth="1.5" opacity="0.3"/>
            <circle cx="14" cy="14" r="8" stroke="white" strokeWidth="1.5" opacity="0.6"/>
            {Array.from({length: 12}, (_, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180
              const r1 = 11, r2 = 13
              return (
                <line key={i}
                  x1={14 + r1 * Math.cos(angle)} y1={14 + r1 * Math.sin(angle)}
                  x2={14 + r2 * Math.cos(angle)} y2={14 + r2 * Math.sin(angle)}
                  stroke="white" strokeWidth="1.5" opacity="0.8"
                />
              )
            })}
            <text x="14" y="18" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="sans-serif">OCR</text>
          </svg>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em' }}>OCR</span>
            <span style={{ color: '#3B8FE8', fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em' }}>TIME</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 2 }}>
          {NAV_LINKS.map(({ href, labelEs, labelEn }) => (
            <Link key={href} href={href} style={{
              padding: '0 14px', height: 54, display: 'flex', alignItems: 'center',
              color: router.pathname.startsWith(href) ? '#fff' : 'rgba(255,255,255,0.45)',
              fontWeight: router.pathname.startsWith(href) ? 600 : 400,
              fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap',
              borderBottom: `2px solid ${router.pathname.startsWith(href) ? '#3B8FE8' : 'transparent'}`,
              transition: 'color 0.15s',
            }}>
              {L ? labelEs : labelEn}
            </Link>
          ))}
          {user && (
            <Link href="/dashboard" style={{
              padding: '0 14px', height: 54, display: 'flex', alignItems: 'center',
              color: router.pathname.startsWith('/dashboard') ? '#F5A623' : 'rgba(255,255,255,0.45)',
              fontWeight: router.pathname.startsWith('/dashboard') ? 600 : 400,
              fontSize: 13, textDecoration: 'none',
              borderBottom: `2px solid ${router.pathname.startsWith('/dashboard') ? '#F5A623' : 'transparent'}`,
            }}>
              {L ? 'Admin' : 'Admin'}
            </Link>
          )}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Lang */}
          <button onClick={() => setLang(l => l === 'es' ? 'en' : 'es')}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '4px 10px', color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Globe size={12} />
            {lang === 'es' ? 'EN' : 'ES'}
          </button>

          {/* Dark mode */}
          <button onClick={() => setDarkMode(d => !d)}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '5px 7px', color: '#fff', display: 'flex', alignItems: 'center' }}>
            {darkMode ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '4px 8px', color: '#fff' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3B8FE8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  {initials}
                </div>
                <ChevronDown size={12} />
              </button>
              {userMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 8, minWidth: 160, boxShadow: 'var(--shadow-md)', zIndex: 300 }}>
                  <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', color: 'var(--text)', borderRadius: 5, fontSize: 13, textDecoration: 'none' }}>
                    <User size={14} /> {L ? 'Mi perfil' : 'My profile'}
                  </Link>
                  <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', color: 'var(--text)', borderRadius: 5, fontSize: 13, textDecoration: 'none' }}>
                    <Settings size={14} /> Dashboard
                  </Link>
                  <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                  <button onClick={handleSignOut}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', color: 'var(--red)', border: 'none', background: 'none', width: '100%', textAlign: 'left', fontSize: 13, borderRadius: 5 }}>
                    <LogOut size={14} /> {L ? 'Salir' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" style={{ padding: '6px 14px', background: '#3B8FE8', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
              {L ? 'Ingresar' : 'Sign in'}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
