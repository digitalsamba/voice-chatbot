/**
 * server.js
 *
 * Main server file for the Fastify application.
 * This file sets up the server, loads environment variables, registers the FastifyVite plugin,
 * and defines routes to manage session tokens, session termination, and prompt generation.
 * All functions include detailed comments in British English.
 */

import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import fastifyEnv from "@fastify/env";

// Create a Fastify server instance with logging enabled
const server = Fastify({
  logger: true,
});

// Define a schema for required environment variables
const schema = {
  type: "object",
  required: ["OPENAI_API_KEY"],
  properties: {
    OPENAI_API_KEY: { type: "string" },
  },
};

// Register fastifyEnv to load environment variables from a .env file
await server.register(fastifyEnv, {
  dotenv: true,
  schema: schema,
  data: process.env,
});

// Register FastifyVite to serve the React renderer
await server.register(FastifyVite, {
  root: import.meta.url,
  renderer: "@fastify/react",
});

// Wait until the Vite server is ready
await server.vite.ready();

// Set the maximum allowed concurrent sessions and initialise the active sessions counter
const MAX_SESSIONS = 20;
let activeSessions = 0;

// POST /token route to start a new session by requesting a token from the OpenAI API
server.post("/token", async (request, reply) => {
  const { model, voice, instructions, temperature } = request.body;

  // Check if the number of active sessions has reached the maximum limit
  if (activeSessions >= MAX_SESSIONS) {
    reply.status(429);
    return { error: "API is overloaded, please wait a bit" };
  }

  try {
    // Forward the session creation request to the OpenAI realtime sessions endpoint
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
        temperature,
      }),
    });

    const data = await r.json();

    // If the response is not successful, return the error with the corresponding status code
    if (!r.ok) {
      reply.status(r.status);
      return { error: data };
    }

    // Increment the active sessions counter and log the new session
    activeSessions++;
    server.log.info("New session started. Active sessions: " + activeSessions);

    // Set the Content-Type header and return the token data
    reply.header("Content-Type", "application/json");
    return data;
  } catch (err) {
    // Return a 500 status with the error message in case of failure
    reply.status(500);
    return { error: err.message };
  }
});

// POST /end route to terminate a session and decrement the active sessions counter
server.post("/end", async (request, reply) => {
  activeSessions = Math.max(activeSessions - 1, 0);
  server.log.info(`Session ended by client. Active sessions: ${activeSessions}`);
  reply.send({ status: "ok" });
});

// GET /health route for health checks
server.get("/health", async (request, reply) => {
  reply.send({ status: "ok", timestamp: new Date().toISOString() });
});

// GET /prompt route to generate a new prompt based on a random topic
server.get("/prompt", async (request, reply) => {
  // Define an array of topics for prompt generation
  const topics = [
    "adventure", "space", "technology", "mystery", "fantasy",
    "history", "future", "detective", "psychology", "post-apocalypse",
    "mythology", "time travel", "cyberpunk", "survival", "urban legends"
  ];
  // Select a random topic from the array
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];

  // Construct the prompt message with the selected topic
  const promptMessage = `Create a text instruction for the AI that defines its communication style with the user. The instruction should be concise, written in a single paragraph, and include only interaction rules without greetings or unnecessary details. Each time, generate a new, original instruction to make the AI unique. You can give it a personality, style, or a distinctive manner of communication. Theme: ${randomTopic}.`;

  try {
    // Request a generated prompt from the OpenAI Chat Completions API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: promptMessage }
        ],
        max_tokens: 150,
        temperature: 0.7,
        n: 1,
      }),
    });

    const data = await response.json();

    // If the response is not successful, return the error with the corresponding status code
    if (!response.ok) {
      reply.status(response.status);
      return { error: data };
    }

    // Extract the generated instruction from the API response, or return a default message
    const generatedInstruction = data.choices[0]?.message?.content?.trim() || "No instruction generated.";
    return { instruction: generatedInstruction };
  } catch (err) {
    // Return a 500 status with the error message in case of failure
    reply.status(500);
    return { error: err.message };
  }
});

// Start the server, listening on the specified port and host
await server.listen({
  port: process.env.PORT || 3011,
  host: "0.0.0.0",
  // Custom text for the listening log message
  listenTextResolver: (address) => {
    return `Server listening on ${address}`;
  },
});
