import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Rooms from './pages/Rooms'
import Room from './pages/Room'
import LobbyScreen from './components/LobbyScreen'

export default function App() {
  const [page, setPage] = useState('home')
  const [currentRoom, setCurrentRoom] = useState(null)
  const [lobbyRoom, setLobbyRoom] = useState(null)

  const navigate = (to, data = null) => {
    if (to === 'room' && data) setCurrentRoom(data)
    if (to === 'lobby' && data) setLobbyRoom(data)
    setPage(to)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)' }}>
      <Navbar page={page} navigate={navigate} />
      <main>
        {page === 'home' && <Home navigate={navigate} />}
        {page === 'rooms' && <Rooms navigate={navigate} />}
        {page === 'room' && currentRoom && <Room room={currentRoom} navigate={navigate} />}
        {page === 'lobby' && lobbyRoom && <LobbyScreen room={lobbyRoom} navigate={navigate} />}
      </main>
    </div>
  )
}
