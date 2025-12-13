// Frontend Diagnostic Test - Run in Browser Console
// Copy and paste this into browser console at http://localhost:5173

console.log("=== SWEET SHOP DIAGNOSTIC TEST ===\n");

// Test 1: Check if we can reach backend
console.log("🧪 Test 1: Backend Connectivity");
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log("✅ Backend health:", d))
  .catch(e => console.error("❌ Backend error:", e));

// Test 2: Check API endpoint
console.log("\n🧪 Test 2: API Endpoint (/api/sweets)");
fetch('/api/sweets')
  .then(r => r.json())
  .then(d => {
    console.log("✅ Got sweets data:");
    console.log(`   Count: ${Array.isArray(d) ? d.length : 'Not an array'}`);
    if (Array.isArray(d) && d.length > 0) {
      console.log("   First item:", d[0]);
    }
  })
  .catch(e => console.error("❌ API error:", e));

// Test 3: Check localStorage
console.log("\n🧪 Test 3: LocalStorage");
const authData = localStorage.getItem('sweet_shop_auth');
if (authData) {
  const parsed = JSON.parse(authData);
  console.log("✅ Auth data found:");
  console.log("   User:", parsed.user);
  console.log("   Token exists:", !!parsed.token);
} else {
  console.log("⚠️  No auth data in localStorage");
}

// Test 4: Check React components
console.log("\n🧪 Test 4: DOM Elements");
const rootElement = document.getElementById('root');
console.log("✅ Root element exists:", !!rootElement);
console.log("   Root HTML:", rootElement?.innerHTML.substring(0, 100) + "...");

// Test 5: Vite HMR
console.log("\n🧪 Test 5: Vite HMR");
if (window.__VITE_HMR__) {
  console.log("✅ Vite HMR is connected");
} else {
  console.log("⚠️  Vite HMR not detected");
}

console.log("\n=== DIAGNOSTIC COMPLETE ===");
