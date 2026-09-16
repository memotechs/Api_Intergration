import { test, expect } from '../../fixtures/api.fixure';
import { sanitize } from '../../src/sanitized-logger';

test.describe('Test Framework Configuration', () => {
  test('@smoke framework sends an authenticated API request', async ({
    apiClient,
  }) => {
    const response = await apiClient.get('/api/auth/v1/me');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();

    expect(body).toBeTruthy();
    expect(typeof body).toBe('object');
  });

  test('sanitizer masks sensitive values', async () => {
    const result = sanitize({
      Authorization: 'Basic secret-value',
      password: 'secret-password',
      profile: {
        access_token: 'secret-token',
        name: 'Framework Test',
      },
    });

    expect(result).toEqual({
      Authorization: '<REDACTED>',
      password: '<REDACTED>',
      profile: {
        access_token: '<REDACTED>',
        name: 'Framework Test',
      },
    });
  });

  test('API client supports requests without authentication', async ({
  apiClient,
}) => {
  const response = await apiClient.get('/api/auth/v1/me', {
    authMode: 'missing',
  });

  expect([401, 403]).toContain(response.status());
});
});