import { useActor } from "@caffeineai/core-infrastructure";
import { RefreshCw, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import type { ChatMessage } from "../backend";

interface Message {
  role: "user" | "pookie";
  text: string;
  id: string;
  isError?: boolean;
  /** Tracks how many times the user has retried THIS specific error message */
  retryCount?: number;
}

interface PookieChatProps {
  userName?: string;
}

/**
 * Concise system context — kept under ~250 tokens to prevent truncation.
 * Sent with every request so it must be short.
 */
const SYSTEM_CONTEXT: ChatMessage = {
  role: "system",
  content:
    "You are Pookie Panda \uD83D\uDC3C \u2014 a warm, friendly AI assistant inside Smilify, " +
    "the global happiness platform where people share smiling selfies to spread joy. " +
    "You can ONLY answer questions about these 9 topics related to Smilify:\n" +
    "1. What is Smilify\n" +
    "2. Founders of Smilify\n" +
    "3. Why Smilify (the mission and purpose)\n" +
    "4. Key targets that Smilify looks for\n" +
    "5. How was Smilify made\n" +
    "6. Welfare Fund (how to donate, mission, payment methods)\n" +
    "7. How to use Smilify (posting smiles, stickers, camera)\n" +
    "8. How to use tokens (earning, spending in Pookie Boutique)\n" +
    "9. Starting with your feed (opening capture, global feed, connecting with people)\n\n" +
    "SMILIFY KNOWLEDGE: " +
    "Post smiles via \uD83D\uDCF7 Camera tab \u2192 capture/upload selfie \u2192 decorate with stickers \u2192 Publish. " +
    "New users start with 100 Smile Tokens; earn +10 per smile posted. " +
    "Spend tokens in Pookie Boutique for stickers (Glow is FREE; others: 40\u2013500 tokens). " +
    "Global Happiness Wall shows all smiles; like, share, and win leaderboard badges. " +
    "Welfare Fund: donate from \u20B91 via UPI souramondal033@okicici, GPay, PhonePe, Paytm, " +
    "Net Banking, or Bank Transfer \u2014 tap the Give (heart) tab or Welfare Fund card. " +
    "Founders: Souradipta Mondal and team. Contact: smilifytechhelp@gmail.com.\n\n" +
    "STRICT RULE: If someone asks about ANYTHING outside these 9 Smilify topics, " +
    "respond ONLY with: " +
    '"I can only answer questions about Smilify! Try asking me what Smilify is, about our founders, ' +
    'the welfare fund, or how to get started! \uD83D\uDC3C\u2728"\n\n' +
    "STYLE: Warm, upbeat, playful 'pookie' personality \uD83D\uDC3C\u2728. Use occasional emojis. " +
    "Start every conversation with an interactive greeting question.",
};

/** Unescape JSON-style escape sequences before displaying AI text to the user */
function unescapeText(text: string): string {
  // Full character-by-character scan handling all JSON escape sequences
  let result = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "\\" && i + 1 < text.length) {
      const next = text[i + 1];
      switch (next) {
        case "n":
          result += "\n";
          i += 2;
          break;
        case "t":
          result += "\t";
          i += 2;
          break;
        case "r":
          result += "\r";
          i += 2;
          break;
        case "\\":
          result += "\\";
          i += 2;
          break;
        case '"':
          result += '"';
          i += 2;
          break;
        case "/":
          result += "/";
          i += 2;
          break;
        case "b":
          result += "\b";
          i += 2;
          break;
        case "f":
          result += "\f";
          i += 2;
          break;
        case "u": {
          // \uXXXX unicode escape
          const hex = text.slice(i + 2, i + 6);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) {
            result += String.fromCharCode(Number.parseInt(hex, 16));
            i += 6;
          } else {
            // Not a valid unicode escape — emit literally
            result += text[i];
            i++;
          }
          break;
        }
        default:
          // Unknown escape — keep backslash as-is
          result += text[i];
          i++;
      }
    } else {
      result += text[i];
      i++;
    }
  }
  return result;
}

/**
 * Extracts the text string from a Result_1 value.
 * Result_1 from bindgen always comes as { __kind__: 'ok', ok: string } | { __kind__: 'err', err: string }.
 * This handles all known shapes defensively.
 */
