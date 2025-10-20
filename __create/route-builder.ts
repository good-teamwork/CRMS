import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Import all route files using Vite's glob import
const routeModules = import.meta.glob('../src/app/api/**/route.js', { eager: true });

// Helper function to transform file path to Hono route path
function getHonoPath(routeFile: string): { name: string; pattern: string }[] {
  // Remove the '../src/app/api' prefix and '/route.js' suffix
  const relativePath = routeFile.replace('../src/app/api', '').replace('/route.js', '');
  const parts = relativePath.split('/').filter(Boolean);
  
  if (parts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  
  const transformedParts = parts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Register all routes
function registerRoutes() {
  // Clear existing routes
  api.routes = [];

  for (const [routeFile, routeModule] of Object.entries(routeModules)) {
    try {
      const route = routeModule as any;
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of methods) {
        try {
          if (route[method]) {
            const parts = getHonoPath(routeFile);
            const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;
            
            const handler: Handler = async (c) => {
              const params = c.req.param();
              return await route[method](c.req.raw, { params });
            };
            
            const methodLowercase = method.toLowerCase();
            switch (methodLowercase) {
              case 'get':
                api.get(honoPath, handler);
                break;
              case 'post':
                api.post(honoPath, handler);
                break;
              case 'put':
                api.put(honoPath, handler);
                break;
              case 'delete':
                api.delete(honoPath, handler);
                break;
              case 'patch':
                api.patch(honoPath, handler);
                break;
              default:
                console.warn(`Unsupported method: ${method}`);
                break;
            }
          }
        } catch (error) {
          console.error(`Error registering route ${routeFile} for method ${method}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error processing route file ${routeFile}:`, error);
    }
  }
}

// Register routes immediately
registerRoutes();

export { api, API_BASENAME };