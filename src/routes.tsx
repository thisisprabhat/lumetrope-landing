import type { ComponentType, JSX } from "react";
import Landing from "./pages/Landing";
import { DOCS } from "./docs/nav";
import DocsLayout from "./docs/DocsLayout";
import { LANDING_META, docsMeta } from "./seo/meta";

// MDX pages are eager so they prerender.
const mdxModules = import.meta.glob<{ default: ComponentType }>("./docs/pages/*.mdx", { eager: true });

export interface RouteMeta { title: string; description: string }
export interface AppRoute { path: string; element: JSX.Element; meta: RouteMeta }

export const ROUTES: AppRoute[] = [
  {
    path: "/",
    element: <Landing />,
    meta: LANDING_META,
  },
  ...DOCS.map((d): AppRoute => {
    const Page = mdxModules[`./docs/pages/${d.file}.mdx`].default;
    return {
      path: `/docs/${d.slug}/`,
      element: <DocsLayout slug={d.slug}><Page /></DocsLayout>,
      meta: docsMeta(d),
    };
  }),
];

export const ROUTE_PATHS: string[] = ROUTES.map((r) => r.path);
