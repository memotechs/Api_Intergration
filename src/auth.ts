import { env } from './env';

export type AuthenticationMode =
  | 'valid'
  | 'missing'
  | 'invalid-username'
  | 'invalid-password'
  | 'malformed'
  | 'unsupported';

export function createBasicAuthHeader(
  username = env.username,
  password = env.password,
): string {
  const encodedCredentials = Buffer.from(
    `${username}:${password}`,
    'utf8',
  ).toString('base64');

  return `Basic ${encodedCredentials}`;
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
          `invalid-user-${Date.now()}`,
          env.password,
        ),
      };

    case 'invalid-password':
      return {
        Authorization: createBasicAuthHeader(
          env.username,
          `invalid-password-${Date.now()}`,
        ),
      };

    case 'malformed':
      return {
        Authorization: 'Basic malformed-value',
      };

    case 'unsupported':
      return {
        Authorization: 'Bearer invalid-test-token',
      };

    default: {
      const exhaustiveCheck: never = mode;
      throw new Error(
        `Unsupported authentication mode: ${exhaustiveCheck}`,
      );
    }
  }
}