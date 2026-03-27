"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────

type Role    = "user" | "assistant" | "system";
type Message = { role: Role; text: string; lang?: string; sources?: string[] };
type History = { role: "user" | "assistant"; content: string };

// ── Suggestions ───────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "What is your Amharic NLP experience?",
  "Tell me about Calldi and the 90% reduction.",
  "How did you reduce Word Error Rate?",
  "ስለ SkillBridge ፕሮጀክት ንገረኝ",
];

// ── API ───────────────────────────────────────────────────────────────────────

async function sendQuestion(
  question: string,
  history: History[]
): Promise<{ answer: string; lang: string; sources: string[] }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

// ── Typewriter ────────────────────────────────────────────────────────────────

function useTypewriter(text: string, active: boolean, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone]           = useState(false);

  useEffect(() => {
    if (!active) { setDisplayed(text); setDone(true); return; }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, active]);

  return { displayed, done };
}

// ── Blinking cursor ───────────────────────────────────────────────────────────

function Cursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ repeat: Infinity, duration: 0.7, ease: "linear", repeatType: "mirror" }}
      className="inline-block w-2 h-4 bg-green-400 ml-0.5 align-middle"
    />
  );
}

// ── Message row ───────────────────────────────────────────────────────────────

function MessageRow({ msg, isLast }: { msg: Message; isLast: boolean }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";
  const { displayed, done } = useTypewriter(msg.text, !isUser && isLast && !isSystem);

  if (isSystem) {
    return (
      <div className="text-green-600 text-xs font-mono opacity-70 py-0.5">
        {msg.text}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-1"
    >
      {/* prompt line */}
      <div className="flex items-start gap-2">
        <span className={`text-xs font-mono shrink-0 mt-0.5 ${isUser ? "text-cyan-400" : "text-green-400"}`}>
          {isUser ? "visitor@cv:~$" : "shuaib@rag:~>"}
        </span>
        <span className={`text-xs font-mono leading-relaxed whitespace-pre-wrap break-words ${isUser ? "text-gray-300" : "text-green-300"}`}>
          {isUser ? msg.text : displayed}
          {!isUser && isLast && !done && <Cursor />}
        </span>
      </div>

      {/* source tags */}
      {!isUser && msg.sources && msg.sources.length > 0 && done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-1.5 pl-[6.5rem]"
        >
          {msg.sources.map((s) => (
            <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-mono text-green-600 bg-green-950/50 border border-green-900/60">
              ↳ {s}
            </span>
          ))}
          {msg.lang === "am" && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-500 bg-amber-950/40 border border-amber-900/50">
              🇪🇹 አማርኛ
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-green-400 shrink-0">shuaib@rag:~&gt;</span>
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            className="w-1 h-1 rounded-full bg-green-400"
          />
        ))}
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────

const BOOT_LINES = [
  "Initialising RAG engine...",
  "Loading CV knowledge base... OK",
  "DeepSeek LLM connected... OK",
  "Bilingual mode: EN + አማርኛ",
  'Type a question or pick a suggestion below.',
];

export default function ChatWidget() {
  const [open, setOpen]         = useState(false);
  const [booted, setBooted]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx]   = useState(-1);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  // boot sequence
  useEffect(() => {
    if (!open || booted) return;
    let delay = 0;
    BOOT_LINES.forEach((line, i) => {
      delay += i === 0 ? 0 : 320;
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "system", text: `// ${line}` }]);
        if (i === BOOT_LINES.length - 1) setBooted(true);
      }, delay);
    });
  }, [open, booted]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 400);
  }, [open]);

  // build history for multi-turn context
  const buildHistory = useCallback((): History[] =>
    messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.text })),
    [messages]
  );

  async function submit(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    setInput("");
    setHistIdx(-1);
    setCmdHistory((h) => [q, ...h].slice(0, 50));
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const { answer, lang, sources } = await sendQuestion(q, buildHistory());
      setMessages((prev) => [...prev, { role: "assistant", text: answer, lang, sources }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Connection error.";
      setMessages((prev) => [...prev, { role: "assistant", text: `ERROR: ${msg}`, sources: [] }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx);
      setInput(cmdHistory[idx] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : cmdHistory[idx]);
    }
  }

  const showSuggestions = booted && messages.filter((m) => m.role === "user").length === 0 && !loading;

  return (
    <>
      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle terminal chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gray-900 border border-green-500/50 shadow-[0_0_20px_rgba(74,222,128,0.2)] flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="text-green-400 font-mono text-lg font-bold">✕</motion.span>
          ) : (
            <motion.span key="t" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="text-green-400 font-mono text-sm font-bold">&gt;_</motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Terminal panel ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[22rem] sm:w-[30rem] flex flex-col rounded-xl border border-green-900/60 bg-gray-950 shadow-[0_0_40px_rgba(74,222,128,0.08)] overflow-hidden"
            style={{ maxHeight: "36rem" }}
          >
            {/* title bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border-b border-green-900/40 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="flex-1 text-center text-xs font-mono text-green-600">
                shuaib@cv-terminal — ask-my-cv
              </span>
              <span className="text-[10px] font-mono text-green-800">RAG v2</span>
            </div>

            {/* output */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2 min-h-0 font-mono">
              {messages.map((m, i) => (
                <MessageRow key={i} msg={m} isLast={i === messages.length - 1} />
              ))}

              {loading && <TypingIndicator />}

              {/* suggestion chips */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col gap-1.5 mt-1"
                >
                  <span className="text-[10px] font-mono text-green-800">// suggested queries:</span>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="text-left text-xs font-mono text-green-600 hover:text-green-300 hover:bg-green-950/40 px-2 py-1 rounded transition-colors border border-transparent hover:border-green-900/50"
                    >
                      &gt; {s}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* input */}
            <form
              onSubmit={(e) => { e.preventDefault(); submit(input); }}
              className="flex items-center gap-2 px-4 py-3 border-t border-green-900/40 bg-gray-900/60 shrink-0"
            >
              <span className="text-xs font-mono text-cyan-400 shrink-0">visitor@cv:~$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ask anything… (↑↓ history)"
                maxLength={500}
                disabled={loading || !booted}
                className="flex-1 bg-transparent text-xs font-mono text-gray-200 placeholder-green-900 focus:outline-none disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || !booted}
                className="text-xs font-mono text-green-500 hover:text-green-300 disabled:opacity-30 transition-colors"
              >
                [enter]
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
