// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

Sentry.init({
  dsn: "https://1e6c6354cb52b2887cebb48bf0dd3b8e@o4509841937858560.ingest.us.sentry.io/4509841939431424",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2025-05-24",
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
  debug: process.env.NODE_ENV === "development",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;