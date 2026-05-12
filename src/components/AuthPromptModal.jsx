import styles from './AuthPromptModal.module.css'

export default function AuthPromptModal({
  onClose,
  accentText,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  tertiaryLabel,
  onTertiary,
}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {accentText && <span className={styles.accent}>{accentText}</span>}
        <h3 className={styles.title}>{title}</h3>
        {body && <p className={styles.body}>{body}</p>}
        {primaryLabel && (
          <button className={styles.primary} onClick={onPrimary}>{primaryLabel}</button>
        )}
        {(secondaryLabel || tertiaryLabel) && (
          <p className={styles.secondaryRow}>
            {secondaryLabel && (
              <button className={styles.secondaryLink} onClick={onSecondary}>
                {secondaryLabel}
              </button>
            )}
            {secondaryLabel && tertiaryLabel && <span className={styles.divider}>·</span>}
            {tertiaryLabel && (
              <button className={styles.tertiaryLink} onClick={onTertiary}>
                {tertiaryLabel}
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
