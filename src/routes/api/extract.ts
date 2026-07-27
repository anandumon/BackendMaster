import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Body = {
  fileName: string;
  mimeType: string;
  base64: string;
  hint?: string;
};

const SYSTEM = `You are a curriculum extraction engine. You receive a PDF containing a developer roadmap (from roadmap.sh or similar). Extract EVERY node, subtopic, keyword and hierarchy from the PDF into a strict JSON topic tree. Never merge or summarize distinct nodes. If the roadmap has 300 leaves, return 300 topics.`;

const USER_INSTRUCTIONS = (
  name: string,
  hint?: string,
) => `Analyze the attached PDF "${name}" (a roadmap). Extract the full hierarchy as JSON with this exact schema:

{
  "domainSlug": "kebab-case slug for the whole roadmap, e.g. 'java'",
  "domainTitle": "Human readable title, e.g. 'Java'",
  "icon": "single emoji representing the roadmap",
  "tagline": "one sentence describing the roadmap",
  "sections": [
    {
      "slug": "kebab-case section slug",
      "title": "Section title (top-level roadmap group)",
      "topics": [
        {
          "slug": "kebab-case unique topic slug",
          "title": "Topic name as written in the roadmap",
          "summary": "1-2 sentence description of the topic",
          "confidence": 0.95
        }
      ]
    }
  ],
  "hierarchyDepth": 3,
  "expectedNodeCount": 150,
  "skippedNodes": [
    { "title": "Node name", "reason": "Why it was skipped" }
  ],
  "parseNotes": "Short paragraph on how faithfully the extraction covered the PDF, and any ambiguous or unreadable areas.",
  "warnings": ["short strings describing any nodes that were skipped, illegible, or merged (should ideally be empty)"]
}

Rules:
- Every leaf/keyword in the roadmap MUST become one topic. Do NOT drop items.
- Preserve original ordering.
- Slugs must be lowercase kebab-case, unique within the document, and prefixed with the domain slug (e.g. "java-jvm-internals").
- Return ONLY the JSON object (no prose, no markdown fences).
- For each topic, include a "confidence" field (0.0 to 1.0) indicating how certain you are about the extraction of that particular node. 1.0 = clearly readable, 0.5 = somewhat ambiguous, below 0.3 = guessed.
- "hierarchyDepth" = the maximum nesting depth found in the roadmap (top-level sections = depth 1, topics within = depth 2, etc.)
- "expectedNodeCount" = your best estimate of the total number of unique leaf nodes/topics in the PDF, BEFORE any were skipped.
- "skippedNodes" = array of any nodes you could see but chose to skip or couldn't parse, with reasons.
${hint ? `- Extra hint from the user: ${hint}` : ""}`;

export const Route = createFileRoute("/api/extract")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.OPENROUTER_API_KEY;
        if (!key) return new Response("Missing OPENROUTER_API_KEY", { status: 500 });

        // Verify caller is an authenticated admin
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (!token) return new Response("Unauthorized", { status: 401 });

        const sbUrl = process.env.SUPABASE_URL;
        const sbKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!sbUrl || !sbKey) return new Response("Backend not configured", { status: 500 });
        const sb = createClient<Database>(sbUrl, sbKey, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: userData, error: userErr } = await sb.auth.getUser(token);
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const { data: isAdmin, error: roleErr } = await sb.rpc("has_role", {
          _user_id: userData.user.id,
          _role: "admin",
        });
        if (roleErr || !isAdmin) return new Response("Forbidden — admin only", { status: 403 });

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }
        if (!body?.base64 || !body?.fileName) {
          return new Response("Missing file", { status: 400 });
        }
        const mime = body.mimeType || "application/pdf";
        const dataUrl = body.base64.startsWith("data:")
          ? body.base64
          : `data:${mime};base64,${body.base64}`;

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-3-ultra-550b-a55b:free",
            messages: [
              { role: "system", content: SYSTEM },
              {
                role: "user",
                content: [
                  { type: "text", text: USER_INSTRUCTIONS(body.fileName, body.hint) },
                  {
                    type: "file",
                    file: { filename: body.fileName, file_data: dataUrl },
                  },
                ],
              },
            ],
            response_format: { type: "json_object" },
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
        return new Response(content, {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
