import type {
  APIRequestContext,
  APIResponse,
} from '@playwright/test';

import {
  createAuthenticationHeaders,
  type AuthenticationMode,
} from './auth';

import { sanitize } from './sanitized-logger';

type QueryPrimitive = string | number | boolean;

type QueryValue =
  | QueryPrimitive
  | ReadonlyArray<QueryPrimitive>;

export interface RequestOptions {
  authMode?: AuthenticationMode;
  params?: Record<string, QueryValue>;
  data?: unknown;
  headers?: Record<string, string>;
}

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private buildHeaders(
    authMode: AuthenticationMode,
    headers?: Record<string, string>,
  ): Record<string, string> {
    return {
      Accept: 'application/json',
      ...createAuthenticationHeaders(authMode),
      ...headers,
    };
  }

  private buildParams(
    params?: Record<string, QueryValue>,
  ): URLSearchParams | undefined {
    if (!params) {
      return undefined;
    }

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          searchParams.append(key, String(item));
        }
      } else {
        searchParams.append(key, String(value));
      }
    }

    return searchParams;
  }

  private logRequest(
    method: string,
    path: string,
    authMode: AuthenticationMode,
    options: {
      params?: Record<string, QueryValue>;
      data?: unknown;
      headers: Record<string, string>;
    },
  ): void {
    const sanitizedLog = sanitize({
      method,
      path,
      authMode,
      params: options.params ?? {},
      data: options.data ?? null,
      headers: options.headers,
    });

    console.log(
      '[API Request]',
      JSON.stringify(sanitizedLog, null, 2),
    );
  }

  private logResponse(
    method: string,
    path: string,
    response: APIResponse,
  ): void {
    const sanitizedLog = sanitize({
      method,
      path,
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
    });

    console.log(
      '[API Response]',
      JSON.stringify(sanitizedLog, null, 2),
    );
  }

  async get(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const {
      authMode = 'valid',
      params,
      headers,
    } = options;

    const requestHeaders = this.buildHeaders(authMode, headers);
    const requestParams = this.buildParams(params);

    this.logRequest('GET', path, authMode, {
      params,
      headers: requestHeaders,
    });

    const response = await this.request.get(path, {
      params: requestParams,
      headers: requestHeaders,
    });

    this.logResponse('GET', path, response);

    return response;
  }

  async post(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const {
      authMode = 'valid',
      params,
      data,
      headers,
    } = options;

    const requestHeaders = this.buildHeaders(authMode, headers);
    const requestParams = this.buildParams(params);

    this.logRequest('POST', path, authMode, {
      params,
      data,
      headers: requestHeaders,
    });

    const response = await this.request.post(path, {
      params: requestParams,
      data,
      headers: requestHeaders,
    });

    this.logResponse('POST', path, response);

    return response;
  }

  async put(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const {
      authMode = 'valid',
      params,
      data,
      headers,
    } = options;

    const requestHeaders = this.buildHeaders(authMode, headers);
    const requestParams = this.buildParams(params);

    this.logRequest('PUT', path, authMode, {
      params,
      data,
      headers: requestHeaders,
    });

    const response = await this.request.put(path, {
      params: requestParams,
      data,
      headers: requestHeaders,
    });

    this.logResponse('PUT', path, response);

    return response;
  }
}