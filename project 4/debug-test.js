// Debug test script to validate functionality
console.log('🔍 Starting debug test...');

// Test environment variables
console.log('🌍 Environment check:');
console.log('VITE_SUPABASE_URL:', import.meta?.env?.VITE_SUPABASE_URL || 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta?.env?.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// Test if we're in production
console.log('🏗️ Build mode:', import.meta?.env?.MODE || 'unknown');
console.log('🏗️ Production:', import.meta?.env?.PROD || false);

// Test browser environment
console.log('🌐 Browser info:');
console.log('User Agent:', navigator?.userAgent || 'unknown');
console.log('Location:', window?.location?.href || 'unknown');

// Test localStorage
try {
  localStorage.setItem('test', 'working');
  console.log('💾 localStorage: working');
  localStorage.removeItem('test');
} catch (e) {
  console.error('💾 localStorage error:', e);
}

// Test console methods
console.log('📝 Console test: log working');
console.warn('⚠️ Console test: warn working');
console.error('❌ Console test: error working');

console.log('✅ Debug test complete');