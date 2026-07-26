// @ts-nocheck
import * as __fd_glob_13 from "../content/docs/endpoints/rules.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/endpoints/plans.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/endpoints/index.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/endpoints/cities.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/endpoints/check.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/endpoints/auth.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/endpoints/api-keys.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/restriction-models.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/rate-limits.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/errors.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/authentication.mdx?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/endpoints/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "endpoints/meta.json": __fd_glob_1, }, {"authentication.mdx": __fd_glob_2, "errors.mdx": __fd_glob_3, "index.mdx": __fd_glob_4, "rate-limits.mdx": __fd_glob_5, "restriction-models.mdx": __fd_glob_6, "endpoints/api-keys.mdx": __fd_glob_7, "endpoints/auth.mdx": __fd_glob_8, "endpoints/check.mdx": __fd_glob_9, "endpoints/cities.mdx": __fd_glob_10, "endpoints/index.mdx": __fd_glob_11, "endpoints/plans.mdx": __fd_glob_12, "endpoints/rules.mdx": __fd_glob_13, });