import * as Sentry from "@sentry/nextjs";

import { sentryServerOptions } from "./sentry.shared";

Sentry.init(sentryServerOptions);
