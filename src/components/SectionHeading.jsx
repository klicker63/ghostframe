export default function SectionHeading({ eyebrow, title, description, count }) {
  return (
    <div className="section-heading">
      <div className="section-heading__index">
        <span>{eyebrow}</span>
        {count && <span>{count}</span>}
      </div>
      <div className="section-heading__copy">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  )
}
