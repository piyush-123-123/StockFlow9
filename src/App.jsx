
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading StockFlow...</p>;

  if (!user) return <AuthPage />;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Welcome to StockFlow</h1>
        <p>Logged in as {user.email}</p>
        <p>Next, we'll connect your organization and inventory.</p>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