function extractText(raw: unknown): string | null {
  if (typeof raw === "string" && raw.length > 0) return unescapeText(raw);

  if (raw === null || raw === undefined) return null;

  const r = raw as Record<string, unknown>;

  // Primary shape from bindgen: { __kind__: 'ok', ok: string }
  if (r.__kind__ === "ok") {
    const val = r.ok ?? r.text ?? r.value;
    if (typeof val === "string") return unescapeText(val);
    if (val !== null && val !== undefined) return unescapeText(String(val));
    return null;
  }

  // Direct .ok field without __kind__
  if ("ok" in r && typeof r.ok === "string" && r.ok.length > 0) {
    return unescapeText(r.ok);
  }
  if ("ok" in r && r.ok !== null && r.ok !== undefined) {
    return unescapeText(String(r.ok));
  }

  // JSON regex fallback — handles any stringified shape
  try {
    const json = JSON.stringify(raw);
    const match = json.match(/"ok"\s*:\s*"((?:[^"\\]|\\.)*?)"/);
    if (match?.[1]) return unescapeText(match[1]);
  } catch {
    // ignore
  }

  return null;
}

function extractError(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "string") return raw;

  const r = raw as Record<string, unknown>;

  if (r.__kind__ === "err") {
    const val = r.err ?? r.error ?? r.message;
    return typeof val === "string"
      ? val
      : val !== null && val !== undefined
        ? String(val)
        : "unknown-error";
  }
  if ("err" in r) {
    return typeof r.err === "string" ? r.err : String(r.err ?? "unknown-error");
  }

  // JSON regex fallback
  try {
    const json = JSON.stringify(raw);
    const match = json.match(/"err"\s*:\s*"((?:[^"\\]|\\.)*?)"/);
    if (match?.[1]) return match[1];
  } catch {
    // ignore
  }

  return null;
}

function parseResult(
  raw: unknown,
): { ok: true; text: string } | { ok: false; err: string } {
  console.log(
    "[PookieChat] raw result type:",
    typeof raw,
    "shape:",
    raw !== null && typeof raw === "object" ? Object.keys(raw as object) : raw,
  );

  // Check for error first
  const errText = extractError(raw);
  if (errText !== null) {
    // Only treat as error if __kind__ is explicitly "err" or no ok field exists
    const r = raw as Record<string, unknown>;
    const isExplicitErr = r.__kind__ === "err" || ("err" in r && !("ok" in r));
    if (isExplicitErr) {
      console.error("[PookieChat] backend err:", errText);
      return { ok: false, err: errText };
    }
  }

  // Try to extract text
  const text = extractText(raw);
  if (text !== null) {
    console.log("[PookieChat] parsed ok, length:", text.length);
    return { ok: true, text: text.length > 0 ? text : "..." };
  }

  // Nothing worked
  console.error(
    "[PookieChat] unrecognised result shape:",
    JSON.stringify(raw)?.slice(0, 200),
  );
  return { ok: false, err: "empty-response" };
}

function toFriendlyError(err: string): string {
  const e = err.toLowerCase();
  // Case-insensitive passthrough for human-friendly backend strings
  if (
    e.startsWith("i'm having trouble") ||
    e.startsWith("i\u2019m having trouble") ||
    e.startsWith("i received an empty") ||
    e.startsWith("i didn't get") ||
    e.startsWith("i didn\u2019t get") ||
    e.startsWith("i got an empty") ||
    e.startsWith("something unexpected")
  ) {
    console.log(
      "[PookieChat] passing through backend-friendly error:",
      err.slice(0, 80),
    );
    return err;
  }
  if (e === "parse-error" || e.includes("parse") || e.includes("ai_parse"))
    return "Pookie Panda got a bit confused 🐼 Please try asking again!";
  if (e.includes("rate limit") || e.includes("429"))
    return "Too many questions at once, pookie! 🐼 Wait a second and try again.";
  if (e.includes("timeout") || e.includes("timed out"))
    return "Pookie Panda took too long to think 🐼 Try a shorter question!";
  if (e.includes("network") || e.includes("fetch") || e.includes("connect"))
    return "Pookie Panda lost connection 🐼 Check your internet and try again!";
  if (e.includes("not found") || e.includes("404"))
    return "Pookie Panda service is temporarily unavailable 🐼 Try again soon!";
  if (e === "empty-response")
    return "Pookie Panda is thinking... please try again! 🐼";
  if (e === "actor-initializing")
    return "Pookie Panda is waking up 🐼 Give it a second and try again!";
  if (e === "no-actor")
    return "Can't reach Pookie Panda right now 🐼 Please refresh the page!";
  if (err.length > 0)
    return `Pookie Panda ran into an issue 🐼 (${err.slice(0, 80)})`;
  return "Pookie Panda is having a little hiccup 🐼 Try again in a moment!";
}

function scrollBottom(ref: React.RefObject<HTMLDivElement | null>) {
  setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), 50);
}

