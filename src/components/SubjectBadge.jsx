import { getSubject } from '../data/subjects'

export default function SubjectBadge({ subjectId, size = 'sm' }) {
  const subject = getSubject(subjectId)
  if (!subject) return null

  const padding = size === 'sm' ? '2px 8px' : '4px 12px'
  const fontSize = size === 'sm' ? '11px' : '13px'

  return (
    <span
      className="badge"
      style={{
        background: subject.color + '22',
        color: subject.color,
        border: `1px solid ${subject.color}44`,
        padding,
        fontSize,
      }}
    >
      {subject.emoji} {subject.name}
    </span>
  )
}
