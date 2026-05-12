import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { sanitizeFinalText, sanitizeDelta, newState } from "./sanitizeStream.ts";

Deno.test("strips <think> blocks", () => {
  const out = sanitizeFinalText("<think>let me check timezone</think>היי דין, אני כאן.");
  assertEquals(out, "היי דין, אני כאן.");
});

Deno.test("strips think across chunks", () => {
  const s = newState();
  let out = "";
  out += sanitizeDelta("<think>okay let me ", s);
  out += sanitizeDelta("check the conversation log</think>שלום ", s);
  out += sanitizeDelta("דין", s);
  assertEquals(out, "שלום דין");
});

Deno.test("drops 'Okay, let me' preamble until real text", () => {
  const out = sanitizeFinalText("Okay, let me check the system.\nHi Dean, I'm here.");
  assertEquals(out.includes("Okay"), false);
  assertStringIncludes(out, "Hi Dean");
});

Deno.test("drops 'As Aurora' preamble", () => {
  const out = sanitizeFinalText("As Aurora, I should respond warmly.\nHey, what's up?");
  assertEquals(out.includes("As Aurora"), false);
  assertStringIncludes(out, "Hey");
});

Deno.test("keeps normal greeting untouched", () => {
  const out = sanitizeFinalText("היי דין, אני כאן. רוצה להתחיל בפוקוס?");
  assertEquals(out, "היי דין, אני כאן. רוצה להתחיל בפוקוס?");
});

Deno.test("strips [Reasoning] meta lines anywhere", () => {
  const out = sanitizeFinalText("Hi there.\n[Reasoning] checking history\nWhat shall we do?");
  assertEquals(out.includes("[Reasoning]"), false);
  assertStringIncludes(out, "Hi there.");
  assertStringIncludes(out, "What shall we do?");
});

Deno.test("partial <think tag held in buffer", () => {
  const s = newState();
  let out = "";
  out += sanitizeDelta("hello <thi", s);
  out += sanitizeDelta("nk>secret</think> world", s);
  assertEquals(out, "hello  world");
});