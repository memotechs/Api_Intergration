import {
  test as base,
  expect,
} from '@playwright/test';
import { ApiClient } from '../src/api-client';

interface ApiFixtures {
  apiClient: ApiClient;
}

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});

export { expect };