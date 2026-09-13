'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [health, setHealth] = useState('Connecting...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((d) => setHealth(d.status || 'Healthy'))
      .catch(() => setHealth('Offline / Connecting...'));
  }, []);

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1>Next.js Fullstack Starter</h1>
      <p style={{ color: '#666' }}>App Router with Unified Backend & AI Agent Configuration</p>
      <div style={{ marginTop: 24, padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
        <strong>Backend Status: </strong>
        <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{health}</span>
      </div>
    </main>
  );
}
