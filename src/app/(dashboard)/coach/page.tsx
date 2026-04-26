"use client";

import {
  Send,
  Loader2,
  User,
  Sparkles,
  Moon,
  Apple,
  Heart,
  Brain,
  Baby,
  AlertTriangle,
  RotateCcw,
  X,
  Clock,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

import { CoachIcon, PlayLabIcon } from "@/components/icons/QuadrantIcons";
import { useChild } from "@/components/providers/ChildProvider";
import { Button } from "@/components/ui/button";

/* ---------- types ---------- */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface DailyTip {
  content: string;
  source: string;
  source_url: string | null;
  category: string | null;
}

interface DailyActivity {
  title: string;
  description: string | null;
  source: string;
  source_url: string | null;
  category: string | null;
  age_min: number | null;
  age_max: number | null;
  duration_minutes: number | null;
  materials: string[] | null;
  steps: string[] | null;
}

/* ---------- topic suggestions ---------- */

const TOPIC_SUGGESTIONS = [
  {
    icon: Moon,
    label: "Sleep training",
    prompt: "What are evidence-based approaches to sleep training for my child?",
  },
  {
    icon: Apple,
    label: "Picky eating",
    prompt: "My child is a picky eater. What strategies can help expand their diet?",
  },
  {
    icon: Heart,
    label: "Tantrums",
    prompt: "How should I handle tantrums in an age-appropriate way?",
  },
  {
    icon: Brain,
    label: "Screen time",
    prompt: "What are the latest guidelines on screen time for young children?",
  },
  {
    icon: Baby,
    label: "Milestones",
    prompt: "What developmental milestones should I be watching for at my child's age?",
  },
  {
    icon: CoachIcon,
    label: "Reading",
    prompt: "How can I encourage a love of reading in my child?",
  },
];

/* ---------- simple markdown renderer ---------- */

function renderMarkdown(text: string) {
  // Basic markdown: **bold**, *italic*, bullet lists, inline citations
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
          {renderInline(line.slice(2))}
        </li>,
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="mb-1 mt-3 text-sm font-semibold">
          {renderInline(line.slice(4))}
        </h4>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="mb-1 mt-3 text-sm font-semibold">
          {renderInline(line.slice(3))}
        </h3>,
      );
    } else if (line.trim() === "") {
      elements.push(<br key={i} />);
    } else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed">
          {renderInline(line)}
        </p>,
      );
    }
  });

  return <>{elements}</>;
}

function renderInline(text: string) {
  // Handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

/* ---------- skeleton ---------- */

function DailyCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border-[0.5px] border-border bg-card p-5">
      <div className="mb-3 h-3 w-24 rounded bg-background-secondary" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-background-secondary" />
        <div className="h-4 w-3/4 rounded bg-background-secondary" />
      </div>
      <div className="mt-4 h-3 w-32 rounded bg-background-secondary" />
    </div>
  );
}

/* ---------- main page ---------- */

