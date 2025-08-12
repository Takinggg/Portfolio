# Manual Testing Guide for Admin Scheduling API Error Handling

This guide provides manual testing steps to verify that the admin scheduling views handle various API response scenarios correctly.

## Prerequisites

- Admin credentials configured in environment variables:
  - `VITE_ADMIN_USERNAME`
  - `VITE_ADMIN_PASSWORD`
- Server running with scheduling API endpoints
- Access to browser developer tools (Network panel)

## Testing Scenarios

### 1. Successful JSON Responses

**Test**: Verify admin views load correctly with valid JSON responses.

```bash
# Test Overview endpoint
curl -X GET "http://localhost:3001/api/admin/scheduling/overview" \
  -H "Accept: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -v

# Expected: 200 OK with application/json content-type
# Response should contain stats and auditStats objects
```

**Frontend verification**:
1. Open Admin → Overview
2. Check Network panel shows `application/json` content-type
3. Verify data loads without errors
4. No error banners should be visible

### 2. HTML Error Responses (Server Returns HTML Instead of JSON)

**Test**: Simulate server returning HTML error pages.

```bash
# Test with invalid endpoint that might return HTML 404
curl -X GET "http://localhost:3001/api/admin/scheduling/nonexistent" \
  -H "Accept: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -v

# Expected: 404 with text/html content-type
```

**Frontend verification**:
1. Temporarily modify API URL in code to point to invalid endpoint
2. Open Admin → Overview  
3. Should see error banner with message: "Le serveur a retourné du text/html au lieu de JSON"
4. Click "Détails" to see response snippet, URL, and status code
5. Click "Réessayer" button should retry the request

### 3. Authentication Errors (401/403)

**Test**: Verify handling of authentication failures.

```bash
# Test with invalid credentials
curl -X GET "http://localhost:3001/api/admin/scheduling/overview" \
  -H "Accept: application/json" \
  -H "Authorization: Basic invalid_credentials" \
  -v

# Expected: 401 Unauthorized
```

**Frontend verification**:
1. Temporarily use invalid admin credentials
2. Open Admin → Overview
3. Should see yellow authentication error banner
4. Message should be: "Session expirée. Veuillez vous reconnecter."
5. Click "Se reconnecter" should prompt for re-authentication or reload page

### 4. 302 HTML Redirects

**Test**: Server returns HTML redirect response.

```bash
# Test endpoint that might redirect
curl -X GET "http://localhost:3001/api/admin/scheduling/overview" \
  -H "Accept: application/json" \
  -L \
  -v

# Check if server returns 302 with HTML content
```

**Frontend verification**:
1. Configure server to return 302 redirects for admin endpoints
2. Try accessing any admin view
3. Should see error banner explaining HTML redirect was received
4. Details should show status 302 and HTML snippet

### 5. 400 JSON Validation Errors

**Test**: Send invalid data to trigger validation errors.

```bash
# Test creating event type with invalid data
curl -X POST "http://localhost:3001/api/admin/scheduling/event-types" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -d '{"name":"","duration_minutes":"invalid"}' \
  -v

# Expected: 400 Bad Request with JSON error details
```

**Frontend verification**:
1. Open Admin → Event Types
2. Try creating event type with empty name
3. Should see alert with clear validation error message
4. No "Session expirée" message should appear

### 6. Invalid JSON Responses

**Test**: Server returns malformed JSON.

```bash
# Modify server temporarily to return invalid JSON
# Or test with endpoint that might return corrupted JSON
curl -X GET "http://localhost:3001/api/admin/scheduling/overview" \
  -H "Accept: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -v

# Check response body for malformed JSON
```

**Frontend verification**:
1. Configure server to return malformed JSON (e.g., truncated response)
2. Open Admin → Overview
3. Should see error banner: "Réponse JSON invalide du serveur"
4. Details should show the attempted JSON parse error

### 7. Network Failures

**Test**: Simulate network connectivity issues.

**Frontend verification**:
1. Disconnect from network or block localhost in firewall
2. Try opening Admin → Overview
3. Should see blue network error banner
4. Message: "Erreur de connexion. Vérifiez votre connexion internet."
5. Reconnect and click "Réessayer" should work

### 8. Mixed Content Types in Single Session

