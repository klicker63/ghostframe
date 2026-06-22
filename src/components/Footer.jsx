import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <Logo />
        <p>Software, systems, and design built with intent.</p>
      </div>
      <div className="site-footer__links">
        <a href="#capabilities">Capabilities</a>
        <a href="#work">Work</a>
        <a href="#studio">Studio</a>
        <a href="#contact">Contact</a>
      </div>
      <div className="site-footer__legal">
        <span>© {new Date().getFullYear()} GhostFrame Studios</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  )
}
