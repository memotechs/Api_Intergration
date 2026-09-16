import 'dotenv/config';

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  baseURL: getRequiredEnvironmentVariable('API_BASE_URL'),
  username: getRequiredEnvironmentVariable('API_BASIC_AUTH_USERNAME'),
  password: getRequiredEnvironmentVariable('API_BASIC_AUTH_PASSWORD'),
} as const;