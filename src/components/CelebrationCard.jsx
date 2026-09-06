import { Award, Cake, CalendarHeart, Flag, Gift, Trophy } from 'lucide-react'
import Avatar from './Avatar.jsx'
import { formatDate } from '../utils/attendance.js'
import { celebrationKindLabel, celebrationToneClass, newJoinerStageLabel, relativeDayLabel } from '../utils/celebrations.js'

// One celebration as a card: a coloured chip for the occasion type, the person
// (or the occasion itself), then the greeting. Card styling follows the cab run
// sheet's accent pattern — a tinted header over a plain body, no extra shadows.
// Exported so the page's empty state can name the next occasion in the same
// visual language as the cards it sits between.
export const KIND_ICONS = {
  birthday: Cake,
  newJoiner: Gift,
  anniversary: Trophy,
  festival: CalendarHeart,
  national: Flag,
  occasion: Award
}

export default function CelebrationCard({ event, today }) {
  const Icon = KIND_ICONS[event.kind] || CalendarHeart
  const person = event.person
  const when = relativeDayLabel(event.date, today)
  const dateLabel = when ? `${when} · ${formatDate(event.date)}` : formatDate(event.date)
  const meta = [person?.designation, person?.department].filter(Boolean).join(' · ')
  const stage = event.kind === 'newJoiner' ? newJoinerStageLabel(event.date, today) : ''

  return (
    <article className={`celebration-card ${celebrationToneClass(event.kind)}`}>
      <div className="celebration-card-head">
        <span className="celebration-chip" aria-hidden="true">
          <Icon size={17} />
        </span>
        <span className="celebration-kind">{celebrationKindLabel(event.kind)}</span>
        {/* The date is a second-class label, so it may clip on a narrow card;
            the full value stays available on hover. */}
        <span className="celebration-when cell-ellipsis" title={dateLabel}>{dateLabel}</span>
      </div>

      <div className="celebration-card-body">
        {person ? (
          <div className="celebration-person">
            <Avatar src={person.photoUrl} name={person.name} size={44} />
            <span className="celebration-person-text">
              <strong className="celebration-person-name" title={person.name}>{person.name}</strong>
              {meta && <span className="celebration-person-meta" title={meta}>{meta}</span>}
            </span>
          </div>
        ) : (
          <div className="celebration-occasion" title={event.name}>{event.name}</div>
        )}

        <p className="celebration-greeting">{event.headline}</p>
        {event.message && <p className="celebration-wish">{event.message}</p>}
        {stage && <span className="celebration-stage">{stage}</span>}
      </div>
    </article>
  )
}
