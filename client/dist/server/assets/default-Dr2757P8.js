import { jsx } from "react/jsx-runtime";
import { Suspense } from "react";
function Layout({ children }) {
  return /* @__PURE__ */ jsx(Suspense, { children });
}
export {
  Layout as default
};
