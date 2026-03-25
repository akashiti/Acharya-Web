const fs = require('fs');
const log = (msg) => fs.appendFileSync('boot_log.txt', msg + '\n');

try {
  log('Starting boot test...');
  require('dotenv').config();
  log('dotenv loaded');
  
  const express = require('express');
  log('express loaded');
  
  const cors = require('cors');
  log('cors loaded');

  // Test each route file
  const routes = [
    'authRoutes', 'journalRoutes', 'productRoutes', 'categoryRoutes',
    'cartRoutes', 'orderRoutes', 'paymentRoutes', 'cmsRoutes', 'adminRoutes'
  ];

  for (const r of routes) {
    try {
      require(`./routes/${r}`);
      log(`${r}: OK`);
    } catch (e) {
      log(`${r}: ERROR - ${e.message}`);
      log(e.stack);
    }
  }

  log('All routes checked. Starting server...');
  
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  
  for (const r of routes) {
    try {
      app.use(`/api/test-${r}`, require(`./routes/${r}`));
    } catch (e) {
      log(`Mount ${r}: ERROR - ${e.message}`);
    }
  }
  
  const PORT = 5001;
  app.listen(PORT, () => {
    log(`Server started on port ${PORT}`);
    
    // Self-test
    const http = require('http');
    http.get(`http://localhost:${PORT}/api/health`, (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('end', () => {
        log(`Health check response: ${data}`);
        log('SUCCESS - Server is working');
        process.exit(0);
      });
    }).on('error', (e) => {
      log(`Health check error: ${e.message}`);
      process.exit(1);
    });
  });
} catch (e) {
  log(`FATAL: ${e.message}`);
  log(e.stack);
  process.exit(1);
}
