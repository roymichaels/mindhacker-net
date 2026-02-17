/**
 * Circuit Breaker Fallback Response
 * 
 * When AI gateway is down, returns a structured degraded response
 * based on the user's current context.
 */

import { AuroraContext } from "./contextBuilder.ts";

/**
 * Build a fallback SSE stream that mimics the AI gateway format
 * but contains a static coaching message derived from context.
 */
export function buildFallbackStream(ctx: AuroraContext, language: string): ReadableStream {
  const message = buildFallbackMessage(ctx, language);

  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      // Mimic OpenAI SSE format
      const chunk = {
        id: "fallback",
        object: "chat.completion.chunk",
        choices: [{
          index: 0,
          delta: { content: message },
          finish_reason: null,
        }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));

      // Send finish
      const done = {
        id: "fallback",
        object: "chat.completion.chunk",
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(done)}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

function buildFallbackMessage(ctx: AuroraContext, language: string): string {
  const isHe = language === "he";
  const parts: string[] = [];

  if (isHe) {
    parts.push("🔄 יש לי קושי זמני בחיבור, אבל הנה מה שאני רואה בתוכנית שלך:\n");
  } else {
    parts.push("🔄 I'm having a temporary connection issue, but here's what I see in your plan:\n");
  }

  // Overdue tasks
  if (ctx.action_items.overdue_tasks.length > 0) {
    const label = isHe ? "⚠️ משימות באיחור" : "⚠️ Overdue tasks";
    const items = ctx.action_items.overdue_tasks.slice(0, 3).map(t => `- ${t.title}`).join("\n");
    parts.push(`${label}:\n${items}`);
  }

  // Today's tasks
  if (ctx.action_items.today_tasks.length > 0) {
    const label = isHe ? "📅 משימות להיום" : "📅 Today's tasks";
    const items = ctx.action_items.today_tasks.slice(0, 5).map(t => `- ${t.title} (${t.status})`).join("\n");
    parts.push(`${label}:\n${items}`);
  }

  // Habits status
  if (ctx.habits_status.total > 0) {
    const label = isHe ? "🔄 הרגלים" : "🔄 Habits";
    parts.push(`${label}: ${ctx.habits_status.completed}/${ctx.habits_status.total}`);
  }

  // Closing
  parts.push(isHe ? "\nאחזור בקרוב! 🙏" : "\nI'll be back shortly! 🙏");

  return parts.join("\n");
}
