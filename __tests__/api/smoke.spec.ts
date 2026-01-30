import { test, expect, request } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api/v1';

test.describe('API Smoke Tests', () => {
  let memberToken: string;
  let adminToken: string;

  test.beforeAll(async () => {
    const apiContext = await request.newContext();
    
    const memberLogin = await apiContext.post(`${API_BASE}/auth/login`, {
      data: { email: 'member@library.local', password: 'Member123!' },
    });
    const memberData = await memberLogin.json();
    memberToken = memberData.data.accessToken;

    const adminLogin = await apiContext.post(`${API_BASE}/auth/login`, {
      data: { email: 'admin@library.local', password: 'Admin123!' },
    });
    const adminData = await adminLogin.json();
    adminToken = adminData.data.accessToken;
  });

  test('GET /health - should return healthy status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('running');
    expect(data.data.version).toBe('1.0.0');
  });

  test('GET /books - should list books', async ({ request }) => {
    const response = await request.get(`${API_BASE}/books`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.data).toBeInstanceOf(Array);
    expect(data.data.data.length).toBeGreaterThan(0);
  });

  test('GET /books/popular - should return popular books', async ({ request }) => {
    const response = await request.get(`${API_BASE}/books/popular`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.books).toBeInstanceOf(Array);
  });

  test('GET /books/recent - should return recent books', async ({ request }) => {
    const response = await request.get(`${API_BASE}/books/recent`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.books).toBeInstanceOf(Array);
  });

  test('POST /auth/login - should authenticate valid user', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'member@library.local', password: 'Member123!' },
    });
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.accessToken).toBeDefined();
    expect(data.data.refreshToken).toBeDefined();
    expect(data.data.user.email).toBe('member@library.local');
  });

  test('POST /auth/login - should reject invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: { email: 'invalid@test.com', password: 'wrongpassword' },
    });
    expect(response.status()).toBe(401);
  });

  test('GET /auth/profile - should require authentication', async ({ request }) => {
    const response = await request.get(`${API_BASE}/auth/profile`);
    expect(response.status()).toBe(401);
  });

  test('GET /auth/profile - should return user profile with token', async ({ request }) => {
    const response = await request.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe('member@library.local');
  });

  test('GET /loans/my - should return user loans', async ({ request }) => {
    const response = await request.get(`${API_BASE}/loans/my`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.loans).toBeInstanceOf(Array);
  });

  test('GET /reservations/my - should return user reservations', async ({ request }) => {
    const response = await request.get(`${API_BASE}/reservations/my`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.reservations).toBeInstanceOf(Array);
  });

  test('GET /notifications - should return user notifications', async ({ request }) => {
    const response = await request.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.notifications).toBeInstanceOf(Array);
    expect(typeof data.data.unreadCount).toBe('number');
  });

  test('GET /reports/dashboard - should require admin access', async ({ request }) => {
    const response = await request.get(`${API_BASE}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('GET /reports/dashboard - should return stats for admin', async ({ request }) => {
    const response = await request.get(`${API_BASE}/reports/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.circulation).toBeDefined();
    expect(data.data.books).toBeDefined();
    expect(data.data.users).toBeDefined();
    expect(data.data.financial).toBeDefined();
  });

  test('GET /books/isbn/:isbn - should lookup by ISBN', async ({ request }) => {
    const response = await request.get(`${API_BASE}/books/isbn/9780451524935`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.book.title).toBe('1984');
    expect(data.data.source).toBe('database');
  });
});
