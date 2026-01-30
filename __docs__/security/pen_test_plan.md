# Security Checklist and Pen Test Plan

## Security Checklist

### Authentication & Authorization
- [x] JWT-based authentication with short-lived access tokens (15 min)
- [x] Refresh token rotation (7 day expiry)
- [x] Password hashing with bcrypt (12 rounds)
- [x] Role-based access control (Admin, Librarian, Member, Guest)
- [x] Protected routes with authentication middleware
- [ ] Multi-factor authentication (future enhancement)
- [ ] Account lockout after failed attempts (future enhancement)

### Input Validation
- [x] Server-side validation with express-validator
- [x] Email format validation
- [x] Password complexity requirements (8+ chars, upper, lower, number)
- [x] UUID validation for IDs
- [x] ISBN format validation
- [x] Request body size limits (10MB)

### SQL Injection Prevention
- [x] Sequelize ORM with parameterized queries
- [x] No raw SQL string concatenation
- [ ] SQL injection test cases in security tests

### Cross-Site Scripting (XSS)
- [x] React's built-in XSS protection
- [x] Content-Type headers via Helmet
- [ ] CSP headers configuration
- [ ] Output encoding for user-generated content

### Cross-Site Request Forgery (CSRF)
- [x] SameSite cookie attribute
- [x] CORS configuration
- [ ] CSRF tokens for state-changing operations

### Rate Limiting
- [x] General rate limit: 100 requests per 15 minutes
- [x] Auth endpoints: 10 requests per 15 minutes
- [x] Strict limit for sensitive operations: 5 per minute

### Security Headers
- [x] Helmet middleware enabled
- [x] X-Content-Type-Options
- [x] X-Frame-Options
- [x] X-XSS-Protection
- [ ] Strict-Transport-Security (HTTPS in production)
- [ ] Content-Security-Policy (needs configuration)

### Data Protection
- [x] Sensitive fields excluded from JSON responses (password, tokens)
- [x] Environment variables for secrets
- [x] .gitignore for sensitive files
- [ ] Encryption at rest for sensitive data
- [ ] Data export functionality (GDPR compliance)

### Session Management
- [x] Stateless JWT authentication
- [x] Token expiration
- [x] Secure token storage (HTTP-only cookies recommended)
- [ ] Session invalidation on password change

### Error Handling
- [x] Generic error messages in production
- [x] Detailed errors only in development
- [x] Structured error logging
- [x] No stack traces leaked to clients

### Logging & Monitoring
- [x] Request logging with correlation IDs
- [x] Error logging with Winston
- [x] Audit logs for important actions
- [ ] Security event alerting

## Penetration Test Plan

### Test Environment
- **Target**: Library Management System API (localhost:3001)
- **Tools**: OWASP ZAP, Burp Suite, sqlmap, curl
- **Scope**: All API endpoints, authentication flows

### Test Cases

#### 1. Authentication Bypass
**Objective**: Attempt to access protected resources without valid credentials

**Steps**:
1. Access protected endpoints without Authorization header
2. Use expired JWT tokens
3. Modify JWT payload without re-signing
4. Test with invalid signatures

**Expected Result**: 401 Unauthorized for all attempts

**Commands**:
```bash
# No token
curl -X GET http://localhost:3001/api/v1/auth/profile

# Invalid token
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer invalid_token"

# Expired token (use a known expired token)
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2. SQL Injection
**Objective**: Attempt SQL injection through input fields

**Steps**:
1. Test login with SQL injection payloads
2. Test book search with injection attempts
3. Test all query parameters

**Payloads**:
```
' OR '1'='1
'; DROP TABLE users; --
1' UNION SELECT * FROM users --
admin'--
```

**Commands**:
```bash
# Login injection attempt
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com' OR '1'='1", "password":"anything"}'

# Search injection attempt
curl "http://localhost:3001/api/v1/books?q=' OR 1=1--"
```

**Expected Result**: Input validation errors, no database manipulation

#### 3. Cross-Site Scripting (XSS)
**Objective**: Inject malicious scripts through user inputs

**Steps**:
1. Create book with XSS payload in title
2. Create review with script tags
3. Test all text input fields

**Payloads**:
```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
javascript:alert('XSS')
```

**Expected Result**: Input sanitized or escaped, no script execution

#### 4. Insecure Direct Object Reference (IDOR)
**Objective**: Access resources belonging to other users

**Steps**:
1. Login as User A, get loan ID
2. Login as User B, attempt to renew User A's loan
3. Attempt to view other users' profiles
4. Attempt to cancel other users' reservations

**Commands**:
```bash
# As User B, try to renew User A's loan
curl -X POST http://localhost:3001/api/v1/loans/{userA_loanId}/renew \
  -H "Authorization: Bearer {userB_token}"
```

**Expected Result**: 403 Forbidden or 404 Not Found

#### 5. Rate Limiting
**Objective**: Verify rate limits are enforced

**Steps**:
1. Send 11+ login requests within 15 minutes
2. Send 101+ general requests within 15 minutes

**Commands**:
```bash
# Rapid login attempts
for i in {1..15}; do
  curl -X POST http://localhost:3001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com", "password":"wrong"}'
done
```

**Expected Result**: 429 Too Many Requests after limit exceeded

#### 6. Privilege Escalation
**Objective**: Attempt to gain higher privileges

**Steps**:
1. Register as member
2. Attempt to access admin endpoints
3. Attempt to modify user role via API
4. Attempt to access librarian-only functions

**Commands**:
```bash
# Member trying to create book (librarian only)
curl -X POST http://localhost:3001/api/v1/books \
  -H "Authorization: Bearer {member_token}" \
  -H "Content-Type: application/json" \
  -d '{"isbn":"1234567890", "title":"Test"}'

# Attempt to change own role
curl -X PUT http://localhost:3001/api/v1/users/{userId} \
  -H "Authorization: Bearer {member_token}" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

**Expected Result**: 403 Forbidden

#### 7. Information Disclosure
**Objective**: Check for sensitive data leakage

**Steps**:
1. Review error messages for internal details
2. Check response headers for server info
3. Attempt to access hidden endpoints
4. Review API responses for sensitive fields

**Expected Result**: No sensitive information disclosed

#### 8. File Upload Vulnerabilities
**Objective**: Test file upload security (profile photos, book covers)

**Steps**:
1. Upload executable file disguised as image
2. Upload oversized file
3. Upload file with path traversal in name
4. Upload file with malicious metadata

**Expected Result**: Validation errors, file rejected

### OWASP ZAP Scan Configuration

```bash
# Run automated scan
docker run -t owasp/zap2docker-stable zap-api-scan.py \
  -t http://host.docker.internal:3001/api/v1 \
  -f openapi \
  -r zap-report.html
```

### Post-Test Actions

1. Document all findings with severity ratings
2. Create issues for each vulnerability found
3. Prioritize fixes based on severity and exploitability
4. Re-test after fixes are applied
5. Update this document with remediation status
