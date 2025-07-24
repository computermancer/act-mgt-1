require('dotenv').config();
const { execSync } = require('child_process');

console.log('Starting development server with environment variables...');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Not set');
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

// Start the React development server
try {
  console.log('🚀 Starting development server...');
  execSync('react-scripts start', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start development server:', error.message);
  process.exit(1);
}
