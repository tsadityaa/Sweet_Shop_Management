# Testing Guide - Admin Add Sweet Feature

## Current Setup - Complete Token Flow

### Frontend → Backend Authentication Flow:

```
1. ADMIN LOGIN
   Email: t.s.aditya35@gmail.com
   Password: Aditya@369
   ↓
2. LOGIN ENDPOINT (/api/auth/login)
   Frontend sends: { email, password }
   Backend returns: { user: {...}, token: "JWT_TOKEN_STRING" }
   ↓
3. FRONTEND SAVES TOKEN
   localStorage.setItem('sweet_shop_auth', 
     JSON.stringify({ 
       user: { id, email, role: 'admin', ... },
       token: "JWT_TOKEN_STRING"  ← ACTUAL JWT TOKEN
     })
   )
   ↓
4. WHEN ADDING SWEET
   Frontend retrieves token from localStorage
   Sends: Authorization: Bearer JWT_TOKEN_STRING
   ↓
5. BACKEND VERIFIES TOKEN
   Extracts token from Bearer header
   Verifies JWT signature
   If valid → CREATE SWEET IN DB ✅
```

## Testing Checklist

### Step 1: Clear Old Data
- [ ] Close browser completely
- [ ] Delete browser cookies/storage (or open private window)
- [ ] Make sure server is running

### Step 2: Login Fresh
1. Go to: http://localhost:5173/login
2. Enter credentials:
   - Email: `t.s.aditya35@gmail.com`
   - Password: `Aditya@369`
3. Click "Sign in"

### Step 3: Verify Login (Open Browser Console - F12)
Look for these logs in console:
```
🔐 Login response received
   User: { id: "...", email: "t.s.aditya35@gmail.com", role: "admin", ... }
   Token from server: "eyJhbGci..." (long JWT string starting with "eyJ")
✅ Token saved to localStorage
```

If you see "MISSING!" instead of a token, the server isn't returning it!

### Step 4: Check localStorage
In browser console, run:
```javascript
JSON.parse(localStorage.getItem('sweet_shop_auth'))
```

You should see:
```javascript
{
  user: { id: "...", email: "t.s.aditya35@gmail.com", role: "admin", ... },
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...." // Real JWT
}
```

### Step 5: Add Sweet
1. Go to: http://localhost:5173/admin
2. Click "Add Sweet" button
3. Fill form:
   - Name: TestSweet123
   - Category: Candies
   - Price: 9.99
   - Quantity: 5
   - Image URL: https://images.unsplash.com/photo-1587132137056-bfbf0166836e
   - Description: Test sweet
4. Click "Add Sweet"

### Step 6: Verify Request (Open Browser Console - F12, Network Tab)
Look for POST request to `/api/sweets`:

**Request Headers should include:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "TestSweet123",
  "category": "Candies",
  "price": 9.99,
  "stock": 5,
  "imageUrl": "https://...",
  "description": "Test sweet"
}
```

### Step 7: Check Server Logs
Server should show:
```
📝 POST /api/sweets - Create sweet request
   Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Token from Bearer header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ✅ Token verified! User: { id: "...", role: "admin", ... }
   📦 Creating sweet with data: { name: "TestSweet123", ... }
   💾 Saving to database...
   ✅ Sweet created successfully! ID: ...
   🎉 Returning response: { id: "...", name: "TestSweet123", ... }
```

### Step 8: Verify Database
Sweet should appear in:
1. ✅ Admin dashboard - visible in table
2. ✅ Dashboard page - visible in shop
3. ✅ MongoDB - check collection

## Troubleshooting

### Issue: "Failed to add sweet - 401"
**Cause:** Token not being sent
**Fix:** 
- Check browser console for token logs
- Verify token in localStorage
- Logout and login fresh

### Issue: "Token from server: MISSING!"
**Cause:** Server not returning JWT token
**Fix:**
- Check server logs during login
- Verify server returning: `{ user: {...}, token: "JWT..." }`
- Restart server if needed

### Issue: Browser shows no token logs
**Cause:** Auth context not logging properly
**Fix:**
- Refresh page (F5)
- Check network tab - does login response include token?
- Open DevTools before logging in

## Key Files Changed

1. **client/src/context/auth-context.tsx**
   - Lines 44-56: Now saves actual `data.token` (JWT) instead of `data.user.id`
   - Added console logs to verify token received

2. **client/src/context/sweets-context.tsx**  
   - Lines 18-50: Retrieves token from localStorage and sends as Bearer
   - Added console logs to track token in requests

3. **server/src/server.js**
   - Lines 210-217: Returns JWT token in login response
   - Lines 228-260: Validates Bearer token before creating sweet
   - Added detailed logging for debugging

## Success Criteria ✅

When working correctly, you should see:
- [ ] Login shows "Welcome back!" toast
- [ ] Redirects to `/admin` page
- [ ] Admin page loads sweet list
- [ ] Can click "Add Sweet" button
- [ ] Form submits without 401 error
- [ ] New sweet appears in table
- [ ] New sweet visible on dashboard page
- [ ] Browser console shows token logs
- [ ] Server logs show "✅ Sweet created successfully!"
