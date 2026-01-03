import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import GettingStarted from './pages/GettingStarted'
import Dashboard from './pages/Dashboard'
import Leaderboard from './pages/Leaderboard'
import Accounts from './pages/Accounts'
import Admin from './pages/Admin'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/getting-started" element={<GettingStarted />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/getting-started" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
