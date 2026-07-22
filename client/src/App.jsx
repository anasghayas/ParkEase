import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

const Home = () => <div className="p-8 text-center text-2xl font-bold">Welcome to ParkEase</div>;
const Dashboard = () => <div className="p-8 text-center text-2xl font-bold">Your Dashboard</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-100 font-sans">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
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
