"use client";

import {
  MessageCircle,
  Send,
  Loader2,
  User,
  Sparkles,
  Moon,
  Apple,
  Heart,
  Brain,
  Baby,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

import { useChild } from "@/components/providers/ChildProvider";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
    icon: BookOpen,
    label: "Reading",
    prompt: "How can I encourage a love of reading in my child?",
  },
];

export default function CoachPage() {
  const { selectedChild, selectedChildId } = useChild();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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

      // Handle streaming response
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
      // Remove the empty assistant message on error
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
    <div className="flex h-screen flex-col pt-14 lg:h-screen lg:pt-0">
      {/* Page header */}
      <div className="flex-shrink-0 border-b bg-card/50 px-4 py-4 md:px-6 md:py-5 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coach-muted">
                <MessageCircle className="h-4 w-4 text-coach" />
              </div>
              Coach
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Evidence-based parenting guidance personalized to{" "}
              {selectedChild ? selectedChild.name : "your child"}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              New conversation
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-3 md:px-6 lg:px-8">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          // Empty state with topic suggestions
          <div className="flex h-full flex-col items-center justify-center px-4 py-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-coach-muted">
              <MessageCircle className="h-7 w-7 text-coach" />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">Hi there!</h2>
            <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
              I&apos;m your parenting coach. Ask me anything about{" "}
              {selectedChild ? `${selectedChild.name}'s` : "your child's"} development, behavior,
              sleep, nutrition, or any parenting challenge.
            </p>

            <div className="grid max-w-lg grid-cols-2 gap-2 md:grid-cols-3">
              {TOPIC_SUGGESTIONS.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => handleSend(topic.prompt)}
                  className="flex items-center gap-2 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-accent/50"
                >
                  <topic.icon className="h-4 w-4 flex-shrink-0 text-coach" />
                  <span className="text-xs font-medium text-foreground">{topic.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Message list
          <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-6 lg:px-8">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-coach-muted">
                    <Sparkles className="h-4 w-4 text-coach" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    msg.role === "user" ? "bg-coach text-white" : "border bg-card"
                  }`}
                >
                  <div
                    className={`whitespace-pre-wrap text-sm leading-relaxed ${
                      msg.role === "user" ? "text-white" : "text-foreground"
                    }`}
                  >
                    {msg.content || (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Thinking...
                      </span>
                    )}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t bg-card/50 px-4 py-3 md:px-6 lg:px-8">
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
                className="max-h-[120px] min-h-[44px] w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-coach/50"
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
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-coach text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {streaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Coach uses AI to provide guidance. Always consult a healthcare professional for medical
            concerns.
          </p>
        </div>
      </div>
    </div>
  );
}
