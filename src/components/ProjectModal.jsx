import { useEffect, useRef } from 'react'
import ProjectVisual from './ProjectVisual'

export default function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!project) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const closeOnEscape = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [project, onClose])

  if (!project) return null

  return (
    <div className="module-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="module-modal__panel" role="dialog" aria-modal="true" aria-labelledby="module-title">
        <div className="module-modal__bar">
          <span>MODULE INSPECTOR / {project.systemId}</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close project details">Close [esc]</button>
        </div>
        <div className="module-modal__grid">
          <ProjectVisual project={project} expanded />
          <div className="module-modal__content">
            <div className="module-modal__status"><i />{project.status}</div>
            <p className="module-modal__eyebrow">Selected GhostFrame system</p>
            <h2 id="module-title">{project.name}</h2>
            {project.fullName && <p className="module-modal__fullname">{project.fullName}</p>}
            <p className="module-modal__brief">{project.brief}</p>
            <div className="module-modal__focus">
              <span>System focus</span>
              <ul>{project.focus.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="module-modal__footer"><span>{project.meta.join(' / ')}</span><span>GHOSTFRAME STUDIOS</span></div>
          </div>
        </div>
      </section>
    </div>
  )
}
