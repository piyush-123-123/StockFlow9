
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/productService';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [items, settingsSnapshot] = await Promise.all([
          getProducts(user.uid),
          getDoc(doc(db, 'organizations', user.uid)),
        ]);

        setProducts(items);

        if (settingsSnapshot.exists()) {
          setThreshold(settingsSnapshot.data().defaultLowStockThreshold ?? 5);
        }
      } catch (err) {
        setError(err.message || 'Could not load dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user.uid]);

  const totalQuantity = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const lowStockProducts = products.filter((product) => {
    const limit = product.lowStockThreshold ?? threshold;
    return Number(product.quantity) <= Number(limit);
  });

  if (loading) return <main className="inventory-page">Loading dashboard...</main>;

  return (
    <main className="inventory-page">
      <header className="inventory-header">
        <div>
          <h1>Dashboard</h1>
          <p>Here's an overview of your inventory.</p>
        </div>
        <button onClick={() => onNavigate('inventory')}>
          Manage inventory
        </button>
      </header>

      {error && <p className="error-message">{error}</p>}

      <section className="dashboard-stats">
        <article className="stat-card">
          <p>Total products</p>
          <h2>{products.length}</h2>
        </article>

        <article className="stat-card">
          <p>Total units in stock</p>
          <h2>{totalQuantity}</h2>
        </article>

        <article className="stat-card">
          <p>Low-stock products</p>
          <h2>{lowStockProducts.length}</h2>
        </article>
      </section>

      <section className="dashboard-section">
        <h2>Low-stock alerts</h2>

        {lowStockProducts.length === 0 ? (
          <p>All products have sufficient stock.</p>
        ) : (
          <div className="product-list">
            {lowStockProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div>
                  <h3>{product.name}</h3>
                  <p>SKU: {product.sku}</p>
                  <p>Quantity remaining: {product.quantity}</p>
                  <p>
                    Threshold: {product.lowStockThreshold ?? threshold}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
