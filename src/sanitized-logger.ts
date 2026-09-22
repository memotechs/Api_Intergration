const SENSITIVE_KEYS = new Set([
  'authorization',
  'password',
  'credential',
  'credentials',
  'secret',
  'secret_key',
  'secretkey',
  'api_key',
  'apikey',
  'x-api-key',
  'x-secret-key',
  'token',
  'access_token',
  'refresh_token',
  'cookie',
  'set-cookie',
]);

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

export function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        isSensitiveKey(key) ? '<REDACTED>' : sanitize(item),
      ]),
    );
  }

  return value;
}

export function logSanitized(
  label: string,
  value: unknown,
): void {
  console.log(label, JSON.stringify(sanitize(value), null, 2));
}