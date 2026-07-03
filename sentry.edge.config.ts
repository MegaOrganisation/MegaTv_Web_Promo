import * as Sentry from "@sentry/nextjs";

import { sentryEdgeOptions } from "./sentry.shared";

Sentry.init(sentryEdgeOptions);
