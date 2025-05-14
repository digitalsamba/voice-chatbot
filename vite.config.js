//vite.config.js
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import viteReact from "@vitejs/plugin-react";
import viteFastifyReact from "@fastify/react/plugin";

const path = fileURLToPath(import.meta.url);

export default {
  root: join(dirname(path), "client"),
  plugins: [viteReact(), viteFastifyReact()],
  ssr: {
    external: ["use-sync-external-store"],
  },
  server: {
    // Allow all hosts including your dev domains
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'voicebot-dev.digitalsamba.com',
      'dev.example.com',
      '.digitalsamba.com' // Allow all subdomains of digitalsamba.com
    ]
  },
};