export function PookieChat({ userName: _userName }: PookieChatProps) {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const msgCounterRef = useRef(0);
  const nextId = useCallback(() => `msg-${++msgCounterRef.current}`, []);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  /**
   * retryCountRef tracks how many retries have been attempted for the current
   * error message so we can cap at 5 without re-rendering on every retry.
   */
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const POOKIE_GREETINGS = [
    "How are you doing today, pookie? 🐼💕",
    "How is your day going, pookie? ✨",
    "Hey pookie! What's making you smile today? 😊",
    "Hello pookie! How are you feeling today? 🌟",
    "Hi pookie! Hope your day is full of smiles! How are you? 🐼",
  ];
  const randomGreeting =
    POOKIE_GREETINGS[Math.floor(Math.random() * POOKIE_GREETINGS.length)] ??
    POOKIE_GREETINGS[0];
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "pookie",
      text: randomGreeting,
      id: "msg-0",
    },
  ]);

  /** Conversation history (user + assistant only) — max 6 turns to avoid token overflow */
  const historyRef = useRef<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) scrollBottom(chatEndRef);
  }, [isOpen]);

  const dispatchMessage = useCallback(
    async (text: string, currentRetryCount = 0) => {
      if (!text.trim() || isTyping) return;

      // ── Actor initialization guard ──────────────────────────────────────
      console.log(
        "[PookieChat] actor check — actor:",
        actor ? "ready" : "not ready",
        "actorFetching:",
        actorFetching,
      );
      if (!actor) {
        const warmupMsg = actorFetching
          ? "Pookie is warming up! Try again in a few seconds 🐼"
          : "Can't reach Pookie Panda right now 🐼 Please refresh the page!";
        setMessages((prev) => [
          ...prev,
          { role: "pookie", text: warmupMsg, id: nextId(), isError: true },
        ]);
        return;
      }

      setIsTyping(true);
      setLastUserMessage(text);
      scrollBottom(chatEndRef);

      // ── Validate & build history snapshot ──────────────────────────────
      const rawHistory = historyRef.current.slice(-6);
      const validHistory = rawHistory.filter((turn) => {
        // Only drop a turn if BOTH role and content are empty — not just content
        const roleEmpty =
          typeof turn.role !== "string" || turn.role.trim().length === 0;
        const contentEmpty =
          typeof turn.content !== "string" || turn.content.trim().length === 0;
        const invalid = roleEmpty && contentEmpty;
        if (invalid) {
          console.warn(
            "[PookieChat] dropping truly empty history turn:",
            JSON.stringify(turn),
          );
        }
        return !invalid;
      });

      const historySnapshot: ChatMessage[] = [SYSTEM_CONTEXT, ...validHistory];
      console.log(
        "[PookieChat] history size (after validation):",
        validHistory.length,
        "total snapshot:",
        historySnapshot.length,
      );

      // Optimistically append user turn to local history
      historyRef.current = [
        ...historyRef.current.slice(-6),
        { role: "user", content: text },
      ];

      console.log("[PookieChat] request built — sending to chatWithPookie");

      try {
        // 60s timeout — IC http-outcalls can be slow
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 60_000),
        );

        const raw = await Promise.race([
          actor.chatWithPookie(text, historySnapshot),
          timeoutPromise,
        ]);

        const parsed = parseResult(raw);
        console.log(
          "[PookieChat] parsed result — ok:",
          parsed.ok,
          parsed.ok ? "text length:" : "err:",
          parsed.ok ? parsed.text.length : parsed.err,
        );

        if (parsed.ok) {
          // Display whitespace-only text as-is (or a subtle placeholder if truly zero-length)
          const aiText = parsed.text.length > 0 ? parsed.text : "...";
          const displayText = aiText.trim().length > 0 ? aiText : "...";
          setMessages((prev) => [
            ...prev,
            { role: "pookie", text: displayText, id: nextId() },
          ]);
          // Keep history trimmed to 6 entries
          historyRef.current = [
            ...historyRef.current,
            { role: "assistant", content: displayText },
          ].slice(-6);
          setLastUserMessage(null);
          retryCountRef.current = 0;
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "pookie",
              text: toFriendlyError(parsed.err),
              id: nextId(),
              isError: true,
            },
          ]);
          historyRef.current = historyRef.current.slice(0, -1);
        }
      } catch (err) {
        const rawMsg = err instanceof Error ? err.message : String(err);
        const isTimeout =
          rawMsg.toLowerCase().includes("timeout") ||
          rawMsg.toLowerCase().includes("timed out");
        console.error("[PookieChat] exception:", rawMsg, err);

        const friendlyText = isTimeout
          ? "Pookie is thinking really hard... it's taking too long. Please try again! 🐼"
          : toFriendlyError(rawMsg);

        setMessages((prev) => [
          ...prev,
          {
            role: "pookie",
            text: friendlyText,
            id: nextId(),
            isError: true,
            retryCount: currentRetryCount,
          },
        ]);
        historyRef.current = historyRef.current.slice(0, -1);
      } finally {
        setIsTyping(false);
        scrollBottom(chatEndRef);
      }
    },
    [actor, actorFetching, isTyping, nextId],
  );

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed, id: nextId() },
    ]);
    setInput("");
    retryCountRef.current = 0;
    await dispatchMessage(trimmed, 0);
  }, [input, isTyping, dispatchMessage, nextId]);

  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessage || isTyping) return;
    const newRetryCount = retryCountRef.current + 1;

    if (newRetryCount > MAX_RETRIES) {
      setMessages((prev) => [
        ...prev,
        {
          role: "pookie",
          text: "Pookie is resting — tap to try again 🐼",
          id: `msg-${++msgCounterRef.current}`,
          isError: true,
          retryCount: newRetryCount,
        },
      ]);
      setLastUserMessage(null);
      retryCountRef.current = 0;
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "pookie",
        text: "Pookie is trying again... 🐼",
        id: `msg-${++msgCounterRef.current}`,
        isError: false,
      },
    ]);

    retryCountRef.current = newRetryCount;
    // 1s delay between retries
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    await dispatchMessage(lastUserMessage, newRetryCount);
  }, [lastUserMessage, isTyping, dispatchMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") sendMessage();
    },
    [sendMessage],
  );

  // ID of the most recent error message (show retry only on last one)
  const lastErrorMsg = [...messages].reverse().find((m) => m.isError);
  const lastErrorId = lastErrorMsg?.id;
  const lastRetryCount = lastErrorMsg?.retryCount ?? 0;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-28 right-6 w-16 h-16 bg-card rounded-full shadow-pookie-lg border-4 border-primary/20 flex items-center justify-center text-4xl z-[400] animate-bounce active:scale-90 transition-transform"
          aria-label="Open Pookie Chat"
          data-ocid="chat.open_modal_button"
        >
          🐼
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-md flex flex-col items-center justify-end md:justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-md bg-card rounded-[3rem] h-[75vh] flex flex-col overflow-hidden shadow-pookie-lg border border-border animate-in slide-in-from-bottom duration-300"
            data-ocid="chat.dialog"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-primary-foreground flex items-center justify-between shadow-pookie shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-3xl animate-pulse">
                  🐼
                </div>
                <div>
                  <h4 className="font-black text-sm tracking-tight">
                    Pookie Panda AI
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-[9px] text-primary-foreground/70 font-black uppercase tracking-widest">
                      Always Happy
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"
                aria-label="Close chat"
                data-ocid="chat.close_button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-background no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "pookie" && (
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-base shrink-0 mr-2 mt-1">
                      🐼
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5 max-w-[80%]">
                    <div
                      className={`p-4 rounded-[2rem] text-[13px] font-bold shadow-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : msg.isError
                            ? "bg-destructive/10 text-destructive rounded-tl-sm border border-destructive/30"
                            : "bg-card text-foreground rounded-tl-sm border border-border"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {/* Retry button — shown only on the latest error, hidden after MAX_RETRIES retries */}
                    {msg.isError &&
                      lastUserMessage &&
                      msg.id === lastErrorId &&
                      lastRetryCount < MAX_RETRIES && (
                        <button
                          type="button"
                          onClick={retryLastMessage}
                          disabled={isTyping}
                          className="self-start flex items-center gap-1.5 text-[11px] font-black text-primary hover:text-primary/70 transition-colors disabled:opacity-50 pl-1"
                          data-ocid="chat.retry_button"
                          aria-label="Retry last message"
                        >
                          <RefreshCw size={12} />
                          Try again
                        </button>
                      )}
                  </div>
                </div>
              ))}

              {/* Typing indicator — visible while waiting for response */}
              {isTyping && (
                <div
                  className="flex justify-start items-end gap-2"
                  data-ocid="chat.loading_state"
                  aria-label="Pookie Panda is thinking"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-base shrink-0">
                    🐼
                  </div>
                  <div className="bg-card px-4 py-3 rounded-[2rem] rounded-tl-sm border border-border flex items-center gap-2 shadow-sm">
                    <span className="text-[11px] font-bold text-muted-foreground mr-0.5">
                      Pookie is thinking
                    </span>
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-5 bg-card border-t border-border shrink-0">
              <div className="flex items-center gap-2 bg-muted/50 px-2 py-2 rounded-[2rem] border border-input focus-within:border-ring transition-colors">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask pookie anything..."
                  disabled={isTyping}
                  className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-bold outline-none placeholder:text-muted-foreground/60 text-foreground disabled:opacity-60"
                  data-ocid="chat.input"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={isTyping || !input.trim()}
                  className="w-11 h-11 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-pookie active:scale-90 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  aria-label="Send message"
                  data-ocid="chat.submit_button"
                >
                  <Send size={18} />
                </button>
              </div>
              {!actor && actorFetching && (
                <p className="text-center text-[10px] text-muted-foreground font-bold mt-2">
                  Connecting to Pookie AI...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PookieChat;
