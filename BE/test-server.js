// Quick test script to verify server setup
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;

console.log('Testing server configuration...');
console.log(`Port: ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Database URL: ${process.env.DATABASE_URL ? 'Set' : 'NOT SET'}`);

// Try to import and start server
try {
  console.log('\nAttempting to start server...');
  const app = await import('./src/server.js');
  console.log('✅ Server module loaded successfully');
  console.log('\nIf you see "Server is running on port X" above, the server started correctly.');
  console.log('If not, check for errors in the output above.');
} catch (error) {
  console.error('❌ Error starting server:', error.message);
  console.error(error.stack);
  process.exit(1);
}
