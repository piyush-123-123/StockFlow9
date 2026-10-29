
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { AuthProvider, useAuth } from './context/AuthContext';
import { auth } from './firebase';
import AuthPage from './pages/AuthPage';
import InventoryPage from './pages/InventoryPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (loading) return <p>Loading StockFlow...</p>;

  if (!user) return <AuthPage />;

  return (
    <>
      <nav className="app-nav">
        <strong>StockFlow</strong>
        <div>
          <button onClick={() => setPage('dashboard')}>Dashboard</button>
          <button onClick={() => setPage('inventory')}>Inventory</button>
          <button onClick={() => signOut(auth)}>Logout</button>
        </div>
      </nav>

      {page === 'dashboard' ? (
        <DashboardPage onNavigate={setPage} />
      ) : (
        <InventoryPage />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
