import { useEffect } from 'react'
import { Route, Routes } from 'react-router'
import Header from './components/Header'
import About from './pages/About'
import Film from './pages/Film'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Ticket from './pages/Ticket'
import { useAppDispatch, useAppSelector } from './store'
import { fetchMovies } from './store/moviesSlice'
import './index.css'

export default function App() {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.movies.status)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMovies())
    }
  }, [status, dispatch])

  return (
    <>
      <Header />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/film/:id" element={<Film />} />
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}
