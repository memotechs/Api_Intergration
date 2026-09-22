import { test, expect } from '../../fixtures/api.fixure';
import { createBasicAuthHeader } from '../../src/auth';
import { sanitize } from '../../src/sanitized-logger';

type JsonObject = Record<string, unknown>;

const rejectedStatuses = [401, 403];

const sensitiveKeyPatterns = [
  'password',
  'authorization',
  'credential',
  'secret',
  'secretkey',
  'api_key',
  'x-api-key',
  'x-secret-key',
  'access_token',
  'refresh_token',
  'private_key',
  'password_hash',
];

const unsafeErrorPatterns = [
  /stack trace/i,
  /\bat\s+\S+\s+\(.+:\d+:\d+\)/i,
  /basic strategy/i,
  /passport/i,
  /database/i,
  /sql/i,
  /process\.env/i,
  /api_basic_auth_password/i,
  /api_basic_auth_username/i,
];

function isJsonObject(value: unknown): value is JsonObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

async function readResponseBody(
  response: {
    text(): Promise<string>;
  },
): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function collectObjectKeys(
  value: unknown,
  keys: string[] = [],
): string[] {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectObjectKeys(item, keys);
    }

    return keys;
  }

  if (isJsonObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      keys.push(key.toLowerCase());
      collectObjectKeys(item, keys);
    }
  }

  return keys;
}

function expectNoSensitiveFields(body: unknown): void {
  const keys = collectObjectKeys(body);

  for (const sensitiveKey of sensitiveKeyPatterns) {
    expect(keys).not.toContain(sensitiveKey);
  }
}

function expectSafeResponseContent(body: unknown): void {
  const content = JSON.stringify(body);

  for (const pattern of unsafeErrorPatterns) {
    expect(pattern.test(content)).toBe(false);
  }
}

function expectAuthenticationRejected(
  status: number,
  body: unknown,
): void {
  expect(rejectedStatuses).toContain(status);
  expectSafeResponseContent(body);
  expectNoSensitiveFields(body);

  if (isJsonObject(body)) {
    const hasControlledErrorField =
      'message' in body ||
      'error' in body ||
      'statusCode' in body ||
      'code' in body;

    expect(hasControlledErrorField).toBe(true);
  }
}

test.describe(
  'Authentication API — GET /api/auth/v1/me',
  {
    tag: ['@authentication', '@regression'],
  },
  () => {
    test(
      'AUTH-001: valid Basic Authentication returns a profile',
      {
        tag: '@smoke',
      },
      async ({ apiClient }) => {
        const response = await apiClient.get('/api/auth/v1/me');

        expect(response.status()).toBe(200);

        const contentType =
          response.headers()['content-type'] ?? '';

        expect(contentType.toLowerCase()).toContain(
          'application/json',
        );

        const body = await readResponseBody(response);

        expect(isJsonObject(body)).toBe(true);
        expectNoSensitiveFields(body);
        expectSafeResponseContent(body);
      },
    );

    test(
      'AUTH-002: missing Authorization header is rejected',
      {
        tag: '@negative',
      },
      async ({ apiClient }) => {
        const response = await apiClient.get('/api/auth/v1/me', {
          authMode: 'missing',
        });

        const body = await readResponseBody(response);

        expectAuthenticationRejected(response.status(), body);
      },
    );

    test(
      'AUTH-003: invalid username is rejected',
      {
        tag: '@negative',
      },
      async ({ apiClient }) => {
        const response = await apiClient.get('/api/auth/v1/me', {
          authMode: 'invalid-username',
        });

        const body = await readResponseBody(response);

        expectAuthenticationRejected(response.status(), body);
      },
    );

    test(
      'AUTH-004: invalid password is rejected',
      {
        tag: '@negative',
      },
      async ({ apiClient }) => {
        const response = await apiClient.get('/api/auth/v1/me', {
          authMode: 'invalid-password',
        });

        const body = await readResponseBody(response);

        expectAuthenticationRejected(response.status(), body);
      },
    );

    test(
      'AUTH-005: malformed Basic Authentication is rejected',
      {
        tag: '@negative',
      },
      async ({ apiClient }) => {
        const response = await apiClient.get('/api/auth/v1/me', {
          authMode: 'malformed',
        });

        const body = await readResponseBody(response);

        expectAuthenticationRejected(response.status(), body);
      },
    );

    test(
      'AUTH-006: unsupported authorization scheme is rejected',
      {
        tag: '@negative',
      },
      async ({ apiClient }) => {
        const response = await apiClient.get('/api/auth/v1/me', {
          authMode: 'unsupported',
        });

        const body = await readResponseBody(response);

        expectAuthenticationRejected(response.status(), body);
      },
    );

    test(
      'AUTH-007: profile does not expose encoded credentials',
      async ({ apiClient }) => {
        const response = await apiClient.get('/api/auth/v1/me');

        expect(response.status()).toBe(200);

        const responseText = await response.text();
        const authorizationValue = createBasicAuthHeader();

        const exposesCredentials =
          responseText.includes(authorizationValue);

        expect(exposesCredentials).toBe(false);
      },
    );

    test(
      'AUTH-008: sanitizer masks authentication information',
      async () => {
        const sanitized = sanitize({
          headers: {
            Authorization: 'Basic sensitive-value',
          },
          username: 'test-user',
          password: 'test-password',
          nested: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token',
          },
        });

        expect(sanitized).toEqual({
          headers: {
            Authorization: '<REDACTED>',
          },
          username: 'test-user',
          password: '<REDACTED>',
          nested: {
            access_token: '<REDACTED>',
            refresh_token: '<REDACTED>',
          },
        });
      },
    );
  },
);