import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import fastifyEnv from "@fastify/env";

const server = Fastify({
  logger: true
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

server.get("/prompt", async (request, reply) => {
  const topics = [
    "adventure", "space", "technology", "mystery", "fantasy",
    "history", "future", "detective", "psychology", "post-apocalypse",
    "mythology", "time travel", "cyberpunk", "survival", "urban legends"
  ];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];

  // Construct the prompt message for the OpenAI Chat API
  const promptMessage = `Create a text instruction for the AI that defines its communication style with the user. The instruction should be concise, written in a single paragraph, and include only interaction rules without greetings or unnecessary details. Each time, generate a new, original instruction to make the AI unique. You can give it a personality, style, or a distinctive manner of communication.. Theme: ${randomTopic}.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Use the chat model with the chat completions endpoint
        messages: [
          { role: "user", content: promptMessage }
        ],
        max_tokens: 150,
        temperature: 0.7,
        n: 1
      })
    });

    const data = await response.json();

    if (!response.ok) {
      reply.status(response.status);
      return { error: data };
    }

    // For chat completions, the generated text is in data.choices[0].message.content
    const generatedInstruction = data.choices[0]?.message?.content?.trim() || "No instruction generated.";
    return { instruction: generatedInstruction };
  } catch (err) {
    reply.status(500);
    return { error: err.message };
  }
});


await server.listen({
  port: process.env.PORT || 3001,
  host: '0.0.0.0',
  listenTextResolver: (address) => {
    return `Server listening on http://${address}`;
  }
});
