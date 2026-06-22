import ProjectVisual from './ProjectVisual'

export default function ProjectCard({ project, index, onOpen }) {
  return (
    <article className={`project-card project-card--${project.size}${index === 0 ? ' project-card--featured' : ''}`}>
      <div className="project-card__chrome"><span>{project.systemId}</span><span><i /> {project.status}</span></div>
      <div className="project-card__layout">
        <ProjectVisual project={project} />
        <div className="project-card__body">
          <div className="project-card__meta"><span>MODULE / 0{index + 1}</span><span>{project.meta[0]}</span></div>
          <div className="project-card__title">
            <h3>{project.name}</h3>
            {project.fullName && <span>{project.fullName}</span>}
          </div>
          <p>{project.description}</p>
          <div className="project-card__tags">{project.meta.map((item) => <span key={item}>{item}</span>)}</div>
          <button className="project-card__open" type="button" onClick={() => onOpen(project)}>
            Inspect module <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  )
}
