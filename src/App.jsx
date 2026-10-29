
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import InventoryPage from './pages/InventoryPage';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading StockFlow...</p>;

  if (!user) return <AuthPage />;

  return <InventoryPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
