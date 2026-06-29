declare global {
  namespace App {
    interface Platform {
      env: Env;
      cf: CfProperties;
      ctx: ExecutionContext;
    }

    interface Locals {
      user: {
        id: string;
        email: string;
        name: string;
      } | null;
      csrfToken?: string;
    }
  }
}

export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  AI?: Ai;
  APP_ENV: string;
  APP_TIMEZONE: string;
  SESSION_SECRET?: string;
}

export {};
