
import { useEffect, useState } from 'react';

const emptyProduct = {
  name: '',
  sku: '',
  description: '',
  quantity: '0',
  costPrice: '',
  sellingPrice: '',
  lowStockThreshold: '',
};

export default function ProductForm({ initialProduct, onSave, onCancel }) {
  const [form, setForm] = useState(emptyProduct);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setForm({
        ...emptyProduct,
        ...initialProduct,
        quantity: String(initialProduct.quantity ?? 0),
        costPrice: initialProduct.costPrice ?? '',
        sellingPrice: initialProduct.sellingPrice ?? '',
        lowStockThreshold: initialProduct.lowStockThreshold ?? '',
      });
    } else {
      setForm(emptyProduct);
    }
  }, [initialProduct]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.sku.trim()) {
      setError('Product name and SKU are required.');
      return;
    }

    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0) {
      setError('Quantity must be a non-negative whole number.');
      return;
    }

    for (const field of ['costPrice', 'sellingPrice', 'lowStockThreshold']) {
      if (form[field] !== '' && (!Number.isFinite(Number(form[field])) || Number(form[field]) < 0)) {
        setError('Prices and stock threshold must be non-negative numbers.');
        return;
      }
    }

    setSaving(true);

    try {
      await onSave(form);
      setForm(emptyProduct);
    } catch (err) {
      setError(err.message || 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <h2>{initialProduct ? 'Edit product' : 'Add product'}</h2>

      <label>
        Product name *
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>

      <label>
        SKU *
        <input name="sku" value={form.sku} onChange={handleChange} required />
      </label>

      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} />
      </label>

      <label>
        Quantity *
        <input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={handleChange} required />
      </label>

      <label>
        Cost price
        <input name="costPrice" type="number" min="0" step="0.01" value={form.costPrice} onChange={handleChange} />
      </label>

      <label>
        Selling price
        <input name="sellingPrice" type="number" min="0" step="0.01" value={form.sellingPrice} onChange={handleChange} />
      </label>

      <label>
        Low-stock threshold (optional)
        <input name="lowStockThreshold" type="number" min="0" step="1" value={form.lowStockThreshold} onChange={handleChange} />
      </label>

      {error && <p className="error-message">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save product'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
