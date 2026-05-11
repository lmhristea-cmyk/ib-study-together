import styles from './UserCard.module.css'

const STATUS_LABELS = {
  studying: 'Studying',
  on_break: 'On Break',
  focusing: 'Deep Focus',
}

export default function UserCard({ user, compact = false, onClick, unread = false }) {
  const initial = user.name.charAt(0)

  if (compact) {
    return (
      <div className={styles.compact}>
        <span className={styles.avatar}>{initial}</span>
        <span className={styles.compactName}>{user.name}</span>
        <span className={`status-dot status-${user.status}`} />
      </div>
    )
  }

  return (
    <div className={`${styles.card} ${onClick ? styles.clickable : ''}`} onClick={onClick}>
      <div className={styles.avatarWrap}>
        <span className={styles.avatar}>{initial}</span>
        <span className={`status-dot status-${user.status} ${styles.statusDot}`} />
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{user.name}</span>
          {unread && <span className={styles.unreadDot} />}
        </div>
        <span className={styles.status}>{STATUS_LABELS[user.status]}</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.pomodoros}>{user.pomodoroCount}</span>
        <span className={styles.tz}>{user.timezone}</span>
      </div>
    </div>
  )
}
