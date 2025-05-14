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
    // Use environment variables or fallback to defaults
    host: process.env.VITE_HOST || '0.0.0.0',
    allowedHosts: process.env.VITE_ALLOWED_HOST ? 
      [process.env.VITE_ALLOWED_HOST, 'localhost', '127.0.0.1'] : 
      ['localhost', '127.0.0.1', 'voicebot-dev.digitalsamba.com', '.digitalsamba.com'],
    cors: process.env.VITE_ALLOW_ORIGIN === 'true'
  },
};
