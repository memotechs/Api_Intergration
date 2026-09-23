import { test, expect } from '../../fixtures/api.fixure';
import { stopTestData } from '../../test-data/stop';

import {
  expectAuthenticationRejected,
  expectControlledResponse,
  expectJsonResponse,
  expectNoSensitiveData,
  expectValidStop,
  expectValidationRejected,
  extractPairs,
  isObject,
  readBody,
} from './stop-helpers';

const endpoint = '/api/stop/v1/available-pairs';

test.describe(
  'Stops API — Available Stop Pairs',
  {
    tag: ['@stops', '@regression'],
  },
  () => {
    test(
      'STOP-PAIR-001: valid date returns available stop pairs',
      {
        tag: '@smoke',
      },
      async ({ apiClient }) => {
        const response = await apiClient.get(endpoint, {
          params: {
            date: stopTestData.validDate,
          },
        });

        expect(response.status()).toBe(200);
        expectJsonResponse(response);

        const body = await readBody(response);

        expect(isObject(body)).toBe(true);
        expectNoSensitiveData(body);
      },
    );

    test(
      'STOP-PAIR-002: validate TStopPair and TStop fields',
      async ({ apiClient }) => {
        const response = await apiClient.get(endpoint, {
          params: {
            date: stopTestData.validDate,
          },
        });

        expect(response.status()).toBe(200);

        const body = await readBody(response);
        const pairs = extractPairs(body);

        for (const pair of pairs) {
          expectValidStop(pair.startStop);
          expectValidStop(pair.endStop);

          expect(pair.startStop.id).not.toBe(
            pair.endStop.id,
          );
        }
      },
    );

    test(
      'STOP-PAIR-003: response contains no duplicate pairs',
      async ({ apiClient }) => {
        const response = await apiClient.get(endpoint, {
          params: {
            date: stopTestData.validDate,
          },
        });

        const pairs = extractPairs(
          await readBody(response),
        );

        const pairKeys = pairs.map(
          (pair) =>
            `${pair.startStop.id}-${pair.endStop.id}`,
        );

        expect(new Set(pairKeys).size).toBe(
          pairKeys.length,
        );
      },
    );

    test(
      'STOP-PAIR-004: missing date is rejected',
      {
        tag: '@negative',
      },
      async ({ apiClient }) => {
        const response = await apiClient.get(endpoint);
        const body = await readBody(response);

        expectControlledResponse(response);
        expectValidationRejected(response);
        expectNoSensitiveData(body);
      },
    );

    const invalidDateCases = [
      {
        id: 'STOP-PAIR-005',
        name: 'empty date',
        date: stopTestData.invalidDates.empty,
      },
      {
        id: 'STOP-PAIR-006',
        name: 'text date',
        date: stopTestData.invalidDates.text,
      },
      {
        id: 'STOP-PAIR-007',
        name: 'ISO date format',
        date: stopTestData.invalidDates.isoFormat,
      },
      {
        id: 'STOP-PAIR-008',
        name: 'slash date format',
        date: stopTestData.invalidDates.slashFormat,
      },
      {
        id: 'STOP-PAIR-009',
        name: 'impossible date',
        date: stopTestData.invalidDates.impossibleDate,
      },
      {
        id: 'STOP-PAIR-010',
        name: 'invalid day',
        date: stopTestData.invalidDates.invalidDay,
      },
      {
        id: 'STOP-PAIR-011',
        name: 'invalid month',
        date: stopTestData.invalidDates.invalidMonth,
      },
    ];

    for (const dateCase of invalidDateCases) {
      test(
        `${dateCase.id}: reject ${dateCase.name}`,
        {
          tag: '@negative',
        },
        async ({ apiClient }) => {
          const response = await apiClient.get(endpoint, {
            params: {
              date: dateCase.date,
            },
          });

          const body = await readBody(response);

          expectControlledResponse(response);
          expectValidationRejected(response);
          expectNoSensitiveData(body);
        },
      );
    }

    const controlledDateCases = [
      {
        id: 'STOP-PAIR-012',
        name: 'past date',
        date: stopTestData.pastDate,
      },
      {
        id: 'STOP-PAIR-013',
        name: 'near-future date',
        date: stopTestData.nearFutureDate,
      },
      {
        id: 'STOP-PAIR-014',
        name: 'far-future date',
        date: stopTestData.farFutureDate,
      },
    ];

    for (const dateCase of controlledDateCases) {
      test(
        `${dateCase.id}: handle ${dateCase.name}`,
        async ({ apiClient }) => {
          const response = await apiClient.get(endpoint, {
            params: {
              date: dateCase.date,
            },
          });

          expect(response.status()).toBe(200);
          expectJsonResponse(response);

          const body = await readBody(response);
          const pairs = extractPairs(body);

          for (const pair of pairs) {
            expectValidStop(pair.startStop);
            expectValidStop(pair.endStop);
          }

          expectNoSensitiveData(body);
        },
      );
    }

    const authenticationCases = [
      {
        id: 'STOP-PAIR-AUTH-001',
        name: 'missing Authorization',
        mode: 'missing' as const,
      },
      {
        id: 'STOP-PAIR-AUTH-002',
        name: 'invalid username',
        mode: 'invalid-username' as const,
      },
      {
        id: 'STOP-PAIR-AUTH-003',
        name: 'invalid password',
        mode: 'invalid-password' as const,
      },
      {
        id: 'STOP-PAIR-AUTH-004',
        name: 'malformed Basic Authentication',
        mode: 'malformed' as const,
      },
    ];

    for (const authCase of authenticationCases) {
      test(
        `${authCase.id}: reject ${authCase.name}`,
        {
          tag: ['@negative', '@authentication'],
        },
        async ({ apiClient }) => {
          const response = await apiClient.get(endpoint, {
            authMode: authCase.mode,
            params: {
              date: stopTestData.validDate,
            },
          });

          const body = await readBody(response);

          expectControlledResponse(response);
          expectAuthenticationRejected(response);
          expectNoSensitiveData(body);
        },
      );
    }
  },
);