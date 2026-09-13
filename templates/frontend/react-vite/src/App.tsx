import React, { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
}

export function App() {
  const [isDark, setIsDark] = useState(true);
  const [health, setHealth] = useState('Checking...');
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(49.99);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setHealth(data.status || 'Healthy'))
      .catch(() => setHealth('Offline / Connecting...'));

    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setProducts(data))
      .catch(() => {});
  }, []);

  const handleAdd = async () => {
    if (!name) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price }),
      });
      if (res.ok) {
        const item = await res.json();
        setProducts((prev) => [...prev, item]);
        setName('');
      }
    } catch {}
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>React Fullstack Starter</h1>
          <p style={{ color: 'var(--text-muted)' }}>Vite + React + High-Performance Backend</p>
        </div>
        <button
          className="btn-animate"
          onClick={() => setIsDark(!isDark)}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '1.5rem',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}
      >
        <strong>Backend Status: </strong>
        <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{health}</span>
      </div>

      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '1.5rem',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Database Items</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name..."
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            className="btn-animate"
            onClick={handleAdd}
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: 8,
              background: 'var(--accent-color)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Add Item
          </button>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {products.map((p) => (
            <li
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span>{p.name}</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>${p.price?.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default App;
