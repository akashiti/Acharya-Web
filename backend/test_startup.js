const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'startup_log.txt');
fs.writeFileSync(logFile, 'Starting test...\n', 'utf8');

try {
  fs.appendFileSync(logFile, 'Loading dotenv...\n');
  require('dotenv').config();
  
  fs.appendFileSync(logFile, 'Loading express...\n');
  require('express');
  
  fs.appendFileSync(logFile, 'Loading cors...\n');
  require('cors');
  
  fs.appendFileSync(logFile, 'Loading prisma client...\n');
  const prisma = require('./lib/prisma');
  
  fs.appendFileSync(logFile, 'Loading authRoutes...\n');
  require('./routes/authRoutes');
  
  fs.appendFileSync(logFile, 'Loading journalRoutes...\n');
  require('./routes/journalRoutes');
  
  fs.appendFileSync(logFile, 'Loading productRoutes...\n');
  require('./routes/productRoutes');
  
  fs.appendFileSync(logFile, 'Loading categoryRoutes...\n');
  require('./routes/categoryRoutes');
  
  fs.appendFileSync(logFile, 'Loading cartRoutes...\n');
  require('./routes/cartRoutes');
  
  fs.appendFileSync(logFile, 'Loading orderRoutes...\n');
  require('./routes/orderRoutes');
  
  fs.appendFileSync(logFile, 'Loading paymentRoutes...\n');
  require('./routes/paymentRoutes');
  
  fs.appendFileSync(logFile, 'Loading cmsRoutes...\n');
  require('./routes/cmsRoutes');
  
  fs.appendFileSync(logFile, 'Loading adminRoutes...\n');
  require('./routes/adminRoutes');
  
  fs.appendFileSync(logFile, 'All modules loaded successfully!\n');
} catch(e) {
  fs.appendFileSync(logFile, 'ERROR: ' + e.message + '\n' + e.stack + '\n');
}
