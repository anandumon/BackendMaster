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
CONTENT WRITING STYLE & EXHAUSTIVE COVERAGE
-----------------------------------------
• Professional, educational, and deeply comprehensive tone.
• Avoid vague summaries or high-level overviews. Every lesson MUST explain all underlying subtopics, methods, keywords, syntax rules, and internal mechanics.
• Always teach concepts from first principles (Feynman Technique). Do NOT assume prior knowledge.
• Provide explicit decision matrices for: HOW TO USE IT, WHERE TO USE IT, WHEN TO USE IT, WHY TO USE IT.
• Detail all related subtopics, built-in methods, functional interfaces, parameters, keys, and keywords.
• MANDATORY JAVADOC STANDARDS: Every code snippet MUST feature complete, production-grade Javadoc comments (@param, @return, @throws, @see, @since, @author, @code, @link).
• For every concept, provide:
  1. Explanation as if teaching a 12-year-old.
  2. Real-world analogy (Restaurant, Bank, Airport, Hospital, Post Office, Factory, etc.).
  3. Comprehensive Subtopics & Method Directory (all related functions, syntax, and keywords).
  4. Practical software code example (Basic -> Intermediate -> Production -> Enterprise) with FULL JAVADOC DOCS.
  5. Enterprise project example (Amazon, Netflix, Google, Uber, Banking, Healthcare).
  6. Internal working step-by-step (Memory, CPU, JVM/Runtime behavior, hidden mechanisms).
  7. Decision Matrix: How, When, Where, Why to use.
• Use ASCII diagrams for architecture/data flow visualization.
• Ensure technical accuracy while remaining approachable.`;

function buildPrompt(b: Body) {
  return `Generate an exhaustive, textbook-quality master lesson for the topic "${b.title}" (domain: ${b.domain} > section: ${b.section}).

Return STRICT JSON only (no prose outside JSON, no outer text). Every string field's VALUE must be detailed Markdown following the structure below.

