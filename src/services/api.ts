/**
 * API service type definition.
 * Services receive an api instance from hooks and use it for requests.
 */
export interface ApiService {
  get: (path: string) => Promise<any>;
  post: (path: string, json?: any) => Promise<any>;
  put: (path: string, json?: any) => Promise<any>;
  del: (path: string) => Promise<any>;
}
