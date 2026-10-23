import { Route, Routes } from "react-router-dom";
import { MDXProvider } from "@mdx-js/react";
import { ROUTES } from "./routes";
import NotFound from "./pages/NotFound";
import "./styles/fonts";
import "./styles/index.css";

export default function App() {
  return (
    <MDXProvider>
      <Routes>
        {ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MDXProvider>
  );
}
