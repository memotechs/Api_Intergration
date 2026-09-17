import type {
  APIRequestContext,
  APIResponse,
} from '@playwright/test';

import {
  createAuthenticationHeaders,
  type AuthenticationMode,
} from './auth';

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

  get(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const {
      authMode = 'valid',
      params,
      headers,
    } = options;

    return this.request.get(path, {
      params: this.buildParams(params),
      headers: this.buildHeaders(authMode, headers),
    });
  }

  post(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const {
      authMode = 'valid',
      params,
      data,
      headers,
    } = options;

    return this.request.post(path, {
      params: this.buildParams(params),
      data,
      headers: this.buildHeaders(authMode, headers),
    });
  }

  put(
    path: string,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const {
      authMode = 'valid',
      params,
      data,
      headers,
    } = options;

    return this.request.put(path, {
      params: this.buildParams(params),
      data,
      headers: this.buildHeaders(authMode, headers),
    });
  }
}