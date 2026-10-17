import { RenderMode, ServerRoute } from '@angular/ssr';
import { routes } from './app.routes';

export const serverRoutes: ServerRoute[] = [
  // Every calculator page is pre-rendered at build time
  ...routes
    .filter(route => route.path !== '**')
    .map(route => ({ path: route.path!, renderMode: RenderMode.Prerender } as ServerRoute)),
  // Unknown URLs are rendered on request with a real 404 status
  { path: '**', renderMode: RenderMode.Server, status: 404 }
];
