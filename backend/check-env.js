require('dotenv').config();

console.log('=== Environment Variables Check ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Set' : '✗ Missing');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || '✗ Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '✗ Missing');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✓ Set' : '✗ Missing');
console.log('SECRET_KEY:', process.env.SECRET_KEY ? '✓ Set' : '✗ Missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');

console.log('\n=== Values (first 10 chars) ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...' : 'Not set'); 