/**
 * KINLOOP Parenting Coach (Quadrant 4) — Rose accent
 * RAG-powered chat with parenting knowledge corpus and book citations
 */
import AppShell from "@/components/AppShell";
import { useChild } from "@/contexts/ChildContext";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  Sparkles,
  Loader2,
  BookOpen,
  Plus,
  ChevronRight,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Streamdown } from "streamdown";

const TOPIC_STARTERS = [
  { label: "Managing big emotions", prompt: "My child has been having big emotional outbursts lately. What strategies can help?" },
  { label: "Picky eating", prompt: "My child is a very picky eater. How can I encourage them to try new foods?" },
  { label: "Sleep struggles", prompt: "We're having trouble with bedtime. My child keeps getting out of bed. What can we do?" },
  { label: "Sibling conflicts", prompt: "How do I handle fighting between siblings?" },
  { label: "Screen time balance", prompt: "How much screen time is appropriate and how do I set healthy boundaries?" },
  { label: "Kindergarten readiness", prompt: "How can I prepare my child for starting kindergarten?" },
];

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ book: string; chapter: string }>;
};

type Conversation = {
  id: number;
  childId: number;
  messages: ChatMessage[] | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function Coach() {
  const { selectedChild } = useChild();
  const childId = selectedChild?.id ?? 0;

  const { data: conversations, refetch: refetchConversations } = trpc.coach.conversations.useQuery(
    { childId },
    { enabled: !!childId, staleTime: 10_000 }
  );
  const { data: corpusStatus } = trpc.coach.corpusStatus.useQuery(undefined, {
    enabled: !!childId,
    staleTime: 60_000,
  });

  const chatMutation = trpc.coach.chat.useMutation();
  const seedMutation = trpc.coach.seedCorpus.useMutation();

  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showConvList, setShowConvList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const convList = (conversations ?? []) as Conversation[];

  // Auto-seed corpus on first load
  useEffect(() => {
    if (corpusStatus && !corpusStatus.seeded && childId) {
      seedMutation.mutate(undefined, {
        onSuccess: (result) => {
          if (result.seeded) {
            toast.success(`Knowledge base loaded: ${result.count} parenting insights`);
          }
        },
      });
    }
  }, [corpusStatus?.seeded, childId]);

  // Load conversation messages when selected
  useEffect(() => {
    if (activeConvId) {
      const conv = convList.find((c) => c.id === activeConvId);
      if (conv?.messages) {
        setLocalMessages((conv.messages ?? []) as ChatMessage[]);
      }
    }
  }, [activeConvId, convList]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSend = async (message?: string) => {
    const text = message ?? chatInput;
    if (!childId || !text.trim()) return;
    setChatInput("");
    setChatLoading(true);

    const userMsg: ChatMessage = { role: "user", content: text };
    setLocalMessages((prev) => [...prev, userMsg]);
    setShowConvList(false);

    try {
      const result = await chatMutation.mutateAsync({
        childId,
        message: text,
        conversationId: activeConvId ?? undefined,
      });

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.message.content,
        sources: result.message.sources as ChatMessage["sources"],
      };
      setLocalMessages((prev) => [...prev, assistantMsg]);

      if (!activeConvId && result.conversationId) {
        setActiveConvId(result.conversationId);
      }

      refetchConversations();
    } catch (err) {
      setLocalMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm sorry, I couldn't process that right now. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const startNewConversation = () => {
    setActiveConvId(null);
    setLocalMessages([]);
    setShowConvList(false);
  };

  const openConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setLocalMessages((conv.messages ?? []) as ChatMessage[]);
    setShowConvList(false);
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col">
        {/* Header */}
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-5 border-b border-border bg-card/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!showConvList && (
                <button
                  className="md:hidden text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConvList(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-rose-light flex items-center justify-center">
                    <MessageCircle className="h-4.5 w-4.5 text-rose" />
                  </div>
                  Parenting Coach
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Evidence-based guidance with book citations
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={startNewConversation}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New chat
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation sidebar */}
          <div className={`w-full md:w-72 lg:w-80 border-r border-border overflow-y-auto bg-card/30 ${!showConvList && "hidden md:block"}`}>
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2">
                Conversations ({convList.length})
              </p>
              {convList.length > 0 ? (
                <div className="space-y-1">
                  {convList.map((conv) => (
                    <button
                      key={conv.id}
                      className={`w-full text-left p-3 rounded-lg hover:bg-muted/30 transition-colors ${
                        activeConvId === conv.id ? "bg-rose-light/30" : ""
                      }`}
                      onClick={() => openConversation(conv)}
                    >
                      <p className="text-sm font-medium text-foreground truncate">
                        {conv.messages?.[0]?.content?.slice(0, 50) ?? "New conversation"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(conv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-2 py-4 text-center">
                  <p className="text-xs text-muted-foreground">No conversations yet</p>
                </div>
              )}
            </div>

            {/* Topic starters */}
            <div className="p-3 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2">
                Quick topics
              </p>
              <div className="space-y-1">
                {TOPIC_STARTERS.map((topic, i) => (
                  <button
                    key={i}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-muted/30 transition-colors text-sm text-foreground flex items-center justify-between"
                    onClick={() => {
                      startNewConversation();
                      setTimeout(() => handleSend(topic.prompt), 100);
                    }}
                  >
                    <span className="truncate">{topic.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${showConvList && "hidden md:flex"}`}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {localMessages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <div className="h-14 w-14 rounded-2xl bg-rose-light flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-7 w-7 text-rose" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                      Hi! I'm your parenting coach
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      I draw on evidence-based parenting books and {selectedChild?.name}'s specific context.
                      Ask me anything about child development, behavior, or daily challenges.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {TOPIC_STARTERS.slice(0, 3).map((topic, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs rounded-full"
                          onClick={() => handleSend(topic.prompt)}
                        >
                          {topic.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {localMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] md:max-w-[75%]`}>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-6 w-6 rounded-full bg-rose-light flex items-center justify-center">
                          <Sparkles className="h-3 w-3 text-rose" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">KINLOOP Coach</span>
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-rose text-white rounded-br-md"
                          : "bg-card border border-border text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>

                    {/* Source citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {msg.sources
                          .filter((s, idx, arr) => arr.findIndex((x) => x.book === s.book) === idx)
                          .map((source, j) => (
                            <span
                              key={j}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-light/50 text-xs text-rose"
                            >
                              <BookOpen className="h-3 w-3" />
                              {source.book}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {chatLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-6 w-6 rounded-full bg-rose-light flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-rose" />
                  </div>
                  <div className="flex gap-1 p-3 rounded-xl bg-card border border-border">
                    <span className="h-2 w-2 rounded-full bg-rose/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-rose/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-rose/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card/50">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask about ${selectedChild?.name ?? "your child"}...`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  className="bg-rose hover:bg-rose/90 text-white flex-shrink-0"
                  onClick={() => handleSend()}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Advice is AI-generated from parenting research. Always consult your pediatrician for medical concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
