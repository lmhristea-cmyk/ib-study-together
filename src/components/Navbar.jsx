import styles from './Navbar.module.css'

export default function Navbar({ page, navigate }) {
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
        </div>
      </div>
    </nav>
  )
}
