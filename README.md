This is a full Deep Research Agent with multi-depth LLM orchestration.
You can type any query which you want to research on and get corresponding web-search triggered which later gets summarized into an intuitive and tabular format to consume.

Research pipeline supports three depth modes dispatched from a single
orchestrator interface: single-shot (one Exa search + one synthesis pass),
multi-step (LLM planner generates 3-5 sub-queries via Zod-validated
generateObject, parallel Exa fetches, URL deduplication, then a final
synthesis pass), and iterative (multi-step + a reflective gap-analysis
step that identifies unanswered questions and triggers up to two further
search rounds).

All modes stream structured SSE events over a Node.js ReadableStream
(step / sources / token / error / done), giving the client a depth-agnostic
contract. Synthesis uses OpenRouter-compatible models via
@ai-sdk/openai-compatible; the prompt contract in prompts.ts enforces
citation-grounded markdown with inline [n] references. Model pricing is
normalised from OpenRouter per-token figures to $/M tokens for display.
History persists to localStorage with a 50-entry cap and full state restoration.



Uses [Next.js](https://nextjs.org) bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
