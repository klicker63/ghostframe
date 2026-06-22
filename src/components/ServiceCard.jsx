export default function ServiceCard({ service, active, onSelect }) {
  return (
    <button className={`service-card${active ? ' is-active' : ''}`} type="button" onClick={onSelect} aria-pressed={active}>
      <div className="service-card__signal"><span>CAP.{service.code}</span><i /></div>
      <div className="service-card__main"><span>{service.signal}</span><h3>{service.title}</h3></div>
      <span className="service-card__arrow" aria-hidden="true">{active ? '●' : '○'}</span>
    </button>
  )
}
