
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/productService';
import ProductForm from '../components/ProductForm';

export default function InventoryPage() {
  const { user } = useAuth();
  const orgId = user.uid;

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      setProducts(await getProducts(orgId));
    } catch (err) {
      setError(err.message || 'Could not load products.');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term)
    );
  }, [products, search]);

  async function handleSave(product) {
    if (editingProduct) {
      await updateProduct(orgId, editingProduct.id, product);
    } else {
      await addProduct(orgId, product);
    }

    setEditingProduct(null);
    setShowForm(false);
    await loadProducts();
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    try {
      await deleteProduct(orgId, product.id);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Could not delete product.');
    }
  }

  return (
    <main className="inventory-page">
      <header className="inventory-header">
        <div>
          <h1>Inventory</h1>
          <p>Manage your organization's products.</p>
        </div>
        <button onClick={() => {
          setEditingProduct(null);
          setShowForm(true);
        }}>
          + Add product
        </button>
      </header>

      <input
        className="search-input"
        placeholder="Search by product name or SKU..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error && <p className="error-message">{error}</p>}

      {showForm && (
        <ProductForm
          initialProduct={editingProduct}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {loading ? (
        <p>Loading inventory...</p>
      ) : filteredProducts.length === 0 ? (
        <p>No products found. Add your first product to get started.</p>
      ) : (
        <div className="product-list">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div>
                <h3>{product.name}</h3>
                <p>SKU: {product.sku}</p>
                {product.description && <p>{product.description}</p>}
                <p>Quantity: {product.quantity}</p>
                {product.sellingPrice != null && (
                  <p>Selling price: {product.sellingPrice}</p>
                )}
              </div>

              <div className="form-actions">
                <button onClick={() => {
                  setEditingProduct(product);
                  setShowForm(true);
                }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(product)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
