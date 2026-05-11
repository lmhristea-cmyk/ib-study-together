import { useState } from 'react'
import { supabase } from '../supabaseClient'
import styles from './AuthModal.module.css'

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setDone(true)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuth(data.session)
        onClose()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {done ? (
          <>
            <h3 className={styles.title}>Check your email</h3>
            <p className={styles.body}>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.</p>
            <button className={styles.btn} onClick={() => { setDone(false); setMode('signin') }}>Sign in</button>
          </>
        ) : (
          <>
            <h3 className={styles.title}>
              {mode === 'signin' ? 'Sign in for more messages' : 'Create a free account'}
            </h3>
            <p className={styles.body}>
              {mode === 'signin'
                ? 'Sign in to get 25 AI Tutor messages per day instead of 10.'
                : 'Free accounts get 25 AI Tutor messages per day.'}
            </p>
            <form onSubmit={submit} className={styles.form}>
              <input
                className={styles.input}
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
              <input
                className={styles.input}
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {error && <p className={styles.error}>{error}</p>}
              <button className={styles.btn} type="submit" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
            <button className={styles.toggle} onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(null) }}>
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
            <button className={styles.skip} onClick={onClose}>Continue without signing in</button>
          </>
        )}
      </div>
    </div>
  )
}
