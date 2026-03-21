/**
 * Backend Proxy Utility
 * 
 * This module provides a simple interface for making requests to the EC2 backend
 * through the Vercel proxy, avoiding mixed-content errors.
 * 
 * Usage:
 *   const data = await backendProxy.get('/api/books', { q: 'JavaScript' });
 *   const result = await backendProxy.post('/api/submit', { data: {...} });
 */

type QueryParams = Record<string, string | number | boolean>;
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, any>;
  params?: QueryParams;
};

class BackendProxy {
  private baseUrl = '/api/v1/proxy';

  /**
   * Make a GET request to the backend
   */
  async get(endpoint: string, params?: QueryParams) {
    return this.request(endpoint, { method: 'GET', params });
  }

  /**
   * Make a POST request to the backend
   */
  async post(endpoint: string, data?: Record<string, any>, params?: QueryParams) {
    return this.request(endpoint, { method: 'POST', data, params });
  }

  /**
   * Make a PUT request to the backend
   */
  async put(endpoint: string, data?: Record<string, any>) {
    return this.request(endpoint, { method: 'PUT', data });
  }

  /**
   * Make a DELETE request to the backend
   */
  async delete(endpoint: string, params?: QueryParams) {
    return this.request(endpoint, { method: 'DELETE', params });
  }

  /**
   * Generic request method
   */
  private async request(endpoint: string, options: RequestOptions = {}) {
    const { method = 'GET', data, params } = options;

    // Build query params for the proxy URL
    const proxyParams = new URLSearchParams({
      endpoint,
      ...(params && Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      )),
    });

    const url = `${this.baseUrl}?${proxyParams.toString()}`;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP ${response.status}`,
        }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`Backend proxy error (${endpoint}):`, error.message);
      throw error;
    }
  }
}

export const backendProxy = new BackendProxy();
