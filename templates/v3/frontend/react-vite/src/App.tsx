import React, { useEffect, useState } from 'react';
import { ApiClient, type Product } from '@project/api-client';

const client = new ApiClient();

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Product Catalog (Golden Slice)</h1>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong> - ${p.price} ({p.description})
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
