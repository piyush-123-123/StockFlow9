import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';

export default function SettingsPage() {
  const { user } = useAuth();
  const [threshold, setThreshold] = useState('5');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const snapshot = await getDoc(
          doc(db, 'organizations', user.uid)
        );

        if (snapshot.exists()) {
          setThreshold(
            String(snapshot.data().defaultLowStockThreshold ?? 5)
          );
        }
      } catch (err) {
        setMessage(err.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user.uid]);

  async function handleSave(event) {
    event.preventDefault();
    setMessage('');

    const value = Number(threshold);

    if (threshold.trim() === '' || !Number.isInteger(value) || value < 0) {
      setMessage('Enter a valid whole number greater than or equal to 0.');
      return;
    }

    try {
      setSaving(true);

      await updateDoc(doc(db, 'organizations', user.uid), {
        defaultLowStockThreshold: value,
      });

      setMessage('Settings saved successfully.');
    } catch (err) {
      setMessage(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="inventory-page">Loading settings...</main>;
  }

  return (
    <main className="inventory-page">
      <header className="inventory-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your organization's inventory preferences.</p>
        </div>
      </header>

      <form className="product-form" onSubmit={handleSave}>
        <label htmlFor="threshold">
          Default low-stock threshold
        </label>

        <input
          id="threshold"
          type="number"
          min="0"
          step="1"
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          required
        />

        <p>
          Products with stock at or below this number will trigger a
          low-stock alert unless they have their own threshold.
        </p>

        {message && <p>{message}</p>}

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>
    </main>
  );
}