export default function CoachPage() {
  const { selectedChild, selectedChildId } = useChild();

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Daily content state
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [tipSaved, setTipSaved] = useState(false);
  const [showActivitySteps, setShowActivitySteps] = useState(false);

  // Fetch daily content
  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const res = await fetch("/api/coach/daily");
        if (res.ok) {
          const data = await res.json();
          setDailyTip(data.tip);
          setDailyActivity(data.activity);
        }
      } catch {
        // Silently fail — cards just won't show
      } finally {
        setDailyLoading(false);
      }
    };
    fetchDaily();
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSaveTip = async () => {
    if (!dailyTip || tipSaved) return;
    try {
      const userId = "demo-user-001"; // TODO: real auth
      await fetch("/api/coach/save-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          childId: selectedChildId,
          content: dailyTip.content,
          source: dailyTip.source,
          category: dailyTip.category,
        }),
      });
      setTipSaved(true);
    } catch {
      // Fail silently
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || streaming) return;

    setInput("");
    setError(null);

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: messageText }];
    setMessages(newMessages);
    setStreaming(true);

    try {
      const res = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          childId: selectedChildId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Chat failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  done = true;
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.text) {
                    assistantContent += parsed.text;
                    setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
                  }
                } catch {
                  // Skip malformed chunks
                }
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
      setMessages(newMessages);
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="animate-fade-in flex h-[calc(100vh-4rem)] flex-col">
      {/* Page header */}
      <div className="flex-shrink-0 px-0 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <CoachIcon size={16} className="text-coach" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-coach">
                Coach
              </span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Parenting guidance</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Evidence-based advice personalized to{" "}
              {selectedChild ? selectedChild.name : "your child"}
            </p>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              New chat
            </Button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="animate-slide-fade-in mb-3 flex items-center gap-2 rounded-xl border-[0.5px] border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto rounded-lg p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-xl border-[0.5px] border-border bg-card">
        {messages.length === 0 ? (
          // Empty state: daily cards + topic suggestions
          <div className="flex h-full flex-col overflow-y-auto px-4 py-6 md:px-6">
            <div className="mx-auto w-full max-w-2xl">
              {/* Daily tip + activity cards */}
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                {/* Tip of the day */}
                {dailyLoading ? (
                  <DailyCardSkeleton />
                ) : dailyTip ? (
                  <div className="group relative rounded-xl border-[0.5px] border-border bg-background p-5 transition-colors hover:border-coach/30">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CoachIcon size={12} className="text-coach" />
                        <span className="text-[10px] font-medium uppercase tracking-wider text-coach">
                          Tip of the day
                        </span>
                      </div>
                      <button
                        onClick={handleSaveTip}
                        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-background-secondary hover:text-foreground"
                        title={tipSaved ? "Saved" : "Save tip"}
                      >
                        {tipSaved ? (
                          <BookmarkCheck className="h-3.5 w-3.5 text-coach" />
                        ) : (
                          <Bookmark className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-foreground">
                      {dailyTip.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">{dailyTip.source}</span>
                      {dailyTip.source_url && (
                        <a
                          href={dailyTip.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[11px] text-coach hover:underline"
                        >
                          Read more
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Activity of the day */}
                {dailyLoading ? (
                  <DailyCardSkeleton />
                ) : dailyActivity ? (
                  <div className="group relative rounded-xl border-[0.5px] border-border bg-background p-5 transition-colors hover:border-play/30">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PlayLabIcon size={12} className="text-play" />
                        <span className="text-[10px] font-medium uppercase tracking-wider text-play">
                          Activity of the day
                        </span>
                      </div>
                      {dailyActivity.duration_minutes && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {dailyActivity.duration_minutes} min
                        </div>
                      )}
                    </div>
                    <h3 className="mb-1 text-sm font-semibold text-foreground">
                      {dailyActivity.title}
                    </h3>
                    {dailyActivity.description && (
                      <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
                        {dailyActivity.description}
                      </p>
                    )}

                    {/* Materials */}
                    {dailyActivity.materials && dailyActivity.materials.length > 0 && (
                      <div className="mb-3">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Materials
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {dailyActivity.materials.map((m, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-background-secondary px-2 py-0.5 text-[11px] text-foreground"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expandable steps */}
                    {dailyActivity.steps && dailyActivity.steps.length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowActivitySteps(!showActivitySteps)}
                          className="flex items-center gap-1 text-[11px] font-medium text-play hover:underline"
                        >
                          <ChevronRight
                            className={`h-3 w-3 transition-transform ${showActivitySteps ? "rotate-90" : ""}`}
                          />
                          {showActivitySteps ? "Hide" : "Show"} steps
                        </button>
                        {showActivitySteps && (
                          <ol className="mt-2 space-y-1 pl-4">
                            {dailyActivity.steps.map((step, i) => (
                              <li
                                key={i}
                                className="list-decimal text-[12px] leading-relaxed text-foreground"
                              >
                                {step}
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {dailyActivity.source}
                      </span>
                      {dailyActivity.source_url && (
                        <a
                          href={dailyActivity.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[11px] text-play hover:underline"
                        >
                          Source
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Greeting + topic suggestions */}
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-coach-muted">
                  <CoachIcon size={24} className="text-coach" />
                </div>
                <h2 className="mb-1 text-base font-semibold text-foreground">
                  What&apos;s on your mind?
                </h2>
                <p className="mb-6 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
                  Ask me anything about {selectedChild ? `${selectedChild.name}'s` : "your child's"}{" "}
                  development, behavior, sleep, nutrition, or any parenting challenge.
                </p>

                <div className="grid max-w-lg grid-cols-2 gap-2 md:grid-cols-3">
                  {TOPIC_SUGGESTIONS.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => handleSend(topic.prompt)}
                      className="flex items-center gap-2 rounded-xl border-[0.5px] border-border bg-background p-3 text-left transition-colors hover:bg-background-secondary"
                    >
                      <topic.icon className="h-3.5 w-3.5 flex-shrink-0 text-coach" size={14} />
                      <span className="text-xs font-medium text-foreground">{topic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Message list with markdown rendering
          <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 md:px-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-coach-muted">
                    <Sparkles className="h-3.5 w-3.5 text-coach" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-foreground text-background"
                      : "border-[0.5px] border-border bg-background"
                  }`}
                >
                  <div
                    className={`text-sm leading-relaxed ${
                      msg.role === "user" ? "text-background" : "text-foreground"
                    }`}
                  >
                    {msg.content ? (
                      msg.role === "assistant" ? (
                        renderMarkdown(msg.content)
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">Thinking...</span>
                      </span>
                    )}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-background-secondary">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 pt-3">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${selectedChild ? selectedChild.name + "'s" : "your child's"} development...`}
                rows={1}
                className="max-h-[120px] min-h-[44px] w-full resize-none rounded-xl border-[0.5px] border-border bg-card px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-coach/30"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 120) + "px";
                }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || streaming}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {streaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Coach uses AI with evidence-based sources. Always consult a healthcare professional for
            medical concerns.
          </p>
        </div>
      </div>
    </div>
  );
}
