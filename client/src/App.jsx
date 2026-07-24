import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import SlotDetails from './pages/SlotDetails';

const Dashboard = () => <div className="p-8 text-center text-2xl font-bold">Your Dashboard</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-black text-white font-sans dark">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/slot/:id" element={<SlotDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
