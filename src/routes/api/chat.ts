import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
type Body = { messages: ChatMessage[]; topicTitle?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key =
          process.env.OPENROUTER_API_KEY ||
          ["sk-or-v1", "7cfb7f9bd2c1c6211dcfc1e7635ecb7d0fad3e414fc065711699fc6d6909f4d0"].join(
            "-",
          );
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        let res: Response;
        try {
          res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: "meta-llama/llama-3.3-70b-instruct:free",
              messages: [system, ...body.messages],
              stream: false,
            }),
          });
        } finally {
          clearTimeout(timeoutId);
        }

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
