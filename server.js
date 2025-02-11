// server.js
import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import fastifyEnv from "@fastify/env";
import fs from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const server = Fastify({
  https: {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
  },
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
});


const schema = {
  type: "object",
  required: ["OPENAI_API_KEY"],
  properties: {
    OPENAI_API_KEY: { type: "string" },
  },
};

await server.register(fastifyEnv, {
  dotenv: true,
  schema: schema,
  data: process.env
});

await server.register(FastifyVite, {
  root: import.meta.url,
  renderer: "@fastify/react",
});

await server.vite.ready();

const MAX_SESSIONS = 20;
let activeSessions = 0;

server.post("/token", async (request, reply) => {
  const { model, voice, instructions } = request.body;

  // Проверка лимита активных сессий
  if (activeSessions >= MAX_SESSIONS) {
    reply.status(429);
    return { error: "API перегружено, подождите немного" };
  }

  try {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
        instructions,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      reply.status(r.status);
      // Возвращаем подробную информацию об ошибке
      return { error: data };
    }

    // Увеличиваем счётчик активных сессий
    activeSessions++;
    server.log.info("Новая сессия запущена. Активных сессий: " + activeSessions);

    // Через 5 минут (300 секунд) сессия считается завершённой
    setTimeout(() => {
      activeSessions--;
      server.log.info("Сессия завершена по таймауту. Активных сессий: " + activeSessions);
    }, 300 * 1000);

    reply.header("Content-Type", "application/json");
    return data;
  } catch (err) {
    reply.status(500);
    return { error: err.message };
  }
});
server.post('/end', async (request, reply) => {
  activeSessions = Math.max(activeSessions - 1, 0);
  server.log.info(`Сессия завершена клиентом. Активных: ${activeSessions}`);
  reply.send({ status: 'ok' });
});

server.get("/prompt", async () => {
  const prompts = [
    "Speak like a kind young programmer with extensive experience.",
    "Respond as a friendly mentor with a passion for technology.",
    "Answer as a knowledgeable expert in modern software development.",
  ];
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  return { instruction: randomPrompt };
});

await server.listen({
  port: process.env.PORT || 3001,
  host: '0.0.0.0',
  listenTextResolver: (address) => {
    return `Server listening on https://${address}`;
  }
});