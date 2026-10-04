/// <reference types="vite/client" />
import type { LifespanBridge } from '../shared/api';

declare global {
  interface Window {
    lifespan?: LifespanBridge;
  }
}
