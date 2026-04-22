/**
 * KINLOOP Parenting Coach (Quadrant 4) — Rose accent
 * Chat interface with curated topic cards and book citations
 */
import AppShell from "@/components/AppShell";
import {
  demoChildren,
  demoCoachConversation,
  demoCoachTopics,
  type CoachMessage,
  type CoachTopic,
} from "@/lib/demo-data";
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  BookOpen,
  GraduationCap,
  Heart,
  Monitor,
  Utensils,
  Users,
  Pencil,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const topicIcons: Record<string, typeof Heart> = {
  GraduationCap,
  Heart,
  Monitor,
  Utensils,
  Users,
  Pencil,
};

// Simulated AI responses for demo
const demoResponses: Record<string, { content: string; sources: { book: string; chapter: string }[] }> = {
  default: {
    content: `That's a great question! Based on what I know about Mia (4 years old, at Bright Horizons Preschool), here are some thoughts:\n\nAt this age, children are developing rapidly in their ability to understand and regulate emotions, build friendships, and develop pre-academic skills. The research consistently shows that play-based learning and responsive parenting are the most effective approaches.\n\nWould you like me to dive deeper into any specific aspect? I can draw from Mia's recent school progress report and health records to give more personalized guidance.`,
    sources: [
      { book: 'The Whole-Brain Child', chapter: 'Ch. 1: Parenting with the Brain in Mind' },
      { book: 'Cribsheet', chapter: 'Ch. 12: Preschool' },
    ],
  },
  kindergarten: {
    content: `Great timing to think about kindergarten readiness! Based on Mia's spring progress report from Ms. Rodriguez, here's where she stands:\n\n**Strengths (on track):**\n- Social-emotional: Exceeds expectations — shares well, resolves conflicts with words\n- Language: Strong vocabulary, tells stories with detail\n- Gross motor: Runs, jumps, climbs confidently\n- Math: Counts to 20, sorts by shape and color\n\n**Areas to develop before kindergarten:**\n- Letter recognition: Currently knows 15/26 letters. Aim for all 26 by fall.\n- Fine motor/pencil grip: Ms. Rodriguez specifically flagged this. Practice letter tracing daily (5 minutes is enough).\n- Name writing: Work on writing "Mia" independently.\n\n**What research says:**\nEmily Oster's analysis shows that the strongest predictor of kindergarten success isn't academic skills — it's self-regulation and the ability to follow multi-step instructions. Mia's strong social-emotional scores suggest she's well-positioned.\n\n**Practical next steps:**\n1. Letter tracing worksheets (5 min/day)\n2. Playdough and bead stringing for hand strength\n3. Practice following 2-3 step instructions\n4. Read together daily — point out letters in books`,
    sources: [
      { book: 'Family Firm', chapter: 'Ch. 8: School Decisions' },
      { book: 'The Whole-Brain Child', chapter: 'Ch. 7: The Me-We Connection' },
      { book: 'How to Talk So Kids Will Listen', chapter: 'Ch. 3: Alternatives to Punishment' },
    ],
  },
  screen: {
    content: `Screen time is one of the most researched — and most debated — topics in parenting. Here's what the evidence actually says for a 4-year-old like Mia:\n\n**AAP Guidelines (2023 update):**\n- Ages 2-5: Limit to 1 hour/day of high-quality programming\n- Co-viewing is strongly recommended (watch together, discuss)\n- No screens during meals or 1 hour before bedtime\n\n**What "high-quality" means:**\nPrograms like Sesame Street, Daniel Tiger, and Bluey are specifically designed with developmental research. The key factor isn't screen time quantity alone — it's whether the content is interactive, age-appropriate, and discussed with a caregiver.\n\n**Emily Oster's take:**\nThe data on moderate screen time (1-2 hours) shows minimal negative effects when it replaces passive activities. The concern is when it replaces active play, reading, or social interaction.\n\n**Practical approach for Mia:**\n1. Set a consistent daily limit (e.g., 1 episode after lunch)\n2. Use a visual timer so she knows when it ends\n3. Choose shows that connect to her interests (dinosaurs!)\n4. Talk about what she watched afterward\n5. Keep screens out of the bedroom`,
    sources: [
      { book: 'Cribsheet', chapter: 'Ch. 14: Screen Time' },
      { book: 'AAP Clinical Report', chapter: 'Media and Young Minds (2016, updated 2023)' },
      { book: 'Family Firm', chapter: 'Ch. 6: The Data on Parenting Decisions' },
    ],
  },
};

