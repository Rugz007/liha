import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import "./misc.css";

import { RouterProvider } from "react-router-dom";
import router from "./routes/routes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider";
import { ENABLE_DEV_TOOLS } from "./lib/feature-flags";

const container = document.getElementById("root");

const root = createRoot(container!);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "always",
    },
    mutations: {
      networkMode: "always",
    },
  },
});

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {ENABLE_DEV_TOOLS && <ReactQueryDevtools initialIsOpen={false} />}
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
