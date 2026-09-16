import { test, expect } from '@playwright/test';
import { basicAuthHeader } from '../../src/auth';

test.describe('Authentication API', () => {
  test('@smoke valid credentials return profile', async ({ request }) => {
    const response = await request.get('/api/auth/v1/me', {
      headers: basicAuthHeader(),
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toBeTruthy();
    expect(JSON.stringify(body).toLowerCase()).not.toContain('password');
  });
});