export default function ProjectVisual({ project, expanded = false }) {
  if (project.image) {
    return <div className="project-visual project-visual--image"><img src={project.image} alt={`${project.name} project preview`} /></div>
  }

  return (
    <div className={`project-visual project-visual--${project.variant}${expanded ? ' is-expanded' : ''}`} aria-hidden="true">
      <div className="project-visual__grid" />
      <div className="project-visual__axis project-visual__axis--x" />
      <div className="project-visual__axis project-visual__axis--y" />
      <div className="project-visual__corner project-visual__corner--tl" />
      <div className="project-visual__corner project-visual__corner--br" />
      <span className="project-visual__label">{project.systemId}</span>
      <div className="project-visual__mark">{project.mark}</div>
      <div className="project-visual__target"><i /><i /><i /><i /></div>
      <div className="project-visual__readout"><span>SYS.READY</span><span>0{project.name.length}</span></div>
    </div>
  )
}
