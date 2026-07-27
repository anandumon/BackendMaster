import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
type Body = { messages: ChatMessage[]; topicTitle?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.OPENROUTER_API_KEY;
        if (!key) return new Response("Missing OPENROUTER_API_KEY", { status: 500 });
        const body = (await request.json()) as Body;
        if (!Array.isArray(body?.messages)) {
          return new Response("Invalid body", { status: 400 });
        }

        const system: ChatMessage = {
          role: "system",
          content: `You are the AI Teacher for BackendMaster AI, an expert backend developer coach. ${
            body.topicTitle ? `The student is currently studying: "${body.topicTitle}". ` : ""
          }Explain clearly, use analogies, code snippets in fenced markdown blocks, and offer to compare approaches, generate examples, quizzes, or explain like they're five when asked. Keep answers focused and structured.`,
        };

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-3-ultra-550b-a55b:free",
            messages: [system, ...body.messages],
            stream: false,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          return new Response(errText || "Gateway error", { status: res.status });
        }

        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content ?? "";
        return new Response(JSON.stringify({ content }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});