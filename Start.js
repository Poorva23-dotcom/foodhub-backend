// Simple startup test
console.log('Starting server...');
try {
  require('./server.js');
} catch (err) {
  console.error('Server error:', err.message);
  console.error(err.stack);
  process.exit(1);
}