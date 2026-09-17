import { env } from './env';

export type AuthenticationMode =
  | 'valid'
  | 'missing'
  | 'invalid-username'
  | 'invalid-password'
  | 'malformed';

export function createBasicAuthHeader(
  username = env.username,
  password = env.password,
): string {
  const credentials = Buffer.from(`${username}:${password}`).toString(
    'base64',
  );

  return `Basic ${credentials}`;
}

export function createAuthenticationHeaders(
  mode: AuthenticationMode = 'valid',
): Record<string, string> {
  switch (mode) {
    case 'valid':
      return {
        Authorization: createBasicAuthHeader(),
      };

    case 'missing':
      return {};

    case 'invalid-username':
      return {
        Authorization: createBasicAuthHeader(
          `invalid-${Date.now()}`,
          env.password,
        ),
      };

    case 'invalid-password':
      return {
        Authorization: createBasicAuthHeader(
          env.username,
          `invalid-${Date.now()}`,
        ),
      };

    case 'malformed':
      return {
        Authorization: 'Basic malformed-credentials',
      };

    default: {
      const unreachableMode: never = mode;
      throw new Error(`Unsupported authentication mode: ${unreachableMode}`);
    }
  }
}