import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from './components/Register'
import Login from './components/Login'
import LeaveDashboard from './components/LeaveDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<LeaveDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
