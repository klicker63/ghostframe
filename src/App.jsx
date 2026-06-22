import { useCallback, useState } from 'react'
import Header from './components/Header'
import Logo from './components/Logo'
import SectionHeading from './components/SectionHeading'
import ServiceCard from './components/ServiceCard'
import ProjectCard from './components/ProjectCard'
import ProjectModal from './components/ProjectModal'
import BootScreen from './components/BootScreen'
import Footer from './components/Footer'
import { contactLinks, projects, services } from './data/siteContent'

function MissionCore() {
  return (
    <div className="mission-core" aria-hidden="true">
      <div className="mission-core__grid" />
      <div className="mission-core__ring mission-core__ring--outer"><i /></div>
      <div className="mission-core__ring mission-core__ring--inner"><i /></div>
      <div className="mission-core__cross mission-core__cross--x" />
      <div className="mission-core__cross mission-core__cross--y" />
      <div className="mission-core__logo"><Logo compact /></div>
      <span className="mission-core__label mission-core__label--one">INPUT / PROBLEM</span>
      <span className="mission-core__label mission-core__label--two">OUTPUT / SYSTEM</span>
      <div className="mission-core__scan" />
    </div>
  )
}

function App() {
  const [activeService, setActiveService] = useState(0)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showBoot, setShowBoot] = useState(() => {
    try { return sessionStorage.getItem('ghostframe-booted-v2') !== '1' } catch { return true }
  })

  const finishBoot = useCallback(() => {
    try { sessionStorage.setItem('ghostframe-booted-v2', '1') } catch { /* Storage can be unavailable in strict privacy modes. */ }
    setShowBoot(false)
  }, [])

  const capability = services[activeService]

  return (
    <div className="site-shell" id="top">
      {showBoot && <BootScreen onComplete={finishBoot} />}
      <div className="os-background" aria-hidden="true"><i /><i /><i /></div>
      <Header />

      <main>
        <section className="hero page-section" aria-labelledby="hero-title">
          <div className="hero-console">
            <div className="console-bar">
              <span>GHOSTFRAME STUDIO OPERATING ENVIRONMENT</span>
              <span className="console-bar__status"><i /> SYSTEM NOMINAL</span>
              <span>NODE / CENTRAL</span>
            </div>

            <div className="hero-console__main">
              <div className="hero__content">
                <div className="eyebrow"><i /> Independent digital studio</div>
                <p className="hero__command">/ DESIGN · ENGINEER · DEPLOY</p>
                <h1 id="hero-title"><span>GhostFrame</span><span className="hero__outline">Studios</span></h1>
                <p className="hero__tagline">Custom software, AI systems, game technology, and digital design.</p>
                <div className="hero__intro-row">
                  <p>We build real tools for real work—useful, considered systems that move beyond the concept stage and hold up in practice.</p>
                  <a className="command-link" href="#work"><span>Open module index</span><strong>↘</strong></a>
                </div>
              </div>
              <div className="hero__visual">
                <MissionCore />
              </div>
            </div>

            <div className="telemetry-bar">
              <div><small>OWNERSHIP</small><strong>Veteran-owned</strong></div>
              <div><small>ENGINEERING</small><strong>Cybersecurity-informed</strong></div>
              <div><small>OPERATING MODE</small><strong>Problem-first</strong></div>
              <div className="telemetry-bar__signal"><span>{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</span><small>ACTIVE SIGNAL</small></div>
            </div>
          </div>
        </section>

        <section className="page-section capabilities" id="capabilities">
          <SectionHeading
            eyebrow="System capabilities"
            count="01 / 04"
            title="Select a build function."
            description="Five focused capabilities, connected by one operating principle: the technology needs a clear job to do."
          />

          <div className="capability-console">
            <div className="capability-console__bar"><span>CAPABILITY MATRIX</span><span>05 MODULES AVAILABLE</span></div>
            <div className="capability-console__grid">
              <div className="capability-list">
                {services.map((service, index) => (
                  <ServiceCard
                    key={service.title}
                    service={service}
                    active={activeService === index}
                    onSelect={() => setActiveService(index)}
                  />
                ))}
              </div>
              <div className="capability-display" key={capability.code}>
                <div className="capability-display__header"><span>CAP.{capability.code}</span><span><i /> READY</span></div>
                <p className="capability-display__signal">{capability.signal}</p>
                <h3>{capability.title}</h3>
                <p className="capability-display__description">{capability.description}</p>
                <div className="capability-display__outputs">
                  <span>Typical outputs</span>
                  {capability.outputs.map((output, index) => <div key={output}><small>0{index + 1}</small>{output}</div>)}
                </div>
                <div className="capability-display__footer"><span>{capability.detail}</span><span>GFS / CAPABILITY</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section projects" id="work">
          <SectionHeading
            eyebrow="Project modules"
            count="02 / 04"
            title="Systems in active rotation."
            description="Select any module to inspect its purpose, current status, and system focus."
          />
          <div className="module-index-bar"><span>INDEX / SELECTED WORK</span><span>{String(projects.length).padStart(2, '0')} MODULES</span><span><i /> INTERACTIVE</span></div>
          <div className="projects-grid">
            {projects.map((project, index) => <ProjectCard key={project.name} project={project} index={index} onOpen={setSelectedProject} />)}
          </div>
        </section>

        <section className="page-section about" id="studio">
          <SectionHeading eyebrow="Studio profile" count="03 / 04" title="Built from the problem outward." />
          <div className="studio-console">
            <div className="studio-console__identity">
              <div className="studio-console__mark"><Logo compact /><span>GFS<br />STUDIO NODE</span></div>
              <div className="studio-console__facts">
                <span><small>TYPE</small>Independent studio</span>
                <span><small>OWNERSHIP</small>Veteran-owned</span>
                <span><small>FOUNDATION</small>Cybersecurity engineering</span>
                <span><small>FOCUS</small>Tools / systems / experiences</span>
              </div>
            </div>
            <div className="about-statement">
              <p>GhostFrame Studios is a <strong>veteran-owned</strong> independent studio with a background in <strong>cybersecurity engineering</strong> and a bias toward practical problem solving.</p>
              <p>We focus on custom tools, automation, game systems, and digital experiences—work where technical depth and sharp design need to live in the same frame.</p>
            </div>
            <div className="principles">
              <div className="principle"><span>01</span><div><h3>Useful over ornamental</h3><p>Design should make the system clearer, faster, and better to use.</p></div></div>
              <div className="principle"><span>02</span><div><h3>Security in the foundation</h3><p>Risk-aware decisions belong in the architecture, not just the checklist.</p></div></div>
              <div className="principle"><span>03</span><div><h3>Built to leave the lab</h3><p>The goal is working technology—not a concept that only looks finished.</p></div></div>
            </div>
          </div>
        </section>

        <section className="build-request" id="contact">
          <div className="build-request__grid" aria-hidden="true" />
          <div className="build-request__bar"><span>REQUEST TERMINAL / 04</span><span><i /> INTAKE OPEN</span></div>
          <div className="build-request__content">
            <div>
              <p className="eyebrow"><i /> Start a build request</p>
              <h2>Bring us the<br /><span>difficult thing.</span></h2>
            </div>
            <div className="build-request__brief">
              <span>REQUEST PARAMETERS</span>
              <p>Need software, automation, AI tools, FiveM systems, branding, or a custom digital project?</p>
              <div><small>01</small> Define the problem</div><div><small>02</small> Establish the scope</div><div><small>03</small> Build the right system</div>
            </div>
          </div>
          <div className="request-channels">
            {contactLinks.map((link, index) => (
              <a key={link.label} href={link.href}><small>CH.0{index + 1}</small><span>{link.label}<em>{link.note}</em></span><strong>↗</strong></a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  )
}

export default App
