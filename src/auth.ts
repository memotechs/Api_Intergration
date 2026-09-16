import { Buffer } from 'buffer';
import { env } from 'process';

export function basicAuthHeader(
  username = env.username,
  password = env.password,
): Record<string, string> {
  const encodedCredentials = Buffer.from(
    `${username}:${password}`,
  ).toString('base64');

  return {
    Authorization: `Basic ${encodedCredentials}`,
  };
}