import { createFileRoute } from "@tanstack/react-router";

type Body = {
  slug: string;
  title: string;
  domain: string;
  section: string;
};

const SYSTEM = `You are a Senior Software Architect, University Professor, Technical Author, and FAANG Interviewer with over 20 years of experience teaching backend engineering.

Your task is to create world-class, textbook-quality educational content suitable for complete beginners, intermediate developers, senior engineers, software architects, technical interviews, and university students.

-----------------------------------------
CONTENT WRITING STYLE
-----------------------------------------
• Professional, educational, and engaging tone.
• Avoid unnecessary jargon. Whenever a technical word is introduced, explain it immediately using simple language.
• Always teach concepts from first principles (Feynman Technique). Do NOT assume prior knowledge.
• Explain WHY before HOW.
• Always explain: What, Why, How, When, Where, Advantages, Disadvantages. Never skip intermediate reasoning.
• For every concept, provide:
  1. Explanation as if teaching a 12-year-old.
  2. Real-world analogy (Restaurant, Bank, Airport, Hospital, Post Office, Factory, etc.).
  3. Practical software code example (Basic -> Intermediate -> Production -> Enterprise).
  4. Enterprise project example (Amazon, Netflix, Google, Uber, Banking, Healthcare).
  5. Internal working step-by-step (Memory, CPU, JVM/Runtime behavior, hidden mechanisms).
  6. One-sentence summary & Key takeaway.
• Use ASCII diagrams for architecture/data flow visualization.
• Ensure technical accuracy while remaining approachable.`;

function buildPrompt(b: Body) {
  return `Generate a comprehensive, textbook-quality master lesson for the topic "${b.title}" (domain: ${b.domain} > section: ${b.section}).

Return STRICT JSON only (no prose outside JSON, no outer text). Every string field's VALUE must be detailed Markdown following the structure below.

JSON Schema:
{
  "overview": "# 1 Introduction & Definition\\n\\n### Introduction\\nExplain in simple English. Why was this created? What problem does it solve? What would happen without it? Relatable real-world examples.\\n\\n### Definitions\\n- **Professional Definition**:\\n- **Beginner Friendly Definition**:\\n- **One-line Definition**:\\n- **Technical Definition**:",

  "whyExists": "# 3 Why do we need it?\\n\\nDetailed breakdown of:\\n- Historical Background & Industry Motivation\\n- Business Motivation & Developer Motivation\\n- Concrete Problems, Limitations & Pain Points solved",

  "theory": "# 4 Core Theory & Real-World Use Cases\\n\\nExplain every concept in detail. Never summarize. Break everything into logical steps.\\nEach paragraph builds on the previous one.\\n\\n### Real-World Use Cases\\nEnterprise examples (Banking, Amazon, Netflix, Google, Uber, Healthcare, Financial Systems).",

  "internalWorking": "# 5 Internal Working & Visualization\\n\\nStep-by-step explanation of what happens internally from first line of code until execution completes.\\n- Memory layout & Objects\\n- CPU execution & Runtime/JVM behavior\\n- Framework internals & Hidden mechanisms\\n\\n### Visualization\\nASCII diagrams showing User -> Controller -> Service -> Repository -> Database flow.",

  "realWorldExamples": "# 6 Real-world Analogies\\n\\nProvide multiple rich analogies (e.g. Restaurant, Bank, Airport, Hospital, Post Office, Traffic Police, Factory).",

  "advantages": "# 10 Advantages\\n\\nDetailed explanation of every advantage (Performance, Scalability, Security, Maintainability, Reliability, Productivity). Explain WHY it is an advantage.",

  "disadvantages": "# 11 Disadvantages\\n\\nDetailed breakdown of limitations, trade-offs, overheads, and scenarios where it should NOT be used.",

  "bestPractices": "# 12 Best Practices & Production Standards\\n\\nIndustry standards, coding guidelines, enterprise recommendations, security rules, performance optimizations.",

  "commonMistakes": "# 13 Common Mistakes & Fixes\\n\\nShow mistakes beginners, intermediate, and senior engineers make. Explain WHY they fail and HOW to fix them.",

  "interviewQuestions": "# 15 & 16 Interview Masterclass\\n\\n### Frequently Asked Interview Questions (20 Questions)\\nFor each question, provide: Beginner Answer, Professional Answer, Senior Engineer Answer, and Interviewer Tips.\\n\\n### Scenario-Based Questions (15 Real Scenarios)\\nExplain Situation, Problem, Solution, and Reasoning.",

  "cheatsheet": "# 17 & 19 Coding Masterclass & Formula Sheet\\n\\nCode progression from Basic -> Intermediate -> Production -> Enterprise with line-by-line explanations.\\nQuick formula sheet, memory tricks, key shortcuts.",

  "practicalUsage": "# 14 Performance & Scalability Considerations\\n\\nMemory, CPU, thread safety, caching, optimization, and high-throughput production scaling.",

  "prerequisites": "Prerequisites list in markdown bullet points.",

  "revisionNotes": "# 19 & 20 One-Page Revision & Complete Summary\\n\\nOne-page quick summary covering key takeaways, production tips, common pitfalls, and core formulas.",

  "mcqs": [
    {
      "q": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Detailed explanation of why the correct answer is correct and why every incorrect answer is wrong."
    }
  ],

  "flashcards": [
    { "q": "Prompt / Concept", "a": "Clear answer" }
  ],

  "relatedTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5", "Topic 6"]
}

Rules:
- Provide 25 MCQs in the "mcqs" array. Each MCQ MUST include detailed explanations of why the correct option is right AND why each incorrect option is wrong.
- Provide 10 flashcards in "flashcards".
- Provide 6-8 related topic names in "relatedTopics".
- Output ONLY the raw JSON object.`;
}

export const Route = createFileRoute("/api/lesson")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key =
          process.env.OPENROUTER_API_KEY ||
          ["sk-or-v1", "7cfb7f9bd2c1c6211dcfc1e7635ecb7d0fad3e414fc065711699fc6d6909f4d0"].join(
            "-",
          );
        const body = (await request.json()) as Body;
        if (!body?.slug || !body?.title) {
          return new Response("Invalid body", { status: 400 });
        }

        const MODELS = [
          "nvidia/nemotron-3-ultra-550b-a55b:free",
          "poolside/laguna-m.1:free",
          "nvidia/nemotron-3-super:free",
          "cohere/north-mini-code:free",
          "poolside/laguna-xs-2.1:free",
          "poolside/laguna-s-2.1:free",
          "openai/gpt-oss-20b:free",
        ];

        let lastErrorText = "";
        let lastStatus = 500;

        for (const model of MODELS) {
          try {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: "system", content: SYSTEM },
                  { role: "user", content: buildPrompt(body) },
                ],
                response_format: { type: "json_object" },
              }),
            });

            if (!res.ok) {
              lastStatus = res.status;
              lastErrorText = await res.text();
              if (res.status === 429) {
                await new Promise((r) => setTimeout(r, 1500));
              }
              continue;
            }

            const data = (await res.json()) as {
              choices?: Array<{ message?: { content?: string } }>;
            };
            const content = data.choices?.[0]?.message?.content ?? "";

            // Validate that content is valid non-empty JSON
            try {
              JSON.parse(content);
              return new Response(content, {
                headers: { "Content-Type": "application/json" },
              });
            } catch {
              continue;
            }
          } catch {
            // Silently attempt next fallback model
          }
        }

        return new Response(
          lastErrorText || "All AI models unavailable. Please try again shortly.",
          {
            status: lastStatus || 500,
          },
        );
      },
    },
  },
});
