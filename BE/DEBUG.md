# Debugging 404 Errors

## Common Causes

1. **Server not running**
   - Check if server is running: `curl http://localhost:3000/health`
   - Start server: `npm run dev` or `npm start`

2. **Wrong port**
   - Default port is 3000
   - Check `.env` file for `PORT` variable
   - Verify frontend is calling correct port

3. **Route path mismatch**
   - Frontend base URL: `http://localhost:3000/api/v1`
   - Backend routes: `/api/v1/auth`, `/api/v1/courses`, etc.
   - Full endpoint example: `http://localhost:3000/api/v1/auth/login`

4. **CORS issues**
   - Check browser console for CORS errors
   - Verify `CORS_ORIGIN` in `.env` matches frontend URL
   - Default: `http://localhost:5173`

## Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### API Info
```bash
curl http://localhost:3000/api/v1
```

### Test Auth Endpoint (should return validation error, not 404)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

If you get 404, the route isn't registered. If you get validation error, the route is working.

## Check Server Logs

When you make a request, check the server console for:
- Route matching logs
- Error messages
- Request paths

## Verify Route Registration

The server should log on startup:
```
Server is running on port 3000
Environment: development
Health check: http://localhost:3000/health
```

## Frontend API Calls

Check browser Network tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Make a request from frontend
4. Check:
   - Request URL
   - Request Method
   - Response Status
   - Response Body

## Quick Fix Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Database is connected (check server logs)
- [ ] `.env` file exists and is configured
- [ ] Frontend `VITE_API_BASE_URL` matches backend URL
- [ ] CORS is configured correctly
- [ ] Routes are mounted in correct order
