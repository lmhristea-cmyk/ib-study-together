import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Rooms from './pages/Rooms'
import Room from './pages/Room'
import Resources from './pages/Resources'
import LobbyScreen from './components/LobbyScreen'
import ResetPassword from './pages/ResetPassword'
import { supabase } from './supabaseClient'

export default function App() {
  const [page, setPage] = useState(() =>
    window.location.pathname === '/reset-password' ? 'resetPassword' : 'home'
  )
  const [currentRoom, setCurrentRoom] = useState(null)
  const [lobbyRoom, setLobbyRoom] = useState(null)
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'PASSWORD_RECOVERY') setPage('resetPassword')
    })
    return () => subscription.unsubscribe()
  }, [])

  const navigate = (to, data = null) => {
    if (to === 'room' && data) setCurrentRoom(data)
    if (to === 'lobby' && data) setLobbyRoom(data)
    setPage(to)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)' }}>
      <Navbar page={page} navigate={navigate} session={session} onSignOut={() => supabase.auth.signOut()} />
      <main>
        {page === 'home' && <Home navigate={navigate} />}
        {page === 'rooms' && <Rooms navigate={navigate} />}
        {page === 'resources' && <Resources />}
        {page === 'room' && currentRoom && <Room room={currentRoom} navigate={navigate} session={session} />}
        {page === 'lobby' && lobbyRoom && <LobbyScreen room={lobbyRoom} navigate={navigate} />}
        {page === 'resetPassword' && <ResetPassword navigate={navigate} />}
      </main>
    </div>
  )
}