JSON Schema:
{
  "overview": "# 1 Introduction, Definition & Subtopics Breakdown\\n\\n### Introduction\\nExplain in simple English. Why was this created? What problem does it solve? What would happen without it?\\n\\n### Definitions\\n- **Professional Definition**:\\n- **Beginner Friendly Definition**:\\n- **One-line Definition**:\\n- **Technical Definition**:\\n\\n### Subtopics & Key Mechanics Directory\\nExhaustively detail all subtopics under ${b.title}. Detail all sub-types, syntax rules, scope rules, and type inference.\\n\\n### Methods, Functions & Keywords Directory (with Javadoc Specs)\\nProvide an explicit table & list of all related built-in methods, keys, keywords (e.g. static, final, transient, volatile, synchronized, extends, implements, super, this, throws, var), operators, and parameters along with their official Javadoc specification tags (@param, @return, @throws, @see, @since).",

  "whyExists": "# 3 Why do we need it?\\n\\nDetailed breakdown of:\\n- Historical Background & Industry Motivation\\n- Business Motivation & Developer Motivation\\n- Concrete Problems, Limitations & Pain Points solved",

  "theory": "# 4 Core Theory, Decision Matrix & Real-World Use Cases\\n\\nExplain every concept in detail. Never summarize. Break everything into logical steps.\\n\\n### Decision Matrix (How, Where, When, Why)\\n- **HOW TO USE IT**: Step-by-step code and syntax patterns.\\n- **WHERE TO USE IT**: Specific architectural layers (Service layer, Controllers, Async pipelines, Stream processing, DB mapping).\\n- **WHEN TO USE IT**: Ideal scenarios vs scenarios where it MUST BE AVOIDED.\\n- **WHY TO USE IT**: Quantitative & qualitative benefits (Performance, Boilerplate reduction, Thread safety, Scalability).\\n\\n### Real-World Enterprise Use Cases\\nEnterprise examples (Banking, Amazon, Netflix, Google, Uber, Healthcare, Financial Systems).",

  "internalWorking": "# 5 Internal Working & Visualization\\n\\nStep-by-step explanation of what happens internally from first line of code until execution completes.\\n- Memory layout & Objects\\n- CPU execution & Runtime/JVM behavior\\n- Framework internals & Hidden mechanisms\\n\\n### Visualization\\nASCII diagrams showing User -> Controller -> Service -> Repository -> Database flow.",

  "realWorldExamples": "# 6 Real-world Analogies\\n\\nProvide multiple rich analogies (e.g. Restaurant, Bank, Airport, Hospital, Post Office, Traffic Police, Factory).",

  "advantages": "# 10 Advantages\\n\\nDetailed explanation of every advantage (Performance, Scalability, Security, Maintainability, Reliability, Productivity). Explain WHY it is an advantage.",

  "disadvantages": "# 11 Disadvantages\\n\\nDetailed breakdown of limitations, trade-offs, overheads, and scenarios where it should NOT be used.",

  "bestPractices": "# 12 Best Practices, Javadoc Documentation & Production Standards\\n\\nIndustry standards, coding guidelines, enterprise recommendations, security rules, performance optimizations.\\n\\n### Professional Javadoc Documentation Guide\\nExplain how to write clean, standard Javadoc documentation for methods, classes, and fields using tags like @param, @return, @throws, @see, @since, @code, and @deprecated.",

  "commonMistakes": "# 13 Common Mistakes & Fixes\\n\\nShow mistakes beginners, intermediate, and senior engineers make. Explain WHY they fail and HOW to fix them.",

  "interviewQuestions": "# 15 & 16 Interview Masterclass\\n\\n### Frequently Asked Interview Questions (20 Questions)\\nFor each question, provide: Beginner Answer, Professional Answer, Senior Engineer Answer, and Interviewer Tips.\\n\\n### Scenario-Based Questions (15 Real Scenarios)\\nExplain Situation, Problem, Solution, and Reasoning.",

  "cheatsheet": "# 17 & 19 Coding Masterclass, Subtopic Code Progression with Javadoc & Formula Sheet\\n\\nProvide practical code progression covering all subtopics, keywords, and methods. EVERY snippet MUST include production-grade Javadoc comments:\\n1. Basic Code Example (with Javadoc)\\n2. Intermediate Code Example (with Javadoc)\\n3. Production Code Example (with Javadoc)\\n4. Enterprise Microservice Example (with Javadoc)\\n\\nInclude line-by-line explanations for every code snippet, quick formula sheet, memory tricks, key shortcuts.",

  "practicalUsage": "# 14 Performance & Scalability Considerations\\n\\nMemory, CPU, thread safety, caching, optimization, and high-throughput production scaling.",

  "prerequisites": "Prerequisites list in markdown bullet points.",

  "revisionNotes": "# 19 & 20 One-Page Revision & Complete Summary\\n\\nOne-page quick summary covering key takeaways, production tips, common pitfalls, subtopics summary, Javadoc quick reference, and core formulas.",

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
          "inclusionai/ling-3.0-flash:free",
          "nvidia/nemotron-3-super-120b-a12b:free",
          "cohere/north-mini-code:free",
          "poolside/laguna-s-2.1:free",
          "poolside/laguna-xs-2.1:free",
          "nvidia/nemotron-3-nano-30b-a3b:free",
          "openai/gpt-oss-20b:free",
          "google/gemma-4-26b-a4b-it:free",
          "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
          "google/gemma-4-31b-it:free",
          "openrouter/free",
          "meta-llama/llama-3.3-70b-instruct:free",
          "google/gemma-2-9b-it:free",
          "qwen/qwen-2.5-coder-32b-instruct:free",
          "mistralai/mistral-7b-instruct:free",
          "deepseek/deepseek-r1-distill-llama-70b:free",
        ];

        const modelLogs: Array<{
          model: string;
          status?: number;
          error?: string;
          timestamp: string;
        }> = [];

        let lastErrorText = "";
        let lastStatus = 500;

        for (const model of MODELS) {
          const timestamp = new Date().toISOString();
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 9000);

            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${key}`,
              },
              signal: controller.signal,
              body: JSON.stringify({
                model,
                messages: [
                  { role: "system", content: SYSTEM },
                  { role: "user", content: buildPrompt(body) },
                ],
                response_format: { type: "json_object" },
              }),
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
              lastStatus = res.status;
              lastErrorText = await res.text();
              modelLogs.push({
                model,
                status: res.status,
                error: lastErrorText || `HTTP ${res.status}`,
                timestamp,
              });
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
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : "Invalid JSON response";
              modelLogs.push({
                model,
                status: 200,
                error: `JSON Parse error: ${errMsg}`,
                timestamp,
              });
              continue;
            }
          } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : "Fetch timeout / Network error";
            modelLogs.push({
              model,
              status: 0,
              error: errMsg,
              timestamp,
            });
          }
        }

        const userFriendlyMessage =
          "Regeneration is not possible today because todays limit reached";

        return new Response(
          JSON.stringify({
            error: userFriendlyMessage,
            message: userFriendlyMessage,
            details: lastErrorText || "All 17 fallback models attempted without success",
            logs: modelLogs,
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          },
        );
      },
    },
  },
});
