/**
 * Thin fetch wrapper for the Rihlati API.
 *
 * Adds the base path and bearer token, normalises errors into one shape, and
 * refreshes an expired access token once before giving up — so a session that
 * has been open for over an hour keeps working without the viewer noticing.
 */
import { handleDemoRequest } from './demo/server';
import { readStorage, removeStorage, writeStorage } from './storage';

const BASE_URL = '/api/v1';

/**
 * Demo mode: a copy of the API that runs in the browser.
 *
 * Free static hosting cannot run Laravel or MySQL, so the public preview would
 * otherwise show only the marketing pages. Enabled by VITE_DEMO_MODE in that
 * build alone; false everywhere else, where the Laravel API answers instead.
 */
export const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';
const REFRESH_TOKEN_KEY = 'rihlati-refresh-token';

/**
 * The access token lives in memory only. Keeping it out of localStorage means
 * an injected script cannot read it; the longer-lived refresh token is the
 * documented trade-off for surviving a page reload.
 */
let accessToken = null;
let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, { status, errors = {} } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const setAccessToken = (token) => {
  accessToken = token ?? null;
};

export const getAccessToken = () => accessToken;

export const setRefreshToken = (token) => {
  if (token) writeStorage(REFRESH_TOKEN_KEY, token);
  else removeStorage(REFRESH_TOKEN_KEY);
};

export const getRefreshToken = () => readStorage(REFRESH_TOKEN_KEY);

export const clearTokens = () => {
  accessToken = null;
  removeStorage(REFRESH_TOKEN_KEY);
};

async function parse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function refreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  // Concurrent 401s must trigger exactly one refresh.
  refreshPromise ??= fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) return false;
      const body = await parse(response);
      setAccessToken(body?.access_token ?? null);
      setRefreshToken(body?.refresh_token ?? null);
      return Boolean(body?.access_token);
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function send(path, { method = 'GET', body, params, retry = true } = {}) {
  if (IS_DEMO) {
    try {
      return await handleDemoRequest(method, path, body, params);
    } catch (error) {
      throw new ApiError(error.message ?? 'Something went wrong.', {
        status: error.status ?? 500,
        errors: error.errors ?? {},
      });
    }
  }

  const url = new URL(`${BASE_URL}${path}`, window.location.origin);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : null),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : null),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && retry && (await refreshSession())) {
    return send(path, { method, body, params, retry: false });
  }

  const payload = await parse(response);

  if (!response.ok) {
    throw new ApiError(payload?.message ?? 'Something went wrong.', {
      status: response.status,
      errors: payload?.errors ?? {},
    });
  }

  return payload;
}

export const api = {
  get: (path, params) => send(path, { params }),
  post: (path, body) => send(path, { method: 'POST', body }),
  put: (path, body) => send(path, { method: 'PUT', body }),
  patch: (path, body) => send(path, { method: 'PATCH', body }),
  delete: (path) => send(path, { method: 'DELETE' }),
  /** Absolute URL for links the browser fetches itself, e.g. a CSV download. */
  url: (path) => `${BASE_URL}${path}`,
};
