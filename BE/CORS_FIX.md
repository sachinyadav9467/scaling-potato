# CORS Configuration Fix

## What Was Changed

The CORS configuration has been updated to be more permissive in development mode and handle multiple origins.

## New CORS Behavior

### Development Mode
- **Automatically allows all localhost origins** (any port)
- Examples: `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`, etc.

### Production Mode
- Only allows origins specified in `CORS_ORIGIN` environment variable
- Can specify multiple origins separated by commas: `http://localhost:5173,https://yourdomain.com`

## Environment Variable

In your `.env` file, you can set:

```env
# Single origin
CORS_ORIGIN=http://localhost:5173

# Multiple origins (comma-separated)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

## Testing CORS

### Check if CORS is working:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make a request from your frontend
4. Check the response headers for:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Credentials`

### Test with curl:
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3000/api/v1/auth/login \
     -v
```

You should see `Access-Control-Allow-Origin: http://localhost:5173` in the response.

## Common CORS Issues

### Issue: "Access-Control-Allow-Origin" header missing
**Solution:** Make sure CORS middleware is applied before routes

### Issue: Credentials not working
**Solution:** Both frontend and backend need `credentials: true`
- Backend: Already configured ✅
- Frontend: Make sure fetch includes `credentials: 'include'`

### Issue: Preflight (OPTIONS) requests failing
**Solution:** CORS middleware handles this automatically ✅

## Frontend Configuration

If you're still getting CORS errors, check your frontend fetch calls:

```javascript
// Make sure credentials are included
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important!
  body: JSON.stringify(data)
});
```

## Restart Required

After updating the CORS configuration, **restart your server**:

```bash
cd BE
npm run dev
```

The new CORS configuration will be active immediately.
