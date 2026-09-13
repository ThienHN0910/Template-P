import http from 'http';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/api/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'Healthy', timestamp: new Date().toISOString() }));
  }

  res.writeHead(200);
  res.end(JSON.stringify({ message: 'Minimal Blank Node.js Server', status: 'Healthy' }));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Minimal server running on http://localhost:${PORT}`);
});
