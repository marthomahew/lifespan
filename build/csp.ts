import type { Plugin } from 'vite';

/** The Content-Security-Policy shipped with production builds. */
export const PROD_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-src 'none'",
  "object-src 'none'",
].join('; ');

/** Dev server needs inline styles and websockets for HMR. */
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "connect-src 'self' ws:",
].join('; ');

export function cspPlugin(): Plugin {
  let isBuild = false;
  return {
    name: 'lifespan-csp',
    configResolved(cfg) {
      isBuild = cfg.command === 'build';
    },
    transformIndexHtml(html) {
      const csp = isBuild ? PROD_CSP : DEV_CSP;
      return html.replace(
        '<!--CSP-->',
        `<meta http-equiv="Content-Security-Policy" content="${csp}" />`,
      );
    },
  };
}