**Test**: Verify consistent handling across different admin views.

```bash
# Test multiple endpoints
curl -X GET "http://localhost:3001/api/admin/scheduling/event-types" \
  -H "Accept: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -v

curl -X GET "http://localhost:3001/api/admin/scheduling/bookings" \
  -H "Accept: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -v

curl -X GET "http://localhost:3001/api/admin/scheduling/availability-rules" \
  -H "Accept: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -v
```

**Frontend verification**:
1. Navigate through all admin views: Overview, Event Types, Bookings, Availability, Notifications, Agenda
2. Verify all show proper loading states
3. Check Network panel shows `application/json` for all requests
4. Verify `credentials: include` is set on all requests
5. Confirm consistent error handling if any endpoint fails

## Network Panel Verification

For all tests, verify in browser Developer Tools → Network panel:

**Request Headers Should Include**:
- `Accept: application/json`
- `Content-Type: application/json` (for POST/PATCH requests)
- `Authorization: Basic [base64-encoded-credentials]`
- Request shows `credentials: include`

**Response Headers Should Show**:
- `Content-Type: application/json` for successful responses
- Proper status codes (200, 201, 400, 401, 404, 500, etc.)

## Error Banner Testing

For each error scenario, verify the ErrorBanner component:

**Visual Elements**:
- ✅ Appropriate colored background (red for errors, yellow for auth, blue for network)
- ✅ Clear error icon
- ✅ Primary error message in user's language (French)
- ✅ "Réessayer" button for retryable errors
- ✅ "Se reconnecter" button for auth errors
- ✅ "Détails" button with expandable technical information

**Technical Details Section**:
- ✅ Shows HTTP status code
- ✅ Shows request URL
- ✅ Shows response Content-Type
- ✅ Shows response snippet (first 200 characters)
- ✅ Formatted clearly with proper spacing

## CRUD Operations Testing

Test error handling for each CRUD operation:

```bash
# CREATE - Event Type
curl -X POST "http://localhost:3001/api/admin/scheduling/event-types" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -d '{"name":"Test Event","duration_minutes":30,"location_type":"visio","color":"#FF0000"}'

# READ - List Bookings  
curl -X GET "http://localhost:3001/api/admin/scheduling/bookings" \
  -H "Accept: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)"

# UPDATE - Modify Event Type
curl -X PATCH "http://localhost:3001/api/admin/scheduling/event-types/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -d '{"name":"Updated Event"}'

# DELETE - Remove Event Type
curl -X DELETE "http://localhost:3001/api/admin/scheduling/event-types/1" \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)"
```

## Expected Outcomes Summary

| Scenario | Expected Error Message | Banner Color | Has Retry | Has Details |
|----------|----------------------|--------------|-----------|-------------|
| HTML Response | "Le serveur a retourné du text/html au lieu de JSON" | Red | ✅ | ✅ |
| 401/403 Auth | "Session expirée. Veuillez vous reconnecter." | Yellow | ❌ | ✅ |
| Network Error | "Erreur de connexion. Vérifiez votre connexion internet." | Blue | ✅ | ❌ |
| Invalid JSON | "Réponse JSON invalide du serveur" | Red | ✅ | ✅ |
| 400 Validation | [Specific validation message] | Alert | ❌ | ❌ |
| 500 Server Error | "Erreur interne du serveur. Veuillez réessayer plus tard." | Red | ✅ | ✅ |

## Test Completion Checklist

- [ ] All admin views load successfully with valid responses
- [ ] HTML error responses show proper error banners with details
- [ ] 401/403 responses trigger authentication error banners
- [ ] Network failures show connectivity error messages
- [ ] Malformed JSON responses are handled gracefully
- [ ] Error details are expandable and contain useful debugging info
- [ ] Retry functionality works for retryable errors
- [ ] All requests include proper headers (Accept, Authorization, credentials)
- [ ] Response Content-Type is validated for all endpoints
- [ ] CRUD operations handle errors consistently across all admin views

## Notes for Operators

- Server should always return `application/json` content-type for API endpoints
- Proxy configurations should preserve content-type headers
- Authentication middleware should return JSON error responses, not HTML redirects
- Consider implementing proper CORS headers if accessing from different domains
- Monitor server logs for HTML responses being sent to API endpoints