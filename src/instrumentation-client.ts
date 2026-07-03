import * as Sentry from "@sentry/nextjs";

import { sentryClientOptions } from "../sentry.shared";

Sentry.init(sentryClientOptions);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
