import styles from './Navbar.module.css'

export default function Navbar({ page, navigate, session, onSignOut }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <button className={styles.logo} onClick={() => navigate('home')}>
          <span className={styles.logoIcon}>📖</span>
          <span className={styles.logoText}>IB Study<span className={styles.accent}>Together</span></span>
        </button>
        <div className={styles.links}>
          <button
            className={`${styles.link} ${page === 'rooms' ? styles.active : ''}`}
            onClick={() => navigate('rooms')}
          >
            Study Rooms
          </button>
          <button
            className={`${styles.link} ${page === 'resources' ? styles.active : ''}`}
            onClick={() => navigate('resources')}
          >
            Resources
          </button>
          <button
            className={`${styles.link} ${page === 'tools' ? styles.active : ''}`}
            onClick={() => navigate('tools')}
          >
            IB Tools
          </button>
        </div>
        <div className={styles.authArea}>
          {session ? (
            <>
              <span className={styles.userEmail}>{session.user.email}</span>
              <button className={styles.signOutBtn} onClick={onSignOut}>Sign out</button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  )
}
