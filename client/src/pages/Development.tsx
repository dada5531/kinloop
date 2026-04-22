/**
 * KINLOOP Development Hub (Quadrant 2) — Teal accent
 * Growth chart, health timeline, and "ask about your child" chat
 */
import AppShell from "@/components/AppShell";
import { demoChildren, demoHealthRecords, demoGrowthData } from "@/lib/demo-data";
import { useState } from "react";
import {
  TrendingUp,
  Upload,
  MessageSquare,
  FileText,
  Stethoscope,
  GraduationCap,
  ChevronRight,
  Send,
  Ruler,
  Weight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const typeIcons: Record<string, typeof Stethoscope> = {
  'well-visit': Stethoscope,
  'sick': Stethoscope,
  'school_report': GraduationCap,
  'dental': Stethoscope,
};

const typeLabels: Record<string, string> = {
  'well-visit': 'Well-child visit',
  'sick': 'Sick visit',
  'school_report': 'School report',
  'dental': 'Dental visit',
};

export default function Development() {
  const child = demoChildren[0];
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'chat'>('overview');

  const handleAsk = () => {
    if (!chatInput.trim()) return;
    const question = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: question }]);

    // Simulated AI response
    setTimeout(() => {
      let answer = "";
      if (question.toLowerCase().includes("flu") || question.toLowerCase().includes("shot")) {
        answer = "Based on Mia's records, her last flu vaccination was administered during her 4-year well-child visit on March 10, 2026. Her DTaP (4th dose) and IPV (3rd dose) were also updated at that visit. All vaccinations are currently up to date.";
      } else if (question.toLowerCase().includes("motor") || question.toLowerCase().includes("pencil")) {
        answer = "Ms. Rodriguez's spring progress report (April 1, 2026) noted that Mia is 'approaching expectations' for fine motor skills, specifically mentioning pencil grip development. She recommended practicing letter tracing and pencil grip exercises at home. Activities like playdough manipulation and bead stringing can also help strengthen hand muscles.";
      } else {
        answer = `Based on Mia's records, I can help with questions about her growth data, vaccination history, developmental milestones, and school reports. Her most recent well-child visit was March 10, 2026, and her latest school progress report is from April 1, 2026. What would you like to know?`;
      }
      setChatMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    }, 1200);
  };

  const latestGrowth = demoGrowthData[demoGrowthData.length - 1];

  return (
    <AppShell>
      <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-teal-light flex items-center justify-center">
                <TrendingUp className="h-4.5 w-4.5 text-teal" />
              </div>
              Development Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {child.name}'s growth, milestones, and health records
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => toast("Upload a pediatrician summary or school report")}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload record
          </Button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg mb-6 w-fit">
          {(['overview', 'timeline', 'chat'] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' ? 'Overview' : tab === 'timeline' ? 'Timeline' : `Ask about ${child.name}`}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Growth stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Height', value: `${latestGrowth.height}"`, percentile: `${latestGrowth.heightPercentile}th`, icon: Ruler },
                { label: 'Weight', value: `${latestGrowth.weight} lbs`, percentile: `${latestGrowth.weightPercentile}th`, icon: Weight },
                { label: 'Last visit', value: 'Mar 10', percentile: 'Well-child', icon: Stethoscope },
                { label: 'Next visit', value: 'Feb 2027', percentile: '5-year', icon: TrendingUp },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="h-4 w-4 text-teal" />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="font-heading text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-teal">{stat.percentile} percentile</p>
                </div>
              ))}
            </div>

            {/* Growth chart */}
            <div className="bg-card rounded-2xl border border-border p-5 mb-6">
              <h3 className="font-heading text-base font-semibold text-foreground mb-4">Growth chart</h3>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={demoGrowthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="heightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5BA5A5" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#5BA5A5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B7EC8" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#8B7EC8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" />
                    <XAxis
                      dataKey="ageMonths"
                      tick={{ fontSize: 11, fill: '#888' }}
                      tickFormatter={(v) => `${v}mo`}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e0', fontSize: '12px' }}
                      labelFormatter={(v) => `Age: ${v} months`}
                    />
                    <Area type="monotone" dataKey="height" stroke="#5BA5A5" fill="url(#heightGrad)" strokeWidth={2} name="Height (in)" />
                    <Area type="monotone" dataKey="weight" stroke="#8B7EC8" fill="url(#weightGrad)" strokeWidth={2} name="Weight (lbs)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-3 justify-center">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-teal" /> Height (inches)
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-purple" /> Weight (lbs)
                </span>
              </div>
            </div>

            {/* Recent records */}
            <h3 className="font-heading text-base font-semibold text-foreground mb-3">Recent records</h3>
            <div className="space-y-3">
              {demoHealthRecords.map((record) => {
                const Icon = typeIcons[record.type] || FileText;
                return (
                  <div key={record.id} className="p-4 rounded-xl bg-card border border-border hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-foreground">{typeLabels[record.type]}</h4>
                          <Badge variant="secondary" className="text-xs">{new Date(record.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{record.summary}</p>
                        {record.nextAction && (
                          <p className="text-xs text-teal mt-2 flex items-center gap-1">
                            <ChevronRight className="h-3 w-3" />
                            {record.nextAction}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Timeline tab */}
        {activeTab === 'timeline' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-teal/20" />
              {[...demoHealthRecords].reverse().map((record, i) => {
                const Icon = typeIcons[record.type] || FileText;
                return (
                  <div key={record.id} className="relative mb-8">
                    <div className="absolute left-[-20px] h-6 w-6 rounded-full bg-teal-light border-2 border-teal/30 flex items-center justify-center">
                      <Icon className="h-3 w-3 text-teal" />
                    </div>
                    <div className="ml-4 p-4 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {new Date(record.visitDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Badge>
                        <span className="text-xs text-teal font-medium">{typeLabels[record.type]}</span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{record.summary}</p>
                      {record.details && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {Object.entries(record.details).slice(0, 6).map(([key, val]) => (
                            <div key={key} className="text-xs">
                              <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                              <span className="text-foreground font-medium">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Chat tab */}
        {activeTab === 'chat' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col" style={{ minHeight: '400px' }}>
            <div className="flex-1 space-y-4 mb-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-10 w-10 text-teal/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">Ask anything about {child.name}'s records</p>
                  <p className="text-xs text-muted-foreground">
                    Try: "When was Mia's last flu shot?" or "What did her teacher say about fine motor skills?"
                  </p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-teal text-white'
                      : 'bg-card border border-border text-foreground'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                placeholder={`Ask about ${child.name}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
              />
              <Button
                size="icon"
                className="bg-teal hover:bg-teal/90 text-white rounded-xl h-10 w-10"
                onClick={handleAsk}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
