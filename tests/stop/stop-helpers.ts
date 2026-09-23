import { expect, type APIResponse } from '@playwright/test';

export type JsonObject = Record<string, unknown>;

export interface Stop {
  id: number;
  name: string;
  nameKh: string;
  phone: string | null;
  address: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
}

export interface StopPair {
  startStop: Stop;
  endStop: Stop;
}

export function isObject(
  value: unknown,
): value is JsonObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function readBody(
  response: APIResponse,
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

export function expectJsonResponse(
  response: APIResponse,
): void {
  const contentType =
    response.headers()['content-type'] ?? '';

  expect(contentType.toLowerCase()).toContain(
    'application/json',
  );
}

export function extractItems(body: unknown): unknown[] {
  if (Array.isArray(body)) {
    return body;
  }

  if (!isObject(body)) {
    return [];
  }

  if (Array.isArray(body.items)) {
    return body.items;
  }

  if (Array.isArray(body.data)) {
    return body.data;
  }

  if (
    isObject(body.data) &&
    Array.isArray(body.data.items)
  ) {
    return body.data.items;
  }

  return [];
}

export function extractStops(body: unknown): Stop[] {
  return extractItems(body).filter(
    (item): item is Stop =>
      isObject(item) &&
      typeof item.id === 'number',
  );
}

export function extractPairs(
  body: unknown,
): StopPair[] {
  return extractItems(body).filter(
    (item): item is StopPair =>
      isObject(item) &&
      isObject(item.startStop) &&
      isObject(item.endStop) &&
      typeof item.startStop.id === 'number' &&
      typeof item.endStop.id === 'number',
  );
}

function expectNullableString(
  value: unknown,
): void {
  expect(
    value === null ||
      value === undefined ||
      typeof value === 'string',
  ).toBe(true);
}

function expectNullableCoordinate(
  value: unknown,
): void {
  expect(
    value === null ||
      value === undefined ||
      typeof value === 'number' ||
      typeof value === 'string',
  ).toBe(true);
}

export function expectValidStop(stop: Stop): void {
  expect(typeof stop.id).toBe('number');
  expect(stop.id).toBeGreaterThan(0);

  expect(typeof stop.name).toBe('string');
  expect(stop.name.trim().length).toBeGreaterThan(0);

  expectNullableString(stop.nameKh);
  expectNullableString(stop.phone);
  expectNullableString(stop.address);
  expectNullableCoordinate(stop.latitude);
  expectNullableCoordinate(stop.longitude);
}

export function expectNoDuplicateIds(
  stops: Stop[],
): void {
  const ids = stops.map((stop) => stop.id);

  expect(new Set(ids).size).toBe(ids.length);
}

export function expectAscending(
  values: number[],
): void {
  const sorted = [...values].sort(
    (first, second) => first - second,
  );

  expect(values).toEqual(sorted);
}

export function expectDescending(
  values: number[],
): void {
  const sorted = [...values].sort(
    (first, second) => second - first,
  );

  expect(values).toEqual(sorted);
}

export function expectAuthenticationRejected(
  response: APIResponse,
): void {
  expect([401, 403]).toContain(response.status());
}

export function expectValidationRejected(
  response: APIResponse,
): void {
  expect([400, 422]).toContain(response.status());
}

export function expectNoSensitiveData(
  body: unknown,
): void {
  const content = JSON.stringify(body).toLowerCase();

  const sensitiveValues = [
    'authorization',
    'password',
    'access_token',
    'refresh_token',
    'secret_key',
    'api_key',
    'private_key',
    'password_hash',
  ];

  for (const sensitiveValue of sensitiveValues) {
    expect(content).not.toContain(sensitiveValue);
  }
}

export function expectControlledResponse(
  response: APIResponse,
): void {
  // Client errors are controlled. Server 500 errors are defects.
  expect(response.status()).toBeLessThan(500);
}