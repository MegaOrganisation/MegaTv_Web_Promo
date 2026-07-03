import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const enabled = Boolean(dsn);

export const sentryEnvironment =
  process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV || "development";

export const sentrySharedOptions = {
  dsn,
  enabled,
  environment: sentryEnvironment,
  sendDefaultPii: false,
  tracesSampleRate: 0.05
} satisfies Pick<BrowserOptions, "dsn" | "enabled" | "environment" | "sendDefaultPii" | "tracesSampleRate">;

export const sentryClientOptions: BrowserOptions = {
  ...sentrySharedOptions,
  integrations: []
};

export const sentryServerOptions: NodeOptions = {
  ...sentrySharedOptions
};

export const sentryEdgeOptions: EdgeOptions = {
  ...sentrySharedOptions
};
