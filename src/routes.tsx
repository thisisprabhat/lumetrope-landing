import type { ComponentType, JSX } from "react";
import Landing from "./pages/Landing";
import { DOCS } from "./docs/nav";

const mdxModules = import.meta.glob<{ default: ComponentType }>("./docs/pages/*.mdx", { eager: true });

export interface RouteMeta { title: string; description: string }
export interface AppRoute { path: string; element: JSX.Element; meta: RouteMeta }

export const ROUTES: AppRoute[] = [
  {
    path: "/",
    element: <Landing />,
    meta: { title: "Lumetrope", description: "Lumetrope: a Lottie and dotLottie animation editor." },
  },
  ...DOCS.map((d): AppRoute => {
    const Page = mdxModules[`./docs/pages/${d.file}.mdx`].default;
    return {
      path: `/docs/${d.slug}/`,
      element: <Page />,
      meta: { title: `${d.title} | Lumetrope Docs`, description: d.description },
    };
  }),
];

export const ROUTE_PATHS: string[] = ROUTES.map((r) => r.path);