export default function Coach() {
  const child = demoChildren[0];
  const [messages, setMessages] = useState<CoachMessage[]>(demoCoachConversation);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const content = text || input;
    if (!content.trim()) return;
    setInput("");

    const userMsg: CoachMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let response = demoResponses.default;
      if (content.toLowerCase().includes('kindergarten') || content.toLowerCase().includes('school ready')) {
        response = demoResponses.kindergarten;
      } else if (content.toLowerCase().includes('screen') || content.toLowerCase().includes('tv') || content.toLowerCase().includes('ipad')) {
        response = demoResponses.screen;
      }

      const assistantMsg: CoachMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        sources: response.sources,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleTopicClick = (topic: CoachTopic) => {
    handleSend(topic.title.toLowerCase().includes('kindergarten')
      ? 'How can I prepare Mia for kindergarten? What skills should we focus on?'
      : topic.title.toLowerCase().includes('screen')
      ? 'What are the guidelines for screen time for a 4-year-old?'
      : `Tell me about ${topic.title.toLowerCase()} for a ${child.age} old.`
    );
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col lg:flex-row">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-4 md:px-6 lg:px-8 py-4 border-b border-border bg-card/50">
            <h1 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-rose-light flex items-center justify-center">
                <MessageCircle className="h-4.5 w-4.5 text-rose" />
              </div>
              Parenting Coach
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Evidence-based guidance personalized for {child.name}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-lg ${msg.role === 'user' ? '' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-6 w-6 rounded-full bg-rose-light flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-rose" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">KINLOOP Coach</span>
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-rose text-white rounded-br-md'
                        : 'bg-card border border-border text-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.content.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-semibold mt-2 mb-1">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return <p key={i} className="ml-4 before:content-['•'] before:mr-2 before:text-muted-foreground">{line.slice(2)}</p>;
                      }
                      if (line.match(/^\d+\./)) {
                        return <p key={i} className="ml-4">{line}</p>;
                      }
                      if (line === '') return <br key={i} />;
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-light/50 text-xs text-rose"
                        >
                          <BookOpen className="h-3 w-3" />
                          {src.book} — {src.chapter}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="h-6 w-6 rounded-full bg-rose-light flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-rose" />
                </div>
                <div className="flex gap-1 p-3 rounded-xl bg-card border border-border">
                  <span className="h-2 w-2 rounded-full bg-rose/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-rose/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-rose/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 md:p-6 lg:px-8 border-t border-border bg-card/50">
            <div className="flex gap-2 max-w-2xl">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Ask about ${child.name}...`}
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-rose/30"
              />
              <Button
                size="icon"
                className="bg-rose hover:bg-rose/90 text-white rounded-xl h-11 w-11"
                onClick={() => handleSend()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Topic sidebar */}
        <div className="hidden lg:block w-80 border-l border-border overflow-y-auto bg-card/30 p-5">
          <h2 className="font-heading text-sm font-semibold text-foreground mb-1">
            Topics for your {child.age} old
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Curated guidance based on {child.name}'s age and recent activity
          </p>

          <div className="space-y-2.5">
            {demoCoachTopics.map((topic) => {
              const Icon = topicIcons[topic.icon] || Heart;
              return (
                <button
                  key={topic.id}
                  className="w-full text-left p-3.5 rounded-xl bg-card border border-border hover:border-rose/20 hover:shadow-sm transition-all group"
                  onClick={() => handleTopicClick(topic)}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-light flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-rose" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground group-hover:text-rose transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {topic.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-rose transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Source attribution */}
          <div className="mt-6 p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-rose" />
              <span className="text-xs font-semibold text-foreground">Curated sources</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Siegel & Bryson — Whole-Brain Child</p>
              <p>Faber & Mazlish — How to Talk So Kids Will Listen</p>
              <p>Emily Oster — Cribsheet, Family Firm</p>
              <p>Janet Lansbury — RIE Approach</p>
              <p>AAP Clinical Reports</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
