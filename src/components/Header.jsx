import { useEffect, useState } from 'react'
import Logo from './Logo'

const navItems = [
  ['01', 'Capabilities', '#capabilities'],
  ['02', 'Modules', '#work'],
  ['03', 'Studio', '#studio'],
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('top')

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    const sections = ['top', 'capabilities', 'work', 'studio', 'contact']
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: '-30% 0px -60%', threshold: 0 },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="site-header">
      <a className="logo-link" href="#top" aria-label="GhostFrame Studios home" onClick={() => setMenuOpen(false)}>
        <Logo />
      </a>

      <div className="header-system-status" aria-label="Studio system online"><i /><span>GFS.OS</span> ONLINE</div>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="site-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span /><span /><span className="sr-only">Toggle navigation</span>
      </button>

      <nav id="site-navigation" className={menuOpen ? 'site-nav is-open' : 'site-nav'}>
        {navItems.map(([code, label, href]) => (
          <a key={href} href={href} className={active === href.slice(1) ? 'is-active' : ''} onClick={() => setMenuOpen(false)}>
            <small>{code}</small>{label}
          </a>
        ))}
        <a className={`nav-cta${active === 'contact' ? ' is-active' : ''}`} href="#contact" onClick={() => setMenuOpen(false)}>
          <small>04</small> Build request <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  )
}
