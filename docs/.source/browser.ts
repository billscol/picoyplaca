// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"authentication.mdx": () => import("../content/docs/authentication.mdx?collection=docs"), "errors.mdx": () => import("../content/docs/errors.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "rate-limits.mdx": () => import("../content/docs/rate-limits.mdx?collection=docs"), "restriction-models.mdx": () => import("../content/docs/restriction-models.mdx?collection=docs"), "endpoints/api-keys.mdx": () => import("../content/docs/endpoints/api-keys.mdx?collection=docs"), "endpoints/auth.mdx": () => import("../content/docs/endpoints/auth.mdx?collection=docs"), "endpoints/check.mdx": () => import("../content/docs/endpoints/check.mdx?collection=docs"), "endpoints/cities.mdx": () => import("../content/docs/endpoints/cities.mdx?collection=docs"), "endpoints/index.mdx": () => import("../content/docs/endpoints/index.mdx?collection=docs"), "endpoints/plans.mdx": () => import("../content/docs/endpoints/plans.mdx?collection=docs"), "endpoints/rules.mdx": () => import("../content/docs/endpoints/rules.mdx?collection=docs"), }),
};
export default browserCollections